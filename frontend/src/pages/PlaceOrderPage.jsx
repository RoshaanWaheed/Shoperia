import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { clearCartItems } from '../store/cartSlice'

const steps = [
  { n: 1, label: 'Shipping' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Place Order' },
]

const StepBar = ({ current }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}>
    {steps.map((s, i) => (
      <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
            background: s.n < current ? '#1a7a4a' : s.n === current ? '#1a1a1a' : '#F0EDE5',
            color: s.n <= current ? '#fff' : '#aaa',
          }}>
            {s.n < current ? '✓' : s.n}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: s.n === current ? '#1a1a1a' : s.n < current ? '#1a7a4a' : '#bbb' }}>
            {s.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div style={{ width: 48, height: 2, margin: '0 10px', background: s.n < current ? '#1a7a4a' : '#F0EDE5' }} />
        )}
      </div>
    ))}
  </div>
)

const PlaceOrderPage = () => {
  const { cartItems, shippingAddress, paymentMethod } = useSelector((s) => s.cart)
  const { userInfo } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const itemsPrice    = cartItems.reduce((a, i) => a + i.price * i.qty, 0)
  const shippingPrice = itemsPrice > 1000 ? 0 : 100
  const taxPrice      = Number((0.15 * itemsPrice).toFixed(2))
  const totalPrice    = (itemsPrice + shippingPrice + taxPrice).toFixed(2)

  const placeOrderHandler = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems.map((item) => ({
          name: item.name, qty: item.qty, image: item.image,
          price: item.price, product: item._id,
        })),
        shippingAddress, paymentMethod,
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        totalPrice: Number(totalPrice),
      }, { headers: { Authorization: `Bearer ${userInfo.token}` } })
      dispatch(clearCartItems())
      navigate(`/order/${data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const card = { background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 24, marginBottom: 14 }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '48px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <StepBar current={3} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          
          <div>
            
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', margin: 0 }}>Shipping Address</p>
                <Link to="/shipping" style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none' }}>Change</Link>
              </div>
              <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </div>

            
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', margin: 0 }}>Payment Method</p>
                <Link to="/payment" style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none' }}>Change</Link>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{paymentMethod}</p>
            </div>

            
            <div style={card}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>Order Items</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cartItems.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ width: 56, height: 56, background: '#F7F6F2', borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: 6 }}
                        onError={(e) => { e.target.src = 'https://placehold.co/56x56/F7F6F2/999?text=?' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/product/${item._id}`} style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {item.name}
                      </Link>
                      <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Qty: {item.qty}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                        Rs. {(item.qty * item.price).toLocaleString()}
                      </p>
                      <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Rs. {item.price} × {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div style={{ ...card, position: 'sticky', top: 24, marginBottom: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 18 }}>Order Summary</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {[
                { l: 'Items',       v: `Rs. ${itemsPrice.toLocaleString()}` },
                { l: 'Shipping',    v: shippingPrice === 0 ? 'Free' : `Rs. ${shippingPrice}` },
                { l: 'Tax (15%)',   v: `Rs. ${taxPrice}` },
              ].map((r) => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#888' }}>{r.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f0ede6', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
                  Rs. {Number(totalPrice).toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button onClick={placeOrderHandler} disabled={cartItems.length === 0 || loading}
              style={{
                width: '100%', height: 48, background: loading ? '#ccc' : '#C4783A',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: loading || cartItems.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#b36a2e' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#C4783A' }}
            >
              {loading ? 'Placing Order…' : 'Place Order →'}
            </button>

            <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 12 }}>
              By ordering you agree to our terms & conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrderPage