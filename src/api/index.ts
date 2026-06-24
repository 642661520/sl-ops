import { createApis, withConfigType } from './createApis'
import { alovaInstance } from './instance'

export { alovaInstance }

export const $$userConfigMap = withConfigType({})

export const Apis = createApis(alovaInstance, $$userConfigMap)
