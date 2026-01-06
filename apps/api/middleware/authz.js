import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'
import { readJwtFromReq } from '../config/security.js'

export function requireAuth(req, res, next) {
  try {
    const token = readJwtFromReq(req)
    if (!token) {
      return res.status(401).json({
        error: {
          code: 401,
          message: 'You must be signed in to access this resource.'
        },
      })
    }

    const payload = jwt.verify(token, ENV.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({
      error: {
        code: 401,
        message: 'Your session has expired. Please sign in again.'
      },
    })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 401,
          message: 'You must be signed in to access this resource.',
        },
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 403,
          message: 'You do not have permission to perform this action.',
        },
      })
    }

    next()
  }
}