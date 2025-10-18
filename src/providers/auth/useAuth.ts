'use client'

import { User } from '@/payload-types'
import { AuthContext, Context } from './context'
import { useContext } from 'react'

type UseAuth<T = User> = () => AuthContext // eslint-disable-line no-unused-vars

export const useAuth: UseAuth = () => useContext(Context)
