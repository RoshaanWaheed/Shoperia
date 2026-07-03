import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const UserList = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    axios.get('/api/users', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } })
      setUsers(users.filter((u) => u._id !== id))
    } catch { alert('Failed to delete user') }
  }

  const toggleAdmin = async (user) => {
    if (!window.confirm(`${user.isAdmin ? 'Remove' : 'Grant'} admin for ${user.name}?`)) return
    try {
      const { data } = await axios.put(`/api/users/${user._id}`,
        { name: user.name, email: user.email, isAdmin: !user.isAdmin },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      setUsers(users.map((u) => u._id === data._id ? { ...u, isAdmin: data.isAdmin } : u))
    } catch { alert('Failed to update user') }
  }

  const admins  = users.filter((u) => u.isAdmin).length
  const regular = users.filter((u) => !u.isAdmin).length

  if (loading) return (
    <AdminLayout title="Users">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Users">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {error && <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Users',    value: users.length },
          { label: 'Admins',         value: admins,  accent: '#6b3fa0' },
          { label: 'Regular Users',  value: regular },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.accent || '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FDFCFB' }}>
              {['User', 'Email', 'Role', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', borderBottom: '1px solid #f0ede6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#aaa' }}>No users found</td></tr>
            ) : users.map((user, i) => (
              <tr key={user._id}
                style={{ borderBottom: i < users.length - 1 ? '1px solid #f7f5f2' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FDFCFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.isAdmin ? '#F3EEFF' : '#F0EDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: user.isAdmin ? '#6b3fa0' : '#888', flexShrink: 0 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a1a1a' }}>{user.name}</p>
                      {user._id === userInfo._id && <p style={{ fontSize: 11, color: '#C4783A', fontWeight: 600 }}>You</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', color: '#888' }}>{user.email}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: user.isAdmin ? '#F3EEFF' : '#F0EDE5', color: user.isAdmin ? '#6b3fa0' : '#888' }}>
                    {user.isAdmin ? '👑 Admin' : 'User'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleAdmin(user)}
                      style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: user.isAdmin ? '#FFF4E8' : '#F3EEFF', color: user.isAdmin ? '#8a4f1a' : '#6b3fa0' }}>
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    {user._id !== userInfo._id && (
                      <button onClick={() => deleteHandler(user._id)}
                        style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: '#FFF0F0', color: '#c0392b' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default UserList