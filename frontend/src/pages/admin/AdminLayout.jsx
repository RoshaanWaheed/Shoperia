import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'

const navItems = [
  { to: '/admin',          icon: '▣',  label: 'Dashboard' },
  { to: '/admin/products', icon: '◈',  label: 'Products' },
  { to: '/admin/orders',   icon: '◎',  label: 'Orders' },
  { to: '/admin/reviews',  icon: '★',  label: 'Reviews' },
  { to: '/admin/users',    icon: '◉',  label: 'Users' },
  { to: '/admin/profile',  icon: '👤', label: 'Profile' },
]

const AdminLayout = ({ children, title, action }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((s) => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>

      
      <aside className="w-56 flex-shrink-0 sticky top-0 h-screen flex flex-col" style={{ background: '#1a1a1a' }}>
        <div className="px-6 pt-7 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="block">
            <span className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#fff' }}>
              SHOPERIA
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const active = item.to === '/admin' ? pathname === '/admin' : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  background: active ? '#C4783A' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#C4783A', color: '#fff' }}>
              {userInfo?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#fff' }}>{userInfo?.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{userInfo?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 mt-3 rounded-lg text-xs font-medium w-full text-left"
            style={{ color: '#fff', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            ← Logout
          </button>
        </div>
      </aside>

      
      <main className="flex-1 min-w-0 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
            {title}
          </h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout