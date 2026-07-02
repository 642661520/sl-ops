import { defineMock } from '@alova/mock'

export default defineMock(
  {
    '[POST]/api/login': ({ data }: { data: Record<string, unknown> }) => {
      const { username, password } = data
      if (username === 'admin' && password === 'admin123') {
        return {
          code: 200,
          msg: '登录成功',
          data: {
            token: `mock_token_${Date.now()}`,
            tokenName: 'Authorization',
            timeout: 7200,
          },
        }
      }
      return { code: 401, msg: '用户名或密码错误', data: null }
    },
  },
  true,
)
