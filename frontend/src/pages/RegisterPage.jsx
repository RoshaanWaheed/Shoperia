import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { setCredentials } from '../store/authSlice.js'
import axios from 'axios'

const RegisterPage = () => {
  const [name, setName]                   = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirm]     = useState('')
  const [showPw, setShowPw]               = useState(false)
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = location.search ? location.search.split('=')[1] : '/'

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password })
      dispatch(setCredentials(data))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    onFocus: (e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' },
    onBlur:  (e) => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' },
  }
  const baseInput = { width: '100%', height: 44, border: '1px solid #e0ddd6', borderRadius: 10, padding: '0 14px', fontSize: 14, background: '#F7F6F2', color: '#1a1a1a', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 440 }}>

        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>
                SHOP<span style={{ color: '#C4783A' }}>ERIA</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>Create your account</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 20, padding: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>
            Get started
          </h2>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#c0392b', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <form onSubmit={submitHandler}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" style={baseInput} {...inp} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={baseInput} {...inp} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters"
                  style={{ ...baseInput, paddingRight: 44 }} {...inp} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#aaa' }}>
                 {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repeat your password"
                style={{ ...baseInput, borderColor: confirmPassword && confirmPassword !== password ? '#c0392b' : '#e0ddd6' }} {...inp} />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: 12, color: '#c0392b', marginTop: 4 }}>Passwords don't match</p>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', height: 46, background: loading ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#C4783A' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1a1a1a' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ color: '#C4783A', fontWeight: 600, textDecoration: 'none' }}>
              LogIn
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage