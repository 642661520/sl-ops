import { defineStore } from 'pinia'

interface UserInfo {
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const tokenName = ref<string | null>(localStorage.getItem('tokenName'))
  const userInfo = ref<UserInfo | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null,
  )

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const res = await Apis.general.login({ data: { username, password } }).send()
    const { token: t, tokenName: tn } = res.data || {}
    if (!t) throw new Error('登录失败：未获取到 token')
    token.value = t
    tokenName.value = tn || 'Authorization'
    userInfo.value = { username }
    localStorage.setItem('token', t)
    localStorage.setItem('tokenName', tn || 'Authorization')
    localStorage.setItem('userInfo', JSON.stringify({ username }))
  }

  function logout() {
    token.value = null
    tokenName.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('tokenName')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    tokenName,
    userInfo,
    isLoggedIn,
    login,
    logout,
  }
})
