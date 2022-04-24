#! /usr/bin/env node

const fs = require('fs/promises')
const path = require('path')

const search = async (name, base, options) => {
	base = base ? path.normalize(base) : process.cwd()
	let dir = await fs.readdir(base)
	let results = []
	for (let i = 0; i < dir.length; i++) {
		let currentPath = path.join(base, dir[i])
		if ((await fs.stat(currentPath)).isDirectory()) {
			if (dir[i] === name) {
				results.push(currentPath)
			} else {
				results.push(...(await search(name, currentPath, options)))
			}
		}
	}

	return results
}

const clean = (dir) => {
	return fs.rm(dir, { recursive: true })
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
			clean(res)
		})
		await Promise.allSettled(results)
	} else {
		console.error('\x1b[31m', 'No node_modules directories found', '\x1b[0m')
		process.exit(1)
	}
	console.log('\x1b[32m', 'nmc done!', '\x1b[0m')
}

nmc()
