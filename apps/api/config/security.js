import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'

const COOKIE_NAME = ENV.COOKIE_NAME || 'groom_jwt'
const JWT_EXPIRES_DAYS = Number(ENV.JWT_EXPIRES_DAYS ?? 7)

export function signJwt(payload) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: `${JWT_EXPIRES_DAYS}d` })
}

export function setAuthCookie(res, token) {
  const isProd = ENV.NODE_ENV === 'production'
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

export function clearAuthCookie(res) {
  const isProd = ENV.NODE_ENV === 'production'
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true, secure: isProd, sameSite: 'lax', path: '/',
  })
}

export function readJwtFromReq(req) {
  return req.cookies?.[COOKIE_NAME]
}
