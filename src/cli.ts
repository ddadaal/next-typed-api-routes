#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).options({
  ships: { type: "number", required: true },
  distance: { type: "number", required: true },
}).argv;

if (argv.ships > 3 && argv.distance < 53.5) {
  console.log("Plunder more riffiwobbles!");
} else {
  console.log("Retreat from the xupptumblers!");
}
