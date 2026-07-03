import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetProductsQuery } from '../store/productsApi.js'
import { addToCart } from '../store/cartSlice.js'

const StarRating = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map((s) => (
      <svg key={s} width="12" height="12" viewBox="0 0 16 16">
        <polygon points="8,1 9.8,5.8 15,6.3 11,10 12.4,15 8,12.5 3.6,15 5,10 1,6.3 6.2,5.8"
          fill={s <= Math.round(rating) ? '#C4783A' : '#E8E3D8'} />
      </svg>
    ))}
  </div>
)

const SearchPage = () => {
  const [searchParams]  = useSearchParams()
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const keyword         = searchParams.get('keyword') || ''

  const [maxPrice,          setMaxPrice]    = useState(10000)
  const [selectedCategory,  setCat]         = useState('')
  const [selectedRating,    setRating]      = useState(0)
  const [currentPage,       setPage]        = useState(1)
  const PER_PAGE = 8

  const { data, isLoading, error } = useGetProductsQuery({ keyword })

  const categories = [...new Set(data?.products?.map((p) => p.category) || [])]

  const filtered = (data?.products || []).filter((p) =>
    p.price <= maxPrice &&
    (selectedCategory === '' || p.category === selectedCategory) &&
    (selectedRating === 0 || p.rating >= selectedRating)
  )

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const current    = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const addHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }))
    navigate('/cart')
  }

  const resetFilters = () => { setMaxPrice(10000); setCat(''); setRating(0); setPage(1) }

  const filterBtn = (active) => ({
    width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    background: active ? '#1a1a1a' : 'transparent', color: active ? '#fff' : '#555',
    transition: 'background 0.12s',
  })

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: 12, background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <p style={{ fontSize: 14, color: '#c0392b' }}>Error loading products</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '36px 32px' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#bbb', marginBottom: 20 }}>
          <Link to="/" style={{ color: '#bbb', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C4783A'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#bbb'}>Home</Link>
          <span>/</span>
          <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{keyword ? `"${keyword}"` : 'All Products'}</span>
        </div>

        
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
            {keyword ? `Results for "${keyword}"` : 'All Products'}
          </h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>{filtered.length} products found</p>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          
          <div style={{ width: 220, flexShrink: 0, background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 20, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Filters</p>
              <button onClick={resetFilters} style={{ fontSize: 11, fontWeight: 600, color: '#C4783A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Clear all
              </button>
            </div>

            
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0ede6' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Max Price</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 8 }}>
                <span>Rs. 0</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>Rs. {maxPrice.toLocaleString()}</span>
              </div>
              <input type="range" min="0" max="10000" step="500" value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1) }}
                style={{ width: '100%', accentColor: '#C4783A' }} />
            </div>

            
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f0ede6' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>Category</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={() => { setCat(''); setPage(1) }} style={filterBtn(selectedCategory === '')}
                  onMouseEnter={(e) => { if (selectedCategory !== '') e.currentTarget.style.background = '#F7F6F2' }}
                  onMouseLeave={(e) => { if (selectedCategory !== '') e.currentTarget.style.background = 'transparent' }}>
                  All Categories
                </button>
                {categories.map((c) => (
                  <button key={c} onClick={() => { setCat(c); setPage(1) }} style={filterBtn(selectedCategory === c)}
                    onMouseEnter={(e) => { if (selectedCategory !== c) e.currentTarget.style.background = '#F7F6F2' }}
                    onMouseLeave={(e) => { if (selectedCategory !== c) e.currentTarget.style.background = 'transparent' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>Min Rating</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[0, 4, 3, 2, 1].map((r) => (
                  <button key={r} onClick={() => { setRating(r); setPage(1) }} style={filterBtn(selectedRating === r)}
                    onMouseEnter={(e) => { if (selectedRating !== r) e.currentTarget.style.background = '#F7F6F2' }}
                    onMouseLeave={(e) => { if (selectedRating !== r) e.currentTarget.style.background = 'transparent' }}>
                    {r === 0 ? 'All Ratings' : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          
          <div style={{ flex: 1, minWidth: 0 }}>
            {current.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '64px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>No products found</h2>
                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 20 }}>Try adjusting your filters or search terms.</p>
                <button onClick={resetFilters}
                  style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {current.map((product) => (
                    <div key={product._id}
                      style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.09)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <Link to={`/product/${product._id}`} style={{ display: 'block', background: '#F7F6F2', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        <img src={product.image} alt={product.name}
                          style={{ maxHeight: 140, maxWidth: '80%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                          onError={(e) => { e.target.src = 'https://placehold.co/200x160/F7F6F2/999?text=?' }} />
                        <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: '#1a1a1a', color: '#fff' }}>
                          {product.category}
                        </span>
                      </Link>
                      <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#C4783A', marginBottom: 4 }}>{product.brand}</span>
                        <Link to={`/product/${product._id}`} style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <StarRating rating={product.rating} />
                          <span style={{ fontSize: 11, color: '#aaa' }}>({product.numReviews})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                            Rs. {product.price.toLocaleString()}
                          </p>
                          <button onClick={() => addHandler(product)} disabled={product.countInStock === 0}
                            style={{ fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", background: product.countInStock === 0 ? '#F0EDE5' : '#1a1a1a', color: product.countInStock === 0 ? '#aaa' : '#fff', transition: 'background 0.12s' }}
                            onMouseEnter={(e) => { if (product.countInStock > 0) e.currentTarget.style.background = '#C4783A' }}
                            onMouseLeave={(e) => { if (product.countInStock > 0) e.currentTarget.style.background = '#1a1a1a' }}
                          >
                            {product.countInStock === 0 ? 'Sold Out' : 'Add +'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <button onClick={() => { setPage(p => Math.max(1, p-1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#555', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                      ← Prev
                    </button>
                    {[...Array(totalPages).keys()].map((x) => (
                      <button key={x+1} onClick={() => { setPage(x+1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e0ddd6', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", background: currentPage === x+1 ? '#1a1a1a' : '#fff', color: currentPage === x+1 ? '#fff' : '#555' }}>
                        {x+1}
                      </button>
                    ))}
                    <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      disabled={currentPage === totalPages}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#555', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage