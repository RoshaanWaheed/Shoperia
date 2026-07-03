import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setCredentials, logout } from '../store/authSlice.js'
import axios from 'axios'

const allTabs = [
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'orders',  label: 'My Orders', icon: '📦' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]


const STATUS_MAP = {
  Pending:   { bg: '#FFF0F0', color: '#c0392b', label: '⏳ Pending' },
  Confirmed: { bg: '#F0EDE5', color: '#555',    label: '✓ Confirmed' },
  Shipped:   { bg: '#FFF4E8', color: '#8a4f1a', label: '🚚 Shipped' },
  Delivered: { bg: '#EDFAF3', color: '#1a7a4a', label: '✓ Delivered' },
}

const getStatusStyle = (order) => {
  if (order.status && STATUS_MAP[order.status]) return STATUS_MAP[order.status]
  
  if (order.isDelivered) return STATUS_MAP.Delivered
  if (order.isPaid)      return STATUS_MAP.Confirmed
  return STATUS_MAP.Pending
}

const ProfilePage = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const dispatch     = useDispatch()
  const navigate     = useNavigate()

  const tabs = userInfo?.isAdmin ? allTabs.filter(t => t.key === 'profile') : allTabs
  const [tab, setTab]                   = useState('profile')
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPw, setConfirmPw]       = useState('')
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [orders, setOrders]             = useState([])
  const [ordersLoading, setOL]          = useState(false)

  useEffect(() => {
    if (userInfo) { setName(userInfo.name); setEmail(userInfo.email) }
  }, [userInfo])

  useEffect(() => {
    if (tab !== 'orders' || !userInfo) return
    setOL(true)
    axios.get('/api/orders/myorders', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setOL(false))
  }, [tab, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    if (password && password !== confirmPw) { setError('Passwords do not match'); return }
    try {
      const { data } = await axios.put('/api/users/profile',
        { name, email, password: password || undefined },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      dispatch(setCredentials(data))
      setSuccess('Profile updated!')
      setPassword(''); setConfirmPw('')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  const initials = (n) => n?.split(' ').map((x) => x[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const inp = {
    onFocus: (e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' },
    onBlur:  (e) => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' },
  }
  const base = { width: '100%', height: 44, border: '1px solid #e0ddd6', borderRadius: 10, padding: '0 14px', fontSize: 14, background: '#F7F6F2', color: '#1a1a1a', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }
  const lbl  = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '40px 32px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

          
          <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 24, position: 'sticky', top: 24 }}>
            
            <div style={{ textAlign: 'center', paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid #f0ede6' }}>
              <div style={{ width: 56, height: 56, background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 auto 12px' }}>
                {initials(userInfo?.name)}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{userInfo?.name}</p>
              <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{userInfo?.email}</p>
              {userInfo?.isAdmin && (
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', background: '#F3EEFF', color: '#6b3fa0', padding: '3px 10px', borderRadius: 20, marginTop: 8 }}>
                  Admin
                </span>
              )}
            </div>

            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, textAlign: 'left', background: tab === t.key ? '#1a1a1a' : 'transparent', color: tab === t.key ? '#fff' : '#555', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { if (tab !== t.key) e.currentTarget.style.background = '#F7F6F2' }}
                  onMouseLeave={(e) => { if (tab !== t.key) e.currentTarget.style.background = 'transparent' }}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
              <button onClick={() => { dispatch(logout()); navigate('/') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#c0392b', background: 'transparent', marginTop: 8, textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FFF0F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          
          <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 32 }}>

            
            {tab === 'profile' && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Edit Profile</h2>
                {error   && <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>}
                {success && <div style={{ background: '#EDFAF3', border: '1px solid #b7eacf', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1a7a4a' }}>{success}</div>}
                <form onSubmit={submitHandler}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={lbl}>Full Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={base} {...inp} />
                    </div>
                    <div>
                      <label style={lbl}>Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={base} {...inp} />
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #f0ede6', paddingTop: 20, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Change Password <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>(leave blank to keep current)</span></p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={lbl}>New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" style={base} {...inp} />
                      </div>
                      <div>
                        <label style={lbl}>Confirm Password</label>
                        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password" style={base} {...inp} />
                      </div>
                    </div>
                  </div>
                  <button type="submit"
                    style={{ height: 46, padding: '0 32px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                  >
                    Save Changes
                  </button>
                </form>
              </>
            )}

            
            {tab === 'orders' && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>My Orders</h2>
                {ordersLoading ? (
                  <p style={{ color: '#aaa', fontSize: 13 }}>Loading orders…</p>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <p style={{ fontSize: 14, color: '#aaa' }}>No orders yet.</p>
                    <Link to="/" style={{ fontSize: 13, color: '#C4783A', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>Start Shopping →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {orders.map((order) => {
                      const st = getStatusStyle(order)  
                      return (
                        <div key={order._id} style={{ border: '1px solid #f0ede6', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, background: '#fdfcfb' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#aaa', marginBottom: 2 }}>#{order._id.slice(-8).toUpperCase()}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                              {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                            </p>
                            <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif", flexShrink: 0 }}>
                            Rs. {Number(order.totalPrice).toLocaleString()}
                          </p>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>
                            {st.label}
                          </span>
                      <Link to={`/order/${order._id}`} style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none', flexShrink: 0 }}>
                            Details →
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            
            {tab === 'settings' && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Settings</h2>
                <div style={{ background: '#F7F6F2', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#aaa' }}>Account settings coming soon.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage