'use client'

import { AuthContext, Context } from './context'
import { useContext } from 'react'

type UseAuth = () => AuthContext

export const useAuth: UseAuth = () => useContext(Context)
