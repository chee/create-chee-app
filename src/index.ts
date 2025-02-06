#!/usr/bin/env node
import process, {chdir} from "node:process"
import {confirm, intro, text, spinner, outro, log} from "@clack/prompts"
import {copy, writeJSON, readJSON} from "fs-extra/esm"
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
	dependencies.set("solid-js", "latest")
}

function addAutomerge(version = "next") {
	dependencies.set("@automerge/automerge-repo", version)
	dependencies.set("@automerge/automerge-repo-network-websocket", version)
	dependencies.set("@automerge/automerge-repo-storage-indexeddb", version)
	dependencies.set("automerge-repo-solid-primitives", version)
}

intro("✨ hello, rabbit! 🐇")
const name = await text({
	message: "what are we calling it?",
	placeholder: "cool-app",
	validate(name) {
		if (!name.length) {
			return "it's gotta have a name"
		}
	},
})

if (typeof name == "symbol") {
	process.exit(22)
}

const description = await text({
	message: "description",
	placeholder: "a cool app",
})

if (typeof description == "symbol") {
	process.exit(22)
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

const dir = `./${name}`

log.info(`ok!! we're gonna make a new project called ${name} in ${dir}`)

function getDir(name: string) {
	return new URL(`../${name}`, import.meta.url).pathname
}

let spin = spinner()
spin.start()
spin.message("copying files...")
await copy(getDir("template"), dir)
if (useAutomerge) {
	await copy(getDir("parts/automerge-repo"), `${dir}/src/repo`)
}
spin.stop()

const templatePackage = await readJSON(getDir("template/package.json"))

templatePackage.name = name
templatePackage.description = description

writeJSON(`${dir}/package.json`, templatePackage, {spaces: "\t"})
chdir(dir)

const installNow = await confirm({
	message: "pnpm install now?",
	active: "mmhmm",
	inactive: "no thx",
})

if (typeof installNow == "symbol") {
	process.exit(22)
}

spin = spinner()

if (installNow) {
	spin.start()
	spin.message("installing dev deps")
	execFileSync("pnpm", [
		"add",
		...Array.from(devDependencies.entries()).map(([k, v]) => `${k}@${v}`),
	])
	spin.message("installing dev deps")
	execFileSync("pnpm", [
		"add",
		...Array.from(dependencies.entries()).map(([k, v]) => `${k}@${v}`),
	])
	spin.stop()
}

log.success("done! yay! 🎉")
outro(`cd into ${name} and pnpm dev 💞`)
