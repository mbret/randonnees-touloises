import type { User } from '@/payload-types'

import { createContext } from 'react'

export type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

export type ForgotPassword = (args: { email: string }) => Promise<void>

export type Create = (args: {
  email: string
  password: string
  passwordConfirm: string
}) => Promise<void>

export type Login = (args: { email: string; password: string }) => Promise<User>

export type Logout = () => Promise<void>

export type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void
  status: 'loggedIn' | 'loggedOut' | undefined
  setStatus: (status: 'loggedIn' | 'loggedOut' | undefined) => void
  user?: User | null
}

export const Context = createContext({} as AuthContext)
