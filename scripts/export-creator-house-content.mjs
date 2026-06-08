import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const dataPath = path.join(root, 'lib', 'data.ts')
const outPath = path.join(root, 'docs', 'creator-house-content-review.md')

const source = fs.readFileSync(dataPath, 'utf8')
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText

const sandbox = {
  module: { exports: {} },
  exports: {},
  require: () => ({}),
  __dirname: path.dirname(dataPath),
  __filename: dataPath,
  console,
}
sandbox.exports = sandbox.module.exports
vm.runInNewContext(transpiled, sandbox, { filename: 'data.cjs' })

const situations = sandbox.module.exports.SITUATIONS ?? []

const lines = []
lines.push('# Creator House Content Review')
lines.push('')
lines.push('Only situation text + choices.')
lines.push('')

situations.forEach((sit, idx) => {
  lines.push(`## ${idx + 1}. ${sit.id} — ${sit.title}`)
  lines.push(`- Day: ${sit.day}`)
  lines.push(`- Slot: ${sit.slot}`)
  lines.push('')
  lines.push('### Written')
  ;(sit.body ?? []).forEach((p, i) => {
    lines.push(`${i + 1}. ${p}`)
  })
  lines.push('')
  lines.push(`**Question:** ${sit.q}`)
  lines.push('')
  lines.push('### Choices')
  ;(sit.choices ?? []).forEach((choice, choiceIdx) => {
    const letter = choiceIdx === 0 ? 'A' : 'B'
    lines.push(`- ${letter}. ${choice.t}`)
    lines.push(`  - ${choice.s}`)
  })
  lines.push('')
})

fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8')
console.log(`Wrote ${outPath}`)
