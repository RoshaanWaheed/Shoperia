import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '22px 24px' }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 700, color: accent || '#1a1a1a', fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: '#bbb', marginTop: 6 }}>{sub}</p>}
  </div>
)

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
  </div>
)


const isDelivered = (order) => order.isDelivered || order.status === 'Delivered'
const isPaid      = (order) => order.isPaid      || order.status === 'Delivered'

const STATUS_STYLES = {
  Pending:   { bg: '#FFF4E8', color: '#8a4f1a' },
  Confirmed: { bg: '#F0EDE5', color: '#555'    },
  Shipped:   { bg: '#EEF4FF', color: '#2a52a0' },
  Delivered: { bg: '#EDFAF3', color: '#1a7a4a' },
  Cancelled: { bg: '#FFF0F0', color: '#c0392b' },
}

const Dashboard = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const [orders,       setOrders]       = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalUsers,    setTotalUsers]    = useState(0)
  const [recentOrders,  setRecentOrders]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  const fetchAll = () => {
    if (!userInfo?.token) return
    const cfg = { headers: { Authorization: `Bearer ${userInfo.token}` } }
    Promise.all([
      axios.get('/api/orders', cfg),
      axios.get('/api/products', cfg),
      axios.get('/api/users', cfg),
    ]).then(([ordersRes, productsRes, usersRes]) => {
      const allOrders = ordersRes.data
      const products  = productsRes.data?.products || productsRes.data || []
      const users     = Array.isArray(usersRes.data) ? usersRes.data : []
      setOrders(allOrders)
      setTotalProducts(products.length)
      setTotalUsers(users.length)
      setRecentOrders([...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6))
    }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [userInfo])

  
  const totalRevenue  = orders.reduce((a, o) => a + Number(o.totalPrice), 0)
  const deliveredCount = orders.filter(isDelivered).length
  const pendingCount   = orders.filter((o) => !isDelivered(o) && o.status !== 'Cancelled').length
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length

  if (loading) return <AdminLayout title="Dashboard"><Spinner /></AdminLayout>

  return (
    <AdminLayout title="Dashboard">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {error && (
        <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>
      )}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <StatCard label="Total Revenue"  value={`Rs. ${totalRevenue.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`} sub="All time" accent="#C4783A" />
        <StatCard label="Total Orders"   value={orders.length}   sub="All orders" />
        <StatCard label="Products"       value={totalProducts}   sub="In catalog" />
        <StatCard label="Customers"      value={totalUsers}      sub="Registered" />
      </div>

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Delivered"  value={deliveredCount}  sub="Completed orders" accent="#1a7a4a" />
        <StatCard label="Pending"    value={pendingCount}    sub="Awaiting action"  accent="#8a4f1a" />
        <StatCard label="Cancelled"  value={cancelledCount}  sub="Cancelled orders" accent="#c0392b" />
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0ede6' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Recent Orders</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={fetchAll}
              style={{ fontSize: 12, fontWeight: 600, color: '#888', background: '#F7F6F2', border: '1px solid #e0ddd6', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F0EDE5'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#F7F6F2'}
            >
              ↻ Refresh
            </button>
            <Link to="/admin/orders" style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none' }}>View All →</Link>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FDFCFB' }}>
              {['Order ID', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Delivery'].map((h) => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', borderBottom: '1px solid #f0ede6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>No orders yet</td></tr>
            ) : recentOrders.map((order, i) => {
              const status      = order.status || (isDelivered(order) ? 'Delivered' : 'Pending')
              const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Confirmed
              const delivered   = isDelivered(order)
              const paid        = isPaid(order)

              return (
                <tr key={order._id}
                  style={{ borderBottom: i < recentOrders.length - 1 ? '1px solid #f7f5f2' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FDFCFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: 12, color: '#888' }}>
                    <Link to={`/order/${order._id}`} style={{ color: '#C4783A', textDecoration: 'none', fontWeight: 600 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1a1a1a' }}>{order.user?.name || 'Unknown'}</td>
                  <td style={{ padding: '14px 20px', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1a1a' }}>Rs. {Number(order.totalPrice).toLocaleString()}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: paid ? '#EDFAF3' : '#FFF0F0', color: paid ? '#1a7a4a' : '#c0392b' }}>
                      {paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: delivered ? '#EDFAF3' : '#FFF4E8', color: delivered ? '#1a7a4a' : '#8a4f1a' }}>
                      {delivered ? '✓ Delivered' : 'Pending'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default Dashboard