import { readFile } from 'node:fs/promises'

const pattern =
  /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\([a-z0-9-]+\))?!?: .+/

async function main() {
  const args = process.argv.slice(2)
  const messages =
    args[0] === '--file'
      ? (await readFile(args[1], 'utf8')).split('\n').filter(Boolean)
      : [args.join(' ').trim()]

  const invalid = messages.filter((message) => !pattern.test(message))

  if (invalid.length > 0) {
    console.error('Conventional Commits check failed. Invalid message(s):')
    for (const message of invalid) {
      console.error(`- ${message}`)
    }
    process.exit(1)
  }
}

await main()
