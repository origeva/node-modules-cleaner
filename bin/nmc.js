#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)
const rmdir = promisify(fs.rmdir)

const search = async (name, base, options) => {
	base = base ? path.normalize(base) : process.cwd()
	let files = await readdir(base)
	let results = []
	for (let i = 0; i < files.length; i++) {
		let currentPath = path.join(base, files[i])
		if ((await stat(currentPath)).isDirectory()) {
			if (files[i] === name) {
				results.push(currentPath)
			} else {
				results.push(...(await search(name, currentPath, options)))
			}
		}
	}

	return results
}

const clean = async (dir) => {
	let files = await readdir(dir)
	for (let file of files) {
		let currentPath = path.join(dir, file)
		if ((await stat(currentPath)).isDirectory()) {
			await clean(currentPath).catch(console.error)
		} else {
			await unlink(currentPath)
		}
	}
	await rmdir(dir)
}
const nmc = async () => {
	let options = {}
	let args = process.argv.slice(2)
	if (args.includes('-l') || args.includes('--log')) options.log = true

	if (options.log) console.log('\x1b[32m', 'Searching...', '\x1b[0m')
	let results = await search('node_modules')
	if (results.length) {
		if (options.log) console.log('Directories found:', results)
		results.map((res) => {
			clean(res).catch(console.error)
		})
		await Promise.all(results)
	} else {
		console.error('\x1b[31m', 'No node_modules directories found', '\x1b[0m')
		process.exit(1)
	}
	console.log('\x1b[32m', 'nmc done!', '\x1b[0m')
}

nmc()
