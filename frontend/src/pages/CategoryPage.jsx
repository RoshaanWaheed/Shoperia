import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import { useGetProductsQuery } from '../store/productsApi'

const StarRating = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(star => (
      <svg key={star} width="11" height="11" viewBox="0 0 12 12" fill="none">
        <polygon points="6,1 7.4,4.2 11,4.6 8.5,7 9.2,11 6,9.3 2.8,11 3.5,7 1,4.6 4.6,4.2"
          fill={star <= Math.round(rating) ? '#C4783A' : '#E8E3D8'} />
      </svg>
    ))}
  </div>
)

const ProductSkeleton = () => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebe8e0', overflow: 'hidden' }}>
    <div style={{ aspectRatio: '3/4', background: '#F0EDE5' }} />
    <div style={{ padding: 16 }}>
      <div style={{ height: 10, background: '#F0EDE5', borderRadius: 4, width: '40%', marginBottom: 10 }} />
      <div style={{ height: 14, background: '#F0EDE5', borderRadius: 4, width: '80%', marginBottom: 8 }} />
      <div style={{ height: 10, background: '#F0EDE5', borderRadius: 4, width: '60%' }} />
    </div>
  </div>
)

const ALL_SIZES  = ['XS','S','M','L','XL','XXL','XXXL']
const ALL_COLORS = ['Black','White','Navy','Grey','Brown','Beige','Red','Blue','Green','Pink']

const CategoryPage = () => {
  const location = useLocation()
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  
  
  
  const { keyword: routeKeyword } = useParams()
  const searchParams = new URLSearchParams(location.search)
  const keyword = routeKeyword || searchParams.get('keyword') || ''
  const pageNumber = Number(searchParams.get('page')) || 1

  const [sortBy,         setSortBy]         = useState('default')
  const [selectedSizes,  setSelectedSizes]  = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [priceMax,       setPriceMax]       = useState(50000)
  const [addedId,        setAddedId]        = useState(null)

  
  useEffect(() => {
    setSelectedSizes([])
    setSelectedColors([])
    setSortBy('default')
    setPriceMax(50000)
  }, [keyword])

  
  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber })

  const toggleSize  = (s) => setSelectedSizes(p  => p.includes(s) ? p.filter(x=>x!==s) : [...p,s])
  const toggleColor = (c) => setSelectedColors(p => p.includes(c) ? p.filter(x=>x!==c) : [...p,c])

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }))
    setAddedId(product._id)
    setTimeout(() => setAddedId(null), 2000)
  }

  
  const products = (data?.products || [])
    .filter(p => selectedSizes.length  === 0 || p.sizes?.some(s  => selectedSizes.includes(s)))
    .filter(p => selectedColors.length === 0 || p.colors?.some(c => selectedColors.includes(c)))
    .filter(p => (p.salePrice || p.price) <= priceMax)
    .sort((a, b) => {
      const pa = a.salePrice || a.price
      const pb = b.salePrice || b.price
      if (sortBy === 'price-low')  return pa - pb
      if (sortBy === 'price-high') return pb - pa
      if (sortBy === 'rating')     return b.rating - a.rating
      if (sortBy === 'newest')     return new Date(b.createdAt) - new Date(a.createdAt)
      return 0
    })

  const totalPages        = data?.pages || 1
  const activeFiltersCount = selectedSizes.length + selectedColors.length + (priceMax < 50000 ? 1 : 0)

  
  const breadcrumbLabel = keyword
    ? keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'All Products'

  const topCategory = keyword.includes('-')
    ? keyword.split('-')[0].charAt(0).toUpperCase() + keyword.split('-')[0].slice(1)
    : null

  const goToPage = (p) => {
    const sp = new URLSearchParams(location.search)
    sp.set('page', p)
    navigate(`/category?${sp.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>

        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#aaa', marginBottom: 20 }}>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.color='#C4783A'}
            onMouseLeave={e => e.target.style.color='#aaa'}>Home</Link>
          {topCategory && (
            <><span>/</span>
            <button onClick={() => navigate(`/category?keyword=${topCategory.toLowerCase()}`)}
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => e.target.style.color='#C4783A'}
              onMouseLeave={e => e.target.style.color='#aaa'}>
              {topCategory}
            </button></>
          )}
          <span>/</span>
          <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{breadcrumbLabel}</span>
        </div>

        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              {breadcrumbLabel}
            </h1>
            <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>
              {isLoading ? 'Loading…' : `${products.length} products`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {activeFiltersCount > 0 && (
              <button onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceMax(50000) }}
                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#C4783A', fontFamily: "'DM Sans', sans-serif" }}>
                Clear Filters ({activeFiltersCount})
              </button>
            )}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', fontSize: 13, fontWeight: 600, color: '#555', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              <option value="default">Sort: Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

          
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ebe8e0', padding: 22, position: 'sticky', top: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f0ede6' }}>Filters</p>

            
            <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #f0ede6' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Max Price</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                <span>Rs. 0</span>
                <span style={{ color: '#C4783A' }}>Rs. {priceMax.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={10000} step={1000} value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#C4783A', cursor: 'pointer' }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {[1000,5000,10000].map(p => (
                  <button key={p} onClick={() => setPriceMax(p)}
                    style={{ flex: 1, padding: '4px 0', borderRadius: 6, border: `1px solid ${priceMax===p?'#C4783A':'#e0ddd6'}`, background: priceMax===p?'#FFF4E8':'#fff', color: priceMax===p?'#C4783A':'#888', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minWidth: 36 }}>
                    {p>=1000?`${p/1000}k`:p}
                  </button>
                ))}
              </div>
            </div>

            
            <div style={{ marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #f0ede6' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Size</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ALL_SIZES.map(s => (
                  <button key={s} onClick={() => toggleSize(s)}
                    style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${selectedSizes.includes(s)?'#1a1a1a':'#e0ddd6'}`, background: selectedSizes.includes(s)?'#1a1a1a':'#fff', color: selectedSizes.includes(s)?'#fff':'#555', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 12 }}>Color</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ALL_COLORS.map(c => (
                  <button key={c} onClick={() => toggleColor(c)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, border: `1px solid ${selectedColors.includes(c)?'#C4783A':'transparent'}`, background: selectedColors.includes(c)?'#FFF4E8':'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #e0ddd6', flexShrink: 0,
                      background: c==='Black'?'#1a1a1a':c==='White'?'#fff':c==='Navy'?'#1B2A4A':c==='Grey'?'#9ca3af':c==='Brown'?'#92400e':c==='Beige'?'#d4b896':c==='Red'?'#ef4444':c==='Blue'?'#3b82f6':c==='Green'?'#22c55e':c==='Pink'?'#ec4899':'#ccc'
                    }} />
                    <span style={{ fontSize: 13, color: selectedColors.includes(c)?'#C4783A':'#555', fontWeight: 500 }}>{c}</span>
                    {selectedColors.includes(c) && (
                      <svg style={{ marginLeft: 'auto' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4783A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          
          <div>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ebe8e0', padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Could not load products</p>
                <button onClick={() => window.location.reload()}
                  style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
              </div>
            ) : products.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #ebe8e0', padding: 80, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>No products found</h3>
                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>Try adjusting your filters or browse another category</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {activeFiltersCount > 0 && (
                    <button onClick={() => { setSelectedSizes([]); setSelectedColors([]); setPriceMax(50000) }}
                      style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e0ddd6', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                      Clear Filters
                    </button>
                  )}
                  <button onClick={() => navigate('/')}
                    style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {products.map(product => {
                    const displayPrice = product.salePrice || product.price
                    const discountPct  = product.salePrice && product.salePrice < product.price
                      ? Math.round((1 - product.salePrice / product.price) * 100) : 0

                    return (
                      <div key={product._id}
                        style={{ background: '#fff', borderRadius: 14, border: '1px solid #ebe8e0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.10)'; e.currentTarget.style.transform='translateY(-3px)' }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}>

                        <Link to={`/product/${product._id}`} style={{ position: 'relative', display: 'block', aspectRatio: '3/4', background: '#F7F6F2', overflow: 'hidden', textDecoration: 'none' }}>
                          <img src={product.image} alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                            onMouseEnter={e => e.target.style.transform='scale(1.06)'}
                            onMouseLeave={e => e.target.style.transform='scale(1)'}
                            onError={e => e.target.src='https://placehold.co/300x400/F7F6F2/999?text=No+Image'} />
                          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: '#1a1a1a', color: '#fff', textTransform: 'uppercase' }}>
                              {product.category}
                            </span>
                            {discountPct > 0 && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 4, background: '#C4783A', color: '#fff' }}>
                                -{discountPct}%
                              </span>
                            )}
                          </div>
                        </Link>

                        <div style={{ padding: '14px 14px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4783A', marginBottom: 4, display: 'block' }}>
                            {product.brand}
                          </span>
                          <Link to={`/product/${product._id}`} style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.name}
                          </Link>

                          {product.sizes?.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                              {product.sizes.slice(0,4).map(s => (
                                <span key={s} style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4, border: '1px solid #e0ddd6', color: '#888' }}>{s}</span>
                              ))}
                              {product.sizes.length > 4 && <span style={{ fontSize: 9, color: '#bbb' }}>+{product.sizes.length-4}</span>}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                            <StarRating rating={product.rating} />
                            <span style={{ fontSize: 11, color: '#bbb' }}>({product.numReviews})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0, fontFamily: "'Playfair Display', serif" }}>
                                Rs. {Number(displayPrice).toLocaleString()}
                              </p>
                              {discountPct > 0 && (
                                <p style={{ fontSize: 11, color: '#bbb', textDecoration: 'line-through', margin: '2px 0 0' }}>
                                  Rs. {Number(product.price).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <button onClick={() => addToCartHandler(product)}
                              style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: addedId===product._id?'#1a7a4a':'#1a1a1a', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
                              onMouseEnter={e => { if(addedId!==product._id) e.currentTarget.style.background='#C4783A' }}
                              onMouseLeave={e => { if(addedId!==product._id) e.currentTarget.style.background='#1a1a1a' }}>
                              {addedId===product._id ? (
                                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                              ) : (
                                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <button onClick={() => goToPage(pageNumber-1)} disabled={pageNumber===1}
                      style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', cursor: pageNumber===1?'not-allowed':'pointer', color: pageNumber===1?'#ccc':'#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1
                      return (
                        <button key={p} onClick={() => goToPage(p)}
                          style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${p===pageNumber?'#1a1a1a':'#e0ddd6'}`, background: p===pageNumber?'#1a1a1a':'#fff', color: p===pageNumber?'#fff':'#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                          {p}
                        </button>
                      )
                    })}
                    <button onClick={() => goToPage(pageNumber+1)} disabled={pageNumber===totalPages}
                      style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', cursor: pageNumber===totalPages?'not-allowed':'pointer', color: pageNumber===totalPages?'#ccc':'#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
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

export default CategoryPage