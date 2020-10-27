#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */

import pathm from "path";
const __file__ = pathm.basename(__filename);

const debugm = require('debug');
const debug = debugm(`tmpl:${__file__}`);
require('debug-trace')({patchOutput: false, overwriteDebugLog: console.error});
import consola from "consola";
(consola as any)._stdout = process.stderr;

import yargs from "yargs";
import * as cliMod from "./cliMod";


export async function main(): Promise<void> {
  const middleware = (args: yargs.Arguments<any>) => {
    consola.level += args.verbose;
    debug(`entry:`, {args, level: consola.level});
  }
  const parser = yargs
    .strict()
    .middleware([middleware])
    .command(cliMod)
    .help("h")
    .alias("help", "h")
    .option("verbose", {alias: "v", describe: "increase verbosity", count: true, default: 0})
    .command("l0c0", "description: l0c0", (yargs) => { return yargs
      .command("l1c0", "description: l1c0", (yargs) => { return yargs
        .option("l1c0o0", {describe: "description: l1c0o0", type: "string", default: "default"});
      });
    })
    .command("l0c1", "description: l0c1", (yargs) => { return yargs; })
    ;

  const parsed = parser.argv;
  consola.level += parsed.verbose;
  consola.debug(`entry ...`);
  consola.debug(`parsed = `, parsed);

  consola.error(`log : error ...`);
  consola.info(`log : info ...`);
  consola.debug(`log : debug ...`);
  consola.trace(`log : trace ...`);
}

main().catch((error) => {
  consola.error(`error =`, error);
  process.exitCode = 1;
});
