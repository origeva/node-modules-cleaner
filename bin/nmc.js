#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)
const rmdir = promisify(fs.rmdir)

if (!Promise.allSettled) {
  Promise.allSettled = promises =>
    Promise.all(
      promises.map((promise) =>
        promise
          .then(value => ({
            status: "fulfilled",
            value,
          }))
          .catch(reason => ({
            status: "rejected",
            reason,
          }))
      )
    );
}

const search = async (name, base, options) => {
	base = base ? path.normalize(base) : process.cwd()
	let files = await readdir(base)
	let results = []
	let actions = files.map(async (file) => {
		let currentPath = path.join(base, file)
		if ((await stat(currentPath)).isDirectory()) {
			if (file === name) {
				results.push(currentPath)
			} else {
				results.push(...(await search(name, currentPath, options)))
			}
		}
	})
	await Promise.allSettled(actions)

	return results
}

const clean = async (dir) => {
	let files = await readdir(dir)
	let actions = files.map(async (file) => {
		let currentPath = path.join(dir, file)
		if ((await stat(currentPath)).isDirectory()) {
			await clean(currentPath)
		} else {
			await unlink(currentPath)
		}
	})
	await Promise.allSettled(actions)
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
		let actions = results.map(async (res) => {
			await clean(res)
		})
		await Promise.allSettled(actions)
	} else {
		console.error('\x1b[31m', 'No node_modules directories found', '\x1b[0m')
		process.exit(1)
	}
	console.log('\x1b[32m', 'nmc done!', '\x1b[0m')
}

nmc()
