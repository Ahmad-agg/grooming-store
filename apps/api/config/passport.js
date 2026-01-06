import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { ENV } from '../config/env.js'
import { pool } from '../db/db.js'

async function findOrCreateOAuthUser({ provider, providerId, email, firstName, lastName, avatarUrl }) {
  const sel = await pool.query(
    'SELECT * FROM users WHERE oauth_provider=$1 AND oauth_provider_id=$2',
    [provider, providerId]
  )
  if (sel.rows.length) {
    return { user: sel.rows[0], created: false }
  }

  if (email) {
    const byEmail = await pool.query('SELECT * FROM users WHERE email=$1', [email])
    if (byEmail.rows.length) {
      const u = byEmail.rows[0]
      await pool.query(
        'UPDATE users SET oauth_provider=$1, oauth_provider_id=$2, avatar_url=$3 WHERE id=$4',
        [provider, providerId, avatarUrl, u.id]
      )
      const updated = (await pool.query('SELECT * FROM users WHERE id=$1',[u.id])).rows[0]
      return { user: updated, created: false }
    }
  }

  const ins = await pool.query(
    `INSERT INTO users (email, first_name, last_name, oauth_provider, oauth_provider_id, avatar_url)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [email || null, firstName || null, lastName || null, provider, providerId, avatarUrl || null]
  )
  return { user: ins.rows[0], created: true }
}


passport.use(new GoogleStrategy({
  clientID: ENV.GOOGLE_CLIENT_ID,
  clientSecret: ENV.GOOGLE_CLIENT_SECRET,
  callbackURL: ENV.GOOGLE_CALLBACK_URL,
}, async (_access, _refresh, profile, done) => {
  try {
    const email  = profile.emails?.[0]?.value ?? null
    const first  = profile.name?.givenName ?? null
    const last   = profile.name?.familyName ?? null
    const avatar = profile.photos?.[0]?.value ?? null

    const { user, created } = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.id,
      email,
      firstName: first,
      lastName:  last,
      avatarUrl: avatar,
    })

    user._createdWithOAuth = created

    done(null, user)
  } catch (e) {
    done(e)
  }
}))



