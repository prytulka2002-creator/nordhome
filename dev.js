import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')
const vite = spawn(process.execPath, [viteBin], {stdio:'inherit'})
const api = spawn(process.execPath, ['--watch', path.join(__dirname,'server.js')], {stdio:'inherit'})

function stop() { vite.kill(); api.kill() }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
vite.on('exit', code => { api.kill(); process.exit(code ?? 0) })
api.on('exit', code => { vite.kill(); if (code) process.exit(code) })
