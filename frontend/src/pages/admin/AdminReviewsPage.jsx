import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const StarRating = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
        <polygon points="8,1 9.8,5.8 15,6.3 11,10 12.4,15 8,12.5 3.6,15 5,10 1,6.3 6.2,5.8"
          fill={star <= rating ? '#C4783A' : '#E8E3D8'} />
      </svg>
    ))}
  </div>
)

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
  </div>
)

const AdminReviewsPage = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [minRating, setMinRating] = useState(0)

  const fetchReviews = () => {
    setLoading(true)
    axios.get('/api/products/reviews/all', { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setReviews(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  const filtered = minRating === 0 ? reviews : reviews.filter((r) => r.rating === minRating)

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  if (loading) return <AdminLayout title="Reviews"><Spinner /></AdminLayout>

  return (
    <AdminLayout title="Reviews">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {error && <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>}

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Total Reviews</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>{reviews.length}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Average Rating</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#C4783A', fontFamily: "'Playfair Display', serif" }}>{avgRating} ★</p>
        </div>
      </div>

      
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#aaa', fontWeight: 600 }}>Filter:</span>
        {[0, 5, 4, 3, 2, 1].map((n) => (
          <button key={n} onClick={() => setMinRating(n)}
            style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20,
              border: '1px solid #e0ddd6', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              background: minRating === n ? '#1a1a1a' : '#fff',
              color: minRating === n ? '#fff' : '#555',
            }}>
            {n === 0 ? 'All' : `${n} ★`}
          </button>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <p style={{ fontSize: 14, color: '#aaa' }}>No reviews found</p>
          </div>
        ) : (
          <div>
            {filtered.map((r, i) => (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px',
                borderBottom: i < filtered.length - 1 ? '1px solid #f0ede6' : 'none',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F7F6F2', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={r.productImage} alt={r.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = 'https://placehold.co/48x48/F7F6F2/999?text=?' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Link to={`/product/${r.productId}`} style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>
                      {r.productName}
                    </Link>
                    <span style={{ fontSize: 11, color: '#ccc' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <StarRating rating={r.rating} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>by {r.name}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminReviewsPage