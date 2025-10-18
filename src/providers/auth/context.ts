import type { User } from '@/payload-types'

import { createContext } from 'react'

// eslint-disable-next-line no-unused-vars
export type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

export type ForgotPassword = (args: { email: string }) => Promise<void> // eslint-disable-line no-unused-vars

export type Create = (args: {
  email: string
  password: string
  passwordConfirm: string
}) => Promise<void> // eslint-disable-line no-unused-vars

export type Login = (args: { email: string; password: string }) => Promise<User> // eslint-disable-line no-unused-vars

export type Logout = () => Promise<void>

export type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void // eslint-disable-line no-unused-vars
  status: 'loggedIn' | 'loggedOut' | undefined
  setStatus: (status: 'loggedIn' | 'loggedOut' | undefined) => void
  user?: User | null
}

export const Context = createContext({} as AuthContext)
