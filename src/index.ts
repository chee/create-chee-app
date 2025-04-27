#!/usr/bin/env node
import process, {chdir} from "node:process"
import {confirm, intro, text, spinner, outro, log} from "@clack/prompts"
import {copy, writeJSON, readJSON, pathExists} from "fs-extra/esm"
import {execFileSync} from "node:child_process"

const imports = new Map<string, string>()

function addTypescript() {
	imports.set("npm:typescript", "latest")
}

function addSolid() {
	imports.set("npm:vite", "latest")
	imports.set("npm:vite-plugin-solid", "latest")
	imports.set("npm:vite-plugin-wasm", "latest")
	imports.set("npm:autoprefixer", "latest")
	imports.set("npm:@solidjs/router", "latest")
	imports.set("npm:solid-js", "latest")
	imports.set("npm:vite-plugin-pwa", "latest")
	imports.set("npm:workbox-window", "latest")
	imports.set("npm:@kobalte/core", "latest")
}

function addAutomerge(version = "next") {
	imports.set("npm:@automerge/automerge-repo", version)
	imports.set("npm:@automerge/automerge-repo-network-websocket", version)
	imports.set("npm:@automerge/automerge-repo-storage-indexeddb", version)
	imports.set("npm:solid-automerge", "latest")
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

const denoJSON = await readJSON(getDir("template/deno.jsonc"))

await writeJSON(`${dir}/deno.jsonc`, denoJSON, {spaces: "\t"})
chdir(dir)

spin = spinner()

spin.start()
spin.message("installing dev deps")
execFileSync("deno", [
	"add",
	...Array.from(imports.entries()).map(([k, v]) => `${k}@${v}`),
])
spin.message("installing dev deps")
execFileSync("deno", [
	"add",
	...Array.from(imports.entries()).map(([k, v]) => `${k}@${v}`),
])
spin.stop()

log.success("done! yay! 🎉")
outro(`💞
cd ${folderName}
netlify dev
💞`)
process.exit(0)
