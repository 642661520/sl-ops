import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// tag 中文名 → 英文模块名 映射
const TAG_MAP = {
  服务信息管理接口: 'service',
  服务器资产管理接口: 'asset',
  服务管控接口: 'service-control',
  监控指标获取接口: 'monitor',
}

const inputFile = resolve(__dirname, '../openapi/ops.openapi.json')
const outputFile = resolve(__dirname, '../openapi/ops.openapi.transformed.json')

const spec = JSON.parse(readFileSync(inputFile, 'utf-8'))

// 重命名 tags 定义
if (spec.tags) {
  for (const tag of spec.tags) {
    if (TAG_MAP[tag.name]) {
      console.log(`  tag: "${tag.name}" → "${TAG_MAP[tag.name]}"`)
      tag.name = TAG_MAP[tag.name]
    }
  }
}

// 重命名 paths 中的 tags 引用
for (const [, pathItem] of Object.entries(spec.paths)) {
  for (const [, operation] of Object.entries(pathItem)) {
    if (operation.tags) {
      operation.tags = operation.tags.map((tag) => TAG_MAP[tag] || tag)
    }
  }
}

writeFileSync(outputFile, JSON.stringify(spec, null, 2), 'utf-8')
console.log(`\nDone → ${outputFile}`)
