#!/usr/bin/env ts-node

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import cpm from "child_process";
import EventEmitter from "events";
import fsm from "fs";
import pathm from "path";
import utilm from "util";

import Consola from "consola";
const consola = Consola.create({throttle: -1, stdout: process.stderr});

// import globby from "globby";
import jfp from "json-file-plus";
import moment from "moment";
import semver from "semver";
import yargsm from "yargs";

const packageData = require("../package"); // eslint-disable-line @typescript-eslint/no-var-requires

const pfsm = {
  chmod: utilm.promisify(fsm.chmod),
  mkdir: utilm.promisify(fsm.mkdir),
  readFile: utilm.promisify(fsm.readFile),
  writeFile: utilm.promisify(fsm.writeFile),
};

const pcpm = {
  exec: utilm.promisify(cpm.exec),
  execFile: utilm.promisify(cpm.execFile),
};

export function waitFor<ReturnType extends any[] = any[]>(options: {event: string}, eventEmitter: EventEmitter): Promise<ReturnType> {
  const { event } = options;
  return new Promise((resolve, reject) => {
    eventEmitter.on(event, (...args: any[]) => {
      resolve(args as ReturnType);
    });
  });
}

export interface IPSpawnOptions extends cpm.SpawnOptions {
  raiseOnError?: boolean;
  capture?: { stderr?: boolean; stdout?: boolean; all?: boolean };
}

export interface IPspawnReturn {
  code: number | null;
  signal: string | null;
  stderr?: string;
  stdout?: string;
}

export function pspawn(args: string[] | string, options?: IPSpawnOptions): Promise<IPspawnReturn> {
  const uargs = Array.isArray(args) ? args : args.split(/\s+/);
  consola.info(`running: ${uargs.join(" ")}`);
  const capout = options && options.capture && (options.capture.stdout || options.capture.all);
  const caperr = options && options.capture && (options.capture.stderr || options.capture.all);
  if (caperr || capout) {
    options = { ...options, stdio: [ "inherit", capout ? "pipe" : "inherit", caperr ? "pipe" : "inherit" ] };
  }
  const cp = cpm.spawn(uargs[0], uargs.slice(1), options || {});
  let stdout: string | undefined = undefined;
  let stderr: string | undefined = undefined;
  if (cp.stdout && capout) { cp.stdout.on("data", (data: any) => { stdout = (stdout || "") + data; }); }
  if (cp.stderr && caperr) { cp.stderr.on("data", (data: any) => { stderr = (stderr || "") + data; }); }
  return waitFor<[number | null, string | null]>({event: "close"}, cp)
    .then((rstatus) => {
      const [code, signal] = rstatus;
      if ((!options || options.raiseOnError !== false) && code !== 0) {
        throw Error(`${uargs.join(" ")} : failed with code=${code} and signal=${signal}`);
      } else {
        const rval: IPspawnReturn = { code, signal };
        if (stdout) { rval.stdout = stdout; }
        if (stderr) { rval.stderr = stderr; }
        return rval;
      }
    });
}

function ospawn(args: string[] | string, options?: IPSpawnOptions) {
  return pspawn(args, { stdio: "inherit", ...options});
}

export async function main(): Promise<void> {
  const parser = yargsm
    .strict()
    .help("h")
    .alias("help", "h")
    .option("verbose", {alias: "v", describe: "increase verbosity", count: true, default: 0})
    .command("run <command>", "", (yargs) => { return yargs; })
    ;

  const parsed = parser.argv;
  (consola as any).level += parsed.verbose;
  consola.debug(`${__filename}: entry ...`);
  consola.debug(`parsed = `, parsed);

  const cpath = parsed._.join("/");
  consola.debug(`cpath = `, cpath);

  if (parsed._[0] === "run") {
    const command = parsed._[1] as string;
    consola.debug(`command = `, cpath);
    let reMatch: RegExpMatchArray | null = null;
    // tslint:disable:no-conditional-assignment
    if (command === "nop") {
      //////////////////////////////////////////////////////////////////////////
    } else if (command === "fix:url") {
      //////////////////////////////////////////////////////////////////////////
      const { stdout } = await ospawn(["git", "remote", "get-url", "origin"], { capture: { stdout: true } });
      const remote = (stdout || "").trim();
      consola.info(`remote = ${remote}`);

      const pjpath = pathm.join(__dirname, "..", "package.json");

      const jsonFile = await jfp(pjpath);
      jsonFile.set({repository: { url: remote }});
      await jsonFile.save();
    } else if (command === "git:hooks:install") {
      //////////////////////////////////////////////////////////////////////////
      await pfsm.writeFile(".git/hooks/pre-commit", `#!/bin/sh\n\nnpm run git:hook:precommit\n`, "utf8");
      await pfsm.chmod(".git/hooks/pre-commit", 0o755);
    } else if (command === "git:hook:precommit") {
      //////////////////////////////////////////////////////////////////////////
      let result;
      let against: string;
      result = await ospawn(["git", "rev-parse", "HEAD"],
        { capture: { stdout: true }, raiseOnError: false });
      if (result.code === 0) {
        against = "HEAD";
      } else {
        result = await ospawn(["git", "hash-object", "-t", "tree", "/dev/null"],
          { capture: { stdout: true }});
        against = result.stdout as string;
      }
      result = await ospawn(`git diff --cached --name-only ${against}`,
        { capture: { stdout: true }});
      const changedFiles = (result.stdout || "").trimRight().split("\n");
      consola.info(`changedFiles = ${changedFiles}`);
      const tsFiles = [];
      for (const changedFile of changedFiles) {
        if (changedFile.match(/^src\/.*[.](ts|tsx|js|jsx)$/)) {
          tsFiles.push(changedFile);
        }
      }
      consola.info(`tsFiles = ${tsFiles}`);
      await ospawn(["tslint", "--project", ".", ...tsFiles]);
    } else if ((reMatch = command.match(/^snapshot(:.*|)$/))) {
      //////////////////////////////////////////////////////////////////////////
      // tslint:disable:no-string-literal
      consola.info(`packageData.version = ${packageData.version}`);
      const revCountString = (await ospawn(["git", "rev-list", "--count", "HEAD"],
        { capture: { stdout: true } })).stdout!.trimRight();
      consola.info(`revCountString = ${revCountString}`);
      const revCount = parseInt(revCountString, 10);
      const revHash = (await ospawn(["git", "rev-parse", "HEAD"],
        { capture: { stdout: true } })).stdout!.trimRight();
      consola.info(`revHash = ${revHash}`);

      const statusString = ((await ospawn(["git", "status", "-s"],
        { capture: { stdout: true } })).stdout || "").trimRight();

      const clean = statusString.length === 0;
      consola.info(`clean = ${clean}`);

      const nibbleCount = 6;

      const revHashPrefixHex = (revHash as string).substring(0, nibbleCount);
      consola.info(`revHashPrefixHex = ${revHashPrefixHex}`);

      const revHashPrefix = parseInt(revHashPrefixHex, 16).toString();
      consola.info(`revHashPrefix = ${revHashPrefix}`);

      const revHashPrefixPad = Math.pow(15, nibbleCount).toString().length;

      const snapString = `${10000 + revCount}` + revHashPrefix.padStart(revHashPrefixPad, "0")
        + (clean ? "0" : "1");
      consola.info(`snapString = ${snapString}`);

      const baseVersion =
        semver.major(packageData.version) +
        "." +
        semver.minor(packageData.version) +
        "." +
        semver.patch(packageData.version);
      consola.info(`baseVersion = ${baseVersion}`);
      if (packageData.version.startsWith(baseVersion) === false) {
        throw Error(
          `Something went wrong as snapshot base version ` +
            `${baseVersion} does not match current version ${packageData.version}`
        );
      }
      const snapVersion = `${baseVersion}-SNAPSHOT.${snapString}`;
      consola.info(`snapVersion = ${snapVersion}`);

      let revert = false;
      process.env["skip_postversion"] = "yes";
      const subcommand = reMatch[1];
      if (subcommand === "" || subcommand === ":publish") {
        await ospawn(["npm", "--no-git-tag-version", "version", snapVersion]);
      }
      if (subcommand === ":publish") {
        await ospawn(["npm", "publish", "--tag", "snapshot"]);
        revert = true;
      }
      if (revert) {
        await ospawn(["npm", "--no-git-tag-version", "version", packageData.version]);
      }
    } else if (command === "postversion") {
      //////////////////////////////////////////////////////////////////////////
      if (process.env["skip_postversion"] === undefined) {
        await ospawn(["git", "push"]);
        await ospawn(["git", "push", "--tags"]);
      }
    } else if (command === "git:tag:version") {
      const gitTag = `v${packageData.version}`;
      await ospawn(["git", "pull"]);
      await ospawn(["git", "tag", gitTag]);
    } else if (command === "git:tag+push:version") {
      const gitTag = `v${packageData.version}`;
      await ospawn(["git", "pull"]);
      await ospawn(["git", "tag", gitTag]);
      await ospawn(["git", "push", "origin", gitTag]);
    } else if (command === "mark") {
      //////////////////////////////////////////////////////////////////////////
      const dateString = `${moment.utc().format("YYMMDDHHmmSS")}`;
      consola.info(`dateString = ${dateString}`);
      await pfsm.writeFile("mark", `${dateString}\n`, "utf8");
      await ospawn(["git", "add", "mark"]);
      await ospawn(["git", "commit", "-m", "change mark"]);
      await ospawn(["git", "push"]);
    } else {
      throw Error(`Unhnalded command ${command}`);
    }
  } else {
    throw Error(`Unhnalded command ${parsed.cpath}`);
  }
}

main().catch((error) => {
  consola.error(`error = `, error);
  process.exitCode = 1;
});
