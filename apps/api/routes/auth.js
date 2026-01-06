import { Router } from 'express'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { pool } from '../db/db.js'
import { signJwt, setAuthCookie, clearAuthCookie } from '../config/security.js'
import { requireAuth } from '../middleware/authz.js'
import { validateRegister, validateLogin } from '../middleware/validate-auth.js'
import { ENV } from '../config/env.js'

export const auth = Router()


auth.post('/api/auth/register', validateRegister, async (req,res,next)=>{
  try {
    const { email, password, firstName, lastName } = req.body

    const exists = await pool.query(
      'SELECT oauth_provider FROM users WHERE email=$1',
      [email]
    )

    if (exists.rowCount) {
      const prov = exists.rows[0].oauth_provider

      let message = 'This email is already registered. Please sign in instead.'

      if (prov === 'google') {
        message = 'This email is already associated with a Google account. Please sign in with Google.'
      }

      return res.status(409).json({
        error: {
          code: 409,
          message,
        },
      })
    }

    const saltRounds = 12
    const hash = await bcrypt.hash(password, saltRounds)
    const ins = await pool.query(
      `INSERT INTO users(email,password_hash,first_name,last_name)
       VALUES ($1,$2,$3,$4)
       RETURNING id,email,first_name,last_name,role,created_at`,
      [email, hash, firstName ?? null, lastName ?? null]
    )

    const u = ins.rows[0]
    const token = signJwt({ id: u.id, email: u.email, role: u.role })
    setAuthCookie(res, token)

    res.status(201).json({
      message: 'Account created successfully.',
      user: u,
    })
  } catch(e){ next(e) }
})



auth.post('/api/auth/login', validateLogin, async (req,res,next)=>{
  try {
    const { email, password } = req.body
    const q = await pool.query('SELECT * FROM users WHERE email=$1',[email])

    if (!q.rowCount || !q.rows[0].password_hash) {
      return res.status(401).json({
        error: {
          code: 401,
          message: 'Incorrect email or password.',
        },
      })
    }

    const ok = await bcrypt.compare(password, q.rows[0].password_hash)
    if (!ok) {
      return res.status(401).json({
        error: {
          code: 401,
          message: 'Incorrect email or password.',
        },
      })
    }

    await pool.query('UPDATE users SET last_login_at=NOW() WHERE id=$1',[q.rows[0].id])
    const token = signJwt({ id:q.rows[0].id, email:q.rows[0].email, role:q.rows[0].role })
    setAuthCookie(res, token)

    const { password_hash, ...safe } = q.rows[0]
    res.json({
      message: 'Signed in successfully.',
      user: safe,
    })
  } catch(e){ next(e) }
})

auth.post('/api/auth/logout', (req,res) => { clearAuthCookie(res); res.json({ ok:true }) })

auth.get('/api/auth/me', requireAuth, async (req,res,next)=>{
  try {
    const me = await pool.query(
      'SELECT id,email,first_name,last_name,role,avatar_url,created_at,last_login_at FROM users WHERE id=$1',
      [req.user.id]
    )
    res.json({ user: me.rows[0] })
  } catch(e){ next(e) }
})


auth.get('/api/auth/google', (req, res, next) => {
  const mode = req.query.mode === 'register' ? 'register' : 'login';

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: mode,   
  })(req, res, next);
});


auth.get(
  '/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${ENV.CORS_ORIGIN}/auth?error=google_cancelled`,
    session: false,
  }),
  (req, res) => {
    const mode    = req.query.state;           
    const created = !!req.user._createdWithOAuth;  

    const token = signJwt({
      id:   req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
    setAuthCookie(res, token);

    if (mode === 'register' && !created) {
      return res.redirect(`${ENV.CORS_ORIGIN}/auth?error=already_registered`);
    }

    return res.redirect(`${ENV.CORS_ORIGIN}/`);
  }
);


