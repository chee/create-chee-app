#!/usr/bin/env node
import process, {chdir} from "node:process"
import {confirm, intro, text, spinner, outro, log} from "@clack/prompts"
import {copy, readJSON, writeJSON, pathExists} from "fs-extra/esm"
import {execFileSync} from "node:child_process"

const dependencies = new Map<string, string>()
const devDependencies = new Map<string, string>()

function addTypescript() {
	devDependencies.set("typescript", "latest")
}

function addSolid() {
	devDependencies.set("vite", "latest")
	devDependencies.set("vite-plugin-solid", "latest")
	devDependencies.set("vite-plugin-wasm", "latest")
	devDependencies.set("autoprefixer", "latest")
	devDependencies.set("vite-plugin-pwa", "latest")
	devDependencies.set("workbox-window", "latest")

	dependencies.set("@solidjs/router", "latest")
	dependencies.set("solid-js", "latest")
	dependencies.set("@kobalte/core", "latest")
}

function addAutomerge() {
	dependencies.set("@automerge/vanillajs", "latest")
	dependencies.set("@automerge/automerge-repo-solid-primitives", "latest")
}

intro("✨ hello, rabbit! 🐇")
const folderName = await text({
	message: "where do you want it?",
	placeholder: "cool-app",
	validate(name: string) {
		if (!name.length) {
			return "folder needs a name"
		}
	},
})

if (typeof folderName == "symbol") {
	process.exit(22)
}

const dir = `./${folderName}`
if (await pathExists(dir)) {
	log.error(`oh no! ${dir} already exists!`)
	log.message("im feeling anxious about overwriting it, so i'm gonna dip")
	process.exit(48)
}

const useAutomerge = await confirm({
	message: "include automerge?",
	active: "yay",
	inactive: "no thx",
})

if (typeof useAutomerge == "symbol") {
	process.exit(22)
}

if (useAutomerge) {
	addAutomerge()
}

addSolid()
addTypescript()

log.info(`ok!! we're gonna make a new project in ${dir}`)

function getDir(name: string) {
	return new URL(`../${name}`, import.meta.url).pathname
}

let spin = spinner()
spin.start()
spin.message("copying files...")
await copy(getDir("template"), dir)
if (useAutomerge) {
	await copy(getDir("parts/automerge-repo"), dir)
}
spin.stop()

const pkg = await readJSON(getDir("template/package.json"))

await writeJSON(`${dir}/package.json`, pkg, {spaces: "\t"})
chdir(dir)

spin = spinner()

spin.start()
spin.message("installing dependencies")

execFileSync("pnpm", [
	"add",
	...Array.from(dependencies.entries()).map(([k, v]) => `${k}@${v}`),
])

spin.message("installing dev deps")
execFileSync("pnpm", [
	"add",
	"--save-dev",
	...Array.from(devDependencies.entries()).map(([k, v]) => `${k}@${v}`),
])
spin.stop()

log.success("done! yay! 🎉")
outro(`💞
cd ${folderName}
netlify dev
💞`)
process.exit(0)
