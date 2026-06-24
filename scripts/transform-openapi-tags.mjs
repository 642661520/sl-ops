import { copyFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeAuthHeaders, formatTag } from '../alova.shared.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const srcFile = resolve(__dirname, '../openapi/ops.openapi.json')
const outFile = resolve(__dirname, '../openapi/ops.openapi.transformed.json')

// 1. 复制原始文件 → 转换产物
copyFileSync(srcFile, outFile)

// 2. 移除认证 header（避免生成不需要的 Authorization 参数）
removeAuthHeaders(outFile)

// 3. tag 中文 → 英文映射
const TAG_MAP = {
  服务信息管理接口: 'service',
  服务器资产管理接口: 'asset',
  服务管控接口: 'service-control',
  监控指标获取接口: 'monitor',
}
formatTag(outFile, TAG_MAP)

// 4. 拍平 allOf + discriminator（如果项目有基类 schema，在这里调用）
// flattenAllOf(outFile, 'BaseSchemaName')

console.log(`Done → ${outFile}`)
