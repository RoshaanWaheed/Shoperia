import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { useCreateReviewMutation } from '../store/productsApi'

const Badge = ({ ok, labels }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, fontWeight: 700,
    padding: '5px 14px', borderRadius: 20,
    background: ok ? '#EDFAF3' : '#FFF4E8',
    color: ok ? '#1a7a4a' : '#8a4f1a',
  }}>
    {ok ? '✓' : '⏳'} {ok ? labels[0] : labels[1]}
  </span>
)


const STATUS_STEP = { Pending: 0, Confirmed: 1, Shipped: 2, Delivered: 3 }

const HEADER_LABEL = {
  Pending:   'Order Received — Awaiting Confirmation ⏳',
  Confirmed: 'Order Confirmed ✓',
  Shipped:   'Order Shipped 🚚',
  Delivered: 'Order Delivered ✓',
  Cancelled: 'Order Cancelled ✕',
}

const OrderPage = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { userInfo } = useSelector((s) => s.auth)

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [reviewedIds, setReviewedIds] = useState([])
  const [activeReviewItem, setActiveReviewItem] = useState(null) 
  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return }
    axios.get(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => {
        setOrder(data)
        setReviewedIds(data.reviewedProductIds || [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Error loading order'))
      .finally(() => setLoading(false))
  }, [id, userInfo, navigate])
  const [createReview] = useCreateReviewMutation()
  const submitReview = async () => {
    if (!activeReviewItem || rating === 0) return
    setSubmitting(true)
    setReviewError('')
    try {
      await axios.post(`/api/products/${activeReviewItem.product}/reviews`,
        { rating, comment, orderId: order._id },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      setReviewedIds([...reviewedIds, activeReviewItem.product])
      setActiveReviewItem(null)
      setRating(0)
      setComment('')
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 12, background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 36, height: 36, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 13, color: '#aaa' }}>Loading order…</p>
    </div>
  )

  if (error || !order) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16, background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 14, color: '#c0392b' }}>{error || 'Order not found'}</p>
      <Link to="/" style={{ fontSize: 13, color: '#C4783A', fontWeight: 600, textDecoration: 'none' }}>← Go Home</Link>
    </div>
  )

  
  const currentStatus = order.status || (order.isDelivered ? 'Delivered' : 'Pending')
  const isCancelled    = currentStatus === 'Cancelled'
  const activeStep     = STATUS_STEP[currentStatus] ?? 0

  const card = { background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 24, marginBottom: 16 }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '40px 32px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, ...(isCancelled ? { background: '#FFF8F8', borderColor: '#fcd5d5' } : {}) }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, color: isCancelled ? '#c0392b' : '#1a1a1a', marginBottom: 6 }}>
              {HEADER_LABEL[currentStatus] || 'Order Confirmed ✓'}
            </h1>
            <p style={{ fontSize: 12, color: '#aaa' }}>
              Order <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#555' }}>#{order._id.slice(-10).toUpperCase()}</span>
              &nbsp;·&nbsp; {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {isCancelled ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: '#FFF0F0', color: '#c0392b' }}>
              ✕ Cancelled
            </span>
          ) : (
            <Badge ok={order.isPaid && order.isDelivered} labels={['Complete', 'In Progress']} />
          )}
        </div>

        {isCancelled && (
          <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', marginBottom: 6 }}>This order has been cancelled</p>
            <p style={{ fontSize: 13, color: '#a33' }}>
              No further action is needed. If you were charged, your refund (if applicable) will be processed shortly. Contact support if you have questions.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          
          <div>
            
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>Shipping Address</h3>
              <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6 }}>
                {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {!isCancelled && (
                <div style={{ marginTop: 14 }}>
                  <Badge ok={order.isDelivered} labels={[`Delivered ${new Date(order.deliveredAt).toLocaleDateString()}`, 'Not Delivered Yet']} />
                </div>
              )}
            </div>

            
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 14 }}>Payment</h3>
              <p style={{ fontSize: 14, color: '#555', marginBottom: 10 }}>
                Method: <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{order.paymentMethod}</span>
              </p>
              <Badge ok={order.isPaid} labels={[`Paid ${new Date(order.paidAt).toLocaleDateString()}`, 'Awaiting Payment']} />
            </div>

            
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>Order Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {order.orderItems.map((item) => {
                  const isReviewed = reviewedIds.includes(item.product)
                  const isReviewing = activeReviewItem?.product === item.product

                  return (
                    <div key={item._id} style={{ paddingBottom: 14, borderBottom: '1px solid #f0ede6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 60, height: 60, background: '#F7F6F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: 6 }}
                            onError={(e) => { e.target.src = 'https://placehold.co/60x60/F7F6F2/999?text=?' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/product/${item.product}`} style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
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

                      
                      {order.status === 'Delivered' && (
                        <div style={{ marginTop: 12, paddingLeft: 76 }}>
                          {isReviewed ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1a7a4a', background: '#EDFAF3', padding: '4px 10px', borderRadius: 20 }}>
                              ✓ You reviewed this product
                            </span>
                          ) : isReviewing ? (
                            <div style={{ background: '#F7F6F2', borderRadius: 12, padding: 16, marginTop: 4 }}>
                              {reviewError && (
                                <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#c0392b' }}>
                                  {reviewError}
                                </div>
                              )}
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Rate this product</p>
                              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <span key={n} onClick={() => setRating(n)}
                                    style={{ cursor: 'pointer', fontSize: 24, color: n <= rating ? '#C4783A' : '#e0ddd6', lineHeight: 1 }}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts (optional)"
                                rows={2}
                                style={{ width: '100%', border: '1px solid #e0ddd6', borderRadius: 8, padding: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', background: '#fff', boxSizing: 'border-box', marginBottom: 10 }}
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={submitReview} disabled={rating === 0 || submitting}
                                  style={{ height: 36, padding: '0 18px', background: rating === 0 ? '#ccc' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: rating === 0 || submitting ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                                  {submitting ? 'Submitting…' : 'Submit Review'}
                                </button>
                                <button onClick={() => { setActiveReviewItem(null); setRating(0); setComment(''); setReviewError('') }}
                                  style={{ height: 36, padding: '0 18px', background: 'transparent', color: '#888', border: '1px solid #e0ddd6', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setActiveReviewItem(item)}
                              style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', background: 'none', border: '1px solid #C4783A', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                              ★ Write a Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          
          <div>
            
            <div style={card}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>Price Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Items',    v: `Rs. ${Number(order.itemsPrice).toLocaleString()}` },
                  { l: 'Shipping', v: Number(order.shippingPrice) === 0 ? 'Free' : `Rs. ${order.shippingPrice}` },
                  { l: 'Tax',      v: `Rs. ${order.taxPrice}` },
                ].map((r) => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{r.l}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f0ede6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
                    Rs. {Number(order.totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            
            {!isCancelled && (
              <div style={card}>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>Order Status</h3>
                {[
                  { label: 'Order Placed' },
                  { label: 'Pending' },
                  { label: 'Confirmed' },
                  { label: 'Shipped' },
                  { label: 'Delivered' },
                ].map((step, i) => {
                  
                  
                  const done = i === 0 || i - 1 < activeStep
                  const isActive = i - 1 === activeStep

                  return (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 4 ? 12 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                          background: done ? '#1a1a1a' : isActive ? '#C4783A' : '#F0EDE5',
                          color: done || isActive ? '#fff' : '#aaa',
                          border: isActive ? '2px solid #C4783A' : 'none',
                          boxSizing: 'border-box',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: done ? '#1a1a1a' : isActive ? '#C4783A' : '#aaa' }}>
                        {step.label}
                        {isActive && <span style={{ fontSize: 11, color: '#C4783A', marginLeft: 6 }}>← Current</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            
            {!isCancelled && order.paymentMethod === 'Cash on Delivery' && !order.isPaid && (
              <div style={{ background: '#FFF4E8', border: '1px solid #f5d5a0', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#8a4f1a', marginBottom: 6 }}>💵 Cash on Delivery</p>
                <p style={{ fontSize: 13, color: '#8a4f1a' }}>
                  Please have <strong>Rs. {Number(order.totalPrice).toLocaleString()}</strong> ready when your order arrives.
                </p>
              </div>
            )}

            <Link to="/" style={{ display: 'block', textAlign: 'center', background: '#1a1a1a', color: '#fff', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', marginBottom: 10, transition: 'background 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
            >
              Continue Shopping
            </Link>
            <Link to="/profile" style={{ display: 'block', textAlign: 'center', background: '#F0EDE5', color: '#555', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderPage