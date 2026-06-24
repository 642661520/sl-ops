import { defineStore } from 'pinia'

interface UserInfo {
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null,
  )

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    // 模拟登录：admin/admin123
    if (username === 'admin' && password === 'admin123') {
      const fakeToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`
      token.value = fakeToken
      userInfo.value = { username }
      localStorage.setItem('token', fakeToken)
      localStorage.setItem('userInfo', JSON.stringify({ username }))
      return
    }
    throw new Error('用户名或密码错误')
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
  }
})
