#!/usr/bin/env node

import pathm from "path";
const __file__ = pathm.basename(__filename); // eslint-disable-line @typescript-eslint/no-unused-vars

import consola from "consola";
const console = undefined; // eslint-disable-line @typescript-eslint/no-unused-vars

import yargs from "yargs";

export const command = "mod [arg]";
export const describe = "a mod";

export function builder(yargs: yargs.Argv): yargs.Argv {
  yargs.positional('arg', {
    describe: 'arg',
    type: 'string',
  })
  return yargs;
}

export async function handler(argv: yargs.Arguments): Promise<void> {
  consola.info(`entry: argv =`, argv);
}
