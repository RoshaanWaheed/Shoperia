import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveShippingAddress } from '../store/cartSlice'

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

const ShippingPage = () => {
  const { shippingAddress } = useSelector((s) => s.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [address,    setAddress]    = useState(shippingAddress?.address    || '')
  const [city,       setCity]       = useState(shippingAddress?.city       || '')
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '')
  const [country,    setCountry]    = useState(shippingAddress?.country    || '')

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    navigate('/payment')
  }

  const inp = {
    onFocus: (e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' },
    onBlur:  (e) => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' },
  }
  const base = {
    width: '100%', height: 46, border: '1px solid #e0ddd6', borderRadius: 10,
    padding: '0 14px', fontSize: 14, background: '#F7F6F2', color: '#1a1a1a',
    outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '48px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <StepBar current={1} />

        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 20, padding: 36 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 28 }}>
            Shipping Address
          </h2>

          <form onSubmit={submitHandler}>
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="House #, Street, Area" style={base} {...inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={lbl}>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Karachi, Lahore…" style={base} {...inp} />
              </div>
              <div>
                <label style={lbl}>Postal Code</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required placeholder="75500" style={base} {...inp} />
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required placeholder="Pakistan" style={base} {...inp} />
            </div>

            <button type="submit"
              style={{ width: '100%', height: 48, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
            >
              Continue to Payment →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ShippingPage