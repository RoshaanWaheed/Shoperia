import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_STYLES = {
  Pending:   { bg: '#FDF6EF', color: '#a3672c' },
  Confirmed: { bg: '#F0EDE5', color: '#555' },
  Shipped:   { bg: '#FFF4E8', color: '#8a4f1a' },
  Delivered: { bg: '#EDFAF3', color: '#1a7a4a' },
  Cancelled: { bg: '#FFF0F0', color: '#c0392b' },
}

const OrderList = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      setOrders(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status, currentStatus) => {
    if (status === 'Cancelled') {
      const ok = window.confirm('Cancel this order? Stock will be restored for all items.')
      if (!ok) return
    }
    setUpdatingId(id)
    try {
      const { data } = await axios.put(
        `/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      setOrders(orders.map((o) => o._id === id ? data : o))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  
  
  
  const cancellableFrom = ['Pending', 'Confirmed']
  const optionsFor = (currentStatus) =>
    cancellableFrom.includes(currentStatus)
      ? STATUS_OPTIONS
      : STATUS_OPTIONS.filter((opt) => opt !== 'Cancelled' || opt === currentStatus)

  const paid    = orders.filter((o) => o.isPaid).length
  const del     = orders.filter((o) => o.isDelivered).length
  const pending = orders.filter((o) => !o.isDelivered).length

  if (loading) return (
    <AdminLayout title="Orders">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Orders">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {error && <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Orders', value: orders.length, accent: '#1a1a1a' },
          { label: 'Paid',         value: paid,    accent: '#1a7a4a' },
          { label: 'Delivered',    value: del,     accent: '#C4783A' },
          { label: 'Pending',      value: pending, accent: '#8a4f1a' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.accent, fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FDFCFB' }}>
              {['Order ID', 'Customer', 'Date', 'Total', 'Method', 'Paid', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', borderBottom: '1px solid #f0ede6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#aaa' }}>No orders found</td></tr>
            ) : orders.map((order, i) => {
              const status = order.status || (order.isDelivered ? 'Delivered' : 'Pending')
              const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Confirmed

              return (
                <tr key={order._id}
                  style={{ borderBottom: i < orders.length - 1 ? '1px solid #f7f5f2' : 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FDFCFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 18px', fontFamily: 'monospace', fontSize: 11, color: '#888' }}>#{order._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 500, color: '#1a1a1a' }}>{order.user?.name || 'Unknown'}</td>
                  <td style={{ padding: '13px 18px', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                  <td style={{ padding: '13px 18px', fontWeight: 700, color: '#1a1a1a' }}>Rs. {Number(order.totalPrice).toLocaleString()}</td>
                  <td style={{ padding: '13px 18px', color: '#888', fontSize: 12 }}>{order.paymentMethod}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: order.isPaid ? '#EDFAF3' : '#FFF0F0', color: order.isPaid ? '#1a7a4a' : '#c0392b' }}>
                      {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link to={`/order/${order._id}`} style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none', padding: '4px 10px', background: '#FFF4E8', borderRadius: 6 }}>
                        View
                      </Link>
                      <select
                        value={status}
                        disabled={updatingId === order._id || status === 'Cancelled'}
                        onChange={(e) => updateStatus(order._id, e.target.value, status)}
                        style={{
                          fontSize: 12, fontWeight: 600, color: '#1a1a1a', background: '#fff',
                          border: '1px solid #e0ddd6', borderRadius: 6, padding: '4px 8px',
                          cursor: (updatingId === order._id || status === 'Cancelled') ? 'not-allowed' : 'pointer',
                          fontFamily: "'DM Sans', sans-serif", outline: 'none',
                          opacity: (updatingId === order._id || status === 'Cancelled') ? 0.5 : 1,
                        }}
                      >
                        {optionsFor(status).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
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

export default OrderList