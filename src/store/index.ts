import { createStore } from 'vuex'
import AuthService from '../service/auth.service'

const user = JSON.parse(localStorage.getItem('userData')!)

const initialState = { status: { loggedIn: !!user }, user }

const store = createStore({
  // modules: {
  //   auth,
  // },
  state: { initialState },
  actions: {
    async login({ commit }: { commit: any }, user: any) {
      try {
        const userDB = await AuthService.login(user)

        commit('loginSuccess', user)

        return Promise.resolve(user)
      }
      catch (error) {
        commit('loginFailure')

        return Promise.reject(error)
      }
    },
    logout({ commit }: { commit: any }) {
      AuthService.logout()
      commit('logout')
    },
  },
  mutations: {
    loginSuccess(state: any, user: any) {
      state.initialState.status.loggedIn = true

      state.user = user
    },
    loginFailure(state: any) {
      state.initialState.status.loggedIn = false
      state.user = null
    },
    logout(state: any) {
      state.initialState.status.loggedIn = false
      state.user = null
    },
    registerSuccess(state: any) {
      state.initialState.status.loggedIn = false
    },
    registerFailure(state: any) {
      state.initialState.status.loggedIn = false
    },
  },
  getters: {
    usersss: state => state.initialState.status.loggedIn,
  },
})

export default store
