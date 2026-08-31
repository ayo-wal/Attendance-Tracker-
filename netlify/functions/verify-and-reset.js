// POST /.netlify/functions/verify-and-reset
// Body: { token, newPassword }

const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { token, newPassword } = JSON.parse(event.body || '{}')
    if (!token || !newPassword) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Token and new password are required' }) }
    }
    if (newPassword.length < 6) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) }
    }

    const { data: tokenRow, error: fetchError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !tokenRow) {
      return { statusCode: 400, body: JSON.stringify({ error: 'This reset link is invalid.' }) }
    }
    if (tokenRow.used) {
      return { statusCode: 400, body: JSON.stringify({ error: 'This reset link has already been used.' }) }
    }
    if (new Date(tokenRow.expires_at) < new Date()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'This reset link has expired. Please request a new one.' }) }
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tokenRow.user_id, {
      password: newPassword,
    })
    if (updateError) throw updateError

    await supabaseAdmin.from('password_reset_tokens').update({ used: true }).eq('token', token)

    return { statusCode: 200, body: JSON.stringify({ message: 'Password updated.' }) }
  } catch (err) {
    console.error('verify-and-reset error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) }
  }
}
