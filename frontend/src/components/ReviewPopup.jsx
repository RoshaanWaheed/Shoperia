import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Star = ({ filled, onClick }) => (
  <span
    onClick={onClick}
    style={{ cursor: 'pointer', fontSize: 28, color: filled ? '#C4783A' : '#e0ddd6', lineHeight: 1, transition: 'color 0.1s' }}
  >
    ★
  </span>
)

const ReviewPopup = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const [queue, setQueue]       = useState([])   
  const [current, setCurrent]   = useState(null) 
  const [productIdx, setProductIdx] = useState(0)
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    if (!userInfo?.token || userInfo.isAdmin) return
    axios.get('/api/orders/pending-review', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => {
        if (data.length > 0) {
          setQueue(data)
          setCurrent(data[0])
        }
      })
      .catch(() => {})
  }, [userInfo])

  if (!current) return null

  const items = current.orderItems || []
  const item  = items[productIdx]
  if (!item) return null

  const dismissPopup = async () => {
    try {
      await axios.put(`/api/orders/${current._id}/mark-popup-shown`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      })
    } catch (err) {
      console.error(err)
    }
    
    const rest = queue.slice(1)
    setQueue(rest)
    setCurrent(rest[0] || null)
    setProductIdx(0)
    setRating(0)
    setComment('')
    setDone(false)
  }

  const submitReview = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await axios.post(`/api/products/${item.product}/reviews`,
        { rating, comment, orderId: current._id },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      
      if (productIdx + 1 < items.length) {
        setProductIdx(productIdx + 1)
        setRating(0)
        setComment('')
      } else {
        setDone(true)
        setTimeout(dismissPopup, 1200)
      }
    } catch (err) {
      console.error(err)
      
      if (productIdx + 1 < items.length) {
        setProductIdx(productIdx + 1)
        setRating(0)
        setComment('')
      } else {
        dismissPopup()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, fontFamily: "'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 420, width: '100%', position: 'relative' }}>

        <button onClick={dismissPopup}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer' }}
        >
          ✕
        </button>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Thanks for your review!</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>Order delivered ✓</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>
                Thanks for ordering!
              </h3>
              <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                How was <strong style={{ color: '#1a1a1a' }}>{item.name}</strong>?
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= rating} onClick={() => setRating(n)} />
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts (optional)"
              rows={3}
              style={{
                width: '100%', border: '1px solid #e0ddd6', borderRadius: 10, padding: 12,
                fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none',
                background: '#F7F6F2', boxSizing: 'border-box', marginBottom: 16,
              }}
            />

            <button
              onClick={submitReview}
              disabled={rating === 0 || submitting}
              style={{
                width: '100%', height: 46, background: rating === 0 ? '#ccc' : '#1a1a1a', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", marginBottom: 10,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa' }}>
              Or review later from{' '}
              <Link to="/profile" onClick={dismissPopup} style={{ color: '#C4783A', fontWeight: 600, textDecoration: 'none' }}>
                My Orders
              </Link>
            </p>

            {items.length > 1 && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#ccc', marginTop: 10 }}>
                Item {productIdx + 1} of {items.length}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ReviewPopup