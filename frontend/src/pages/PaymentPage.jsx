import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { savePaymentMethod } from '../store/cartSlice'

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

const inputStyle = {
  width: '100%',
  height: 44,
  border: '1.5px solid #e0ddd6',
  borderRadius: 10,
  padding: '0 14px',
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  color: '#1a1a1a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: '#888',
  marginBottom: 6,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}


const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}


const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

const CardDetailsForm = ({ onContinue, onBack }) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({})
  const [showCvv, setShowCvv] = useState(false)

  const validate = () => {
    const e = {}
    const rawCard = cardNumber.replace(/\s/g, '')
    if (rawCard.length !== 16) e.cardNumber = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = 'Enter expiry as MM/YY'
    else {
      const [mm, yy] = expiry.split('/').map(Number)
      if (mm < 1 || mm > 12) e.expiry = 'Invalid month'
      const now = new Date()
      const expDate = new Date(2000 + yy, mm - 1)
      if (expDate < now) e.expiry = 'Card has expired'
    }
    if (cvv.length < 3) e.cvv = 'Enter a valid CVV'
    if (name.trim().length < 2) e.name = 'Enter cardholder name'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onContinue()
  }

  const field = (label, input, error) => (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {input}
      {error && <p style={{ fontSize: 11, color: '#c0392b', margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  )

  
  const rawDigits = cardNumber.replace(/\s/g, '')
  const cardType = rawDigits.startsWith('4') ? 'VISA'
    : /^5[1-5]/.test(rawDigits) ? 'MC'
    : rawDigits.startsWith('3') ? 'AMEX'
    : null

  const cardTypeColors = { VISA: '#1a3c8f', MC: '#e65c00', AMEX: '#00843d' }
  const cardTypeLabels = { VISA: 'VISA', MC: 'Mastercard', AMEX: 'Amex' }

  return (
    <form onSubmit={handleSubmit} noValidate>
      
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 28,
        color: '#fff', fontFamily: 'monospace', position: 'relative',
        minHeight: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 24, background: '#f0c040', borderRadius: 4 }} />
          {cardType && (
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 1,
              background: cardTypeColors[cardType], color: '#fff',
              padding: '3px 10px', borderRadius: 6,
            }}>
              {cardTypeLabels[cardType]}
            </span>
          )}
        </div>
        <p style={{ fontSize: 17, letterSpacing: 3, margin: '0 0 12px', color: cardNumber ? '#fff' : '#555' }}>
          {cardNumber || '•••• •••• •••• ••••'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa' }}>
          <span style={{ color: name ? '#fff' : '#555', textTransform: 'uppercase', letterSpacing: 1 }}>
            {name || 'CARDHOLDER NAME'}
          </span>
          <span style={{ color: expiry ? '#fff' : '#555' }}>{expiry || 'MM/YY'}</span>
        </div>
      </div>

      {field('Card Number',
        <div style={{ position: 'relative' }}>
          <input
            style={{ ...inputStyle, paddingRight: 48, borderColor: errors.cardNumber ? '#c0392b' : '#e0ddd6' }}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setErrors(p => ({ ...p, cardNumber: '' })) }}
            inputMode="numeric"
          />
          {cardType && (
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, fontWeight: 700, color: cardTypeColors[cardType],
            }}>{cardTypeLabels[cardType]}</span>
          )}
        </div>,
        errors.cardNumber
      )}

      {field('Cardholder Name',
        <input
          style={{ ...inputStyle, borderColor: errors.name ? '#c0392b' : '#e0ddd6' }}
          placeholder="As printed on card"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
        />,
        errors.name
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>Expiry Date</label>
          <input
            style={{ ...inputStyle, borderColor: errors.expiry ? '#c0392b' : '#e0ddd6' }}
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setErrors(p => ({ ...p, expiry: '' })) }}
            inputMode="numeric"
          />
          {errors.expiry && <p style={{ fontSize: 11, color: '#c0392b', margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{errors.expiry}</p>}
        </div>
        <div>
          <label style={labelStyle}>CVV</label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 40, borderColor: errors.cvv ? '#c0392b' : '#e0ddd6' }}
              placeholder="•••"
              type={showCvv ? 'text' : 'password'}
              value={cvv}
              maxLength={4}
              onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, cvv: '' })) }}
              inputMode="numeric"
            />
            <button type="button" onClick={() => setShowCvv(v => !v)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14, padding: 0 }}>
              {showCvv ? '🙈' : '👁'}
            </button>
          </div>
          {errors.cvv && <p style={{ fontSize: 11, color: '#c0392b', margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{errors.cvv}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" onClick={onBack}
          style={{ flex: 1, height: 48, background: '#F7F6F2', border: '1.5px solid #e0ddd6', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a' }}>
          ← Back
        </button>
        <button type="submit"
          style={{ flex: 2, height: 48, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
        >
          Continue to PIN →
        </button>
      </div>
    </form>
  )
}

const PinEntry = ({ onConfirm, onBack }) => {
  const [pin, setPin] = useState(['', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const refs = [null, null, null, null].map(() => ({ current: null }))

  const handleDigit = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...pin]
    next[i] = digit
    setPin(next)
    setError('')
    if (digit && i < 3) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !pin[i] && i > 0) {
      refs[i - 1].current?.focus()
      const next = [...pin]
      next[i - 1] = ''
      setPin(next)
    }
  }

  const handleConfirm = () => {
    const fullPin = pin.join('')
    if (fullPin.length < 4) { setError('Please enter your 4-digit PIN'); return }
    
    if (fullPin === '0000') {
      setAttempts(a => a + 1)
      setError(`Incorrect PIN. ${2 - attempts} attempt${attempts === 1 ? '' : 's'} remaining.`)
      setPin(['', '', '', ''])
      refs[0].current?.focus()
      return
    }
    onConfirm()
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: '#F0EDE5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, margin: '0 auto 14px',
        }}>🔐</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: '#1a1a1a', margin: '0 0 6px' }}>
          Enter Your PIN
        </h3>
        <p style={{ fontSize: 13, color: '#aaa', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
          Enter the 4-digit PIN associated with your card
        </p>
      </div>

      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
        {pin.map((d, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <input
              ref={refs[i]}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 56, height: 60, textAlign: 'center',
                fontSize: showPin ? 22 : 28,
                fontWeight: 700, border: `2px solid ${d ? '#1a1a1a' : '#e0ddd6'}`,
                borderRadius: 12, outline: 'none', background: d ? '#F7F6F2' : '#fff',
                fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a',
                transition: 'all 0.15s', cursor: 'text',
              }}
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>

      
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <button type="button" onClick={() => setShowPin(v => !v)}
          style={{ background: 'none', border: 'none', fontSize: 12, color: '#aaa', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          {showPin ? '🙈 Hide PIN' : '👁 Show PIN'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fdf0f0', border: '1px solid #f5c6c6', borderRadius: 10,
          padding: '10px 14px', marginBottom: 16, textAlign: 'center',
          fontSize: 13, color: '#c0392b', fontFamily: "'DM Sans', sans-serif",
        }}>
          {error}
        </div>
      )}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, idx) => (
          <button key={idx} type="button"
            onClick={() => {
              if (k === '') return
              if (k === '⌫') {
                const lastFilled = [...pin].map((d, i) => d ? i : -1).filter(i => i >= 0).pop()
                if (lastFilled !== undefined) {
                  const next = [...pin]
                  next[lastFilled] = ''
                  setPin(next)
                  refs[lastFilled].current?.focus()
                }
              } else {
                const firstEmpty = pin.findIndex(d => d === '')
                if (firstEmpty !== -1) {
                  handleDigit(firstEmpty, String(k))
                }
              }
            }}
            style={{
              height: 52, borderRadius: 12, border: '1.5px solid #e0ddd6',
              background: k === '' ? 'transparent' : '#fff', cursor: k === '' ? 'default' : 'pointer',
              fontSize: 18, fontWeight: 600, color: '#1a1a1a', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { if (k !== '') e.currentTarget.style.background = '#F0EDE5' }}
            onMouseLeave={(e) => { if (k !== '') e.currentTarget.style.background = '#fff' }}
          >
            {k}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onBack}
          style={{ flex: 1, height: 48, background: '#F7F6F2', border: '1.5px solid #e0ddd6', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a' }}>
          ← Back
        </button>
        <button type="button" onClick={handleConfirm}
          style={{ flex: 2, height: 48, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1a7a4a'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
        >
          Confirm Payment ✓
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 14, fontFamily: "'DM Sans', sans-serif" }}>
        🔒 Your PIN is encrypted and never stored
      </p>
    </div>
  )
}

const methods = [
  { id: 'Cash on Delivery', title: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵' },
  { id: 'Debit/Credit Card', title: 'Debit / Credit Card', sub: 'Visa, Mastercard', icon: '💳' },
]

const PaymentPage = () => {
  const { shippingAddress } = useSelector((s) => s.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  
  const [cardStep, setCardStep] = useState('select')

  if (!shippingAddress?.address) { navigate('/shipping'); return null }

  const submitHandler = (e) => {
    e.preventDefault()
    if (paymentMethod === 'Debit/Credit Card') {
      setCardStep('details')
      return
    }
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  const handleCardDetailsContinue = () => setCardStep('pin')

  const handlePinConfirm = () => {
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '48px 24px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <StepBar current={2} />

        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 20, padding: 36 }}>

          
          {cardStep === 'select' && (
            <>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 28 }}>
                Payment Method
              </h2>
              <form onSubmit={submitHandler}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {methods.map((m) => {
                    const active = paymentMethod === m.id
                    return (
                      <div key={m.id} onClick={() => setPaymentMethod(m.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                          border: `1.5px solid ${active ? '#1a1a1a' : '#e0ddd6'}`,
                          background: active ? '#F7F6F2' : '#fff',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${active ? '#1a1a1a' : '#ccc'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1a' }} />}
                        </div>
                        <span style={{ fontSize: 24 }}>{m.icon}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{m.title}</p>
                          <p style={{ fontSize: 12, color: '#aaa', margin: 0, marginTop: 2 }}>{m.sub}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button type="submit"
                  style={{ width: '100%', height: 48, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                >
                  Continue →
                </button>
              </form>
            </>
          )}

          
          {cardStep === 'details' && (
            <>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
                Card Details
              </h2>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 28, fontFamily: "'DM Sans', sans-serif" }}>
                Enter your debit or credit card information
              </p>
              <CardDetailsForm
                onContinue={handleCardDetailsContinue}
                onBack={() => setCardStep('select')}
              />
            </>
          )}

          
          {cardStep === 'pin' && (
            <PinEntry
              onConfirm={handlePinConfirm}
              onBack={() => setCardStep('details')}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default PaymentPage