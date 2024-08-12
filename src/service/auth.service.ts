import request, { setAuth } from '../utils2/request'

const API_URL = 'admin/auth/signin'

class AuthService {
  async login(user: any) {
    const res = await request.post(API_URL, {
      username: user.username,
      password: user.password,
    })

    if (res.data.success === true) {
      console.log(res.data)
      localStorage.setItem('userData', JSON.stringify(res.data.userData))
      localStorage.setItem('accessToken', JSON.stringify(res.data.accessToken))
      localStorage.setItem('userAbilities', JSON.stringify(res.data.userAbilities))
      setAuth()

      return res.data.data
    }
    else {
      return res.data.message
    }
  }

  logout() {
    localStorage.removeItem('user')
  }
}

export default new AuthService()
