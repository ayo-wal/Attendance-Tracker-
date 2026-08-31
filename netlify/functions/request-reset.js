// POST /.netlify/functions/request-reset
// Body: { email }
// Always responds with a generic success message, whether or not the
// email exists — this avoids leaking which emails have accounts.

const { createClient } = require('@supabase/supabase-js')
const { google } = require('googleapis')

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function buildMimeMessage({ to, from, subject, html }) {
  const messageParts = [
    `From: Ayo-Wal Attendance Tracker <${from}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    html,
  ]
  const message = messageParts.join('\n')
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sendGmail(to, subject, html) {
  const oauth2Client = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET)
  oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const raw = buildMimeMessage({ to, from: process.env.GMAIL_SENDER_EMAIL, subject, html })
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { email } = JSON.parse(event.body || '{}')
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) }
    }

    const genericResponse = {
      statusCode: 200,
      body: JSON.stringify({
        message: "If that email has an account, we've sent a password reset link.",
      }),
    }

    // Find the user by email via the admin API.
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError
    const user = userList.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    // Don't reveal whether the account exists.
    if (!user) return genericResponse

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    const { data: tokenRow, error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({ user_id: user.id, email: user.email, expires_at: expiresAt.toISOString() })
      .select()
      .single()
    if (insertError) throw insertError

    const resetLink = `${process.env.SITE_URL}/reset-password?token=${tokenRow.token}`

    await sendGmail(
      user.email,
      'Reset your Attendance Tracker password',
      `
        <p>Someone requested a password reset for your Attendance Tracker account.</p>
        <p><a href="${resetLink}">Click here to set a new password</a></p>
        <p>This link expires in 30 minutes. If you didn't request this, you can ignore this email.</p>
      `
    )

    return genericResponse
  } catch (err) {
    console.error('request-reset error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) }
  }
}
