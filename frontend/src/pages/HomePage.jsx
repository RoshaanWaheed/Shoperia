import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetProductsQuery, useGetFeaturedProductsQuery } from '../store/productsApi'
import { addToCart } from '../store/cartSlice'

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <polygon
          points="6,1 7.4,4.2 11,4.6 8.5,7 9.2,11 6,9.3 2.8,11 3.5,7 1,4.6 4.6,4.2"
          fill={star <= Math.round(rating) ? '#C4783A' : '#E8E3D8'}
        />
      </svg>
    ))}
  </div>
)

const ProductSkeleton = () => (
  <div className="bg-white rounded-xl border border-stone-100 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-stone-100" />
    <div className="p-4 space-y-3">
      <div className="h-2.5 bg-stone-100 rounded w-1/4" />
      <div className="h-4 bg-stone-100 rounded w-3/4" />
      <div className="h-2.5 bg-stone-100 rounded w-1/2" />
      <div className="h-9 bg-stone-100 rounded-lg w-full mt-4" />
    </div>
  </div>
)

const categories = [
  {
    label: 'Men', count: '', keyword: 'men',
    image: 'Men.png',
  },
  {
    label: 'Women', count: '', keyword: 'women',
    image: 'Women.png',
  },
  {
    label: 'Kids', count: '', keyword: 'kids',
    image: 'Kido.png',
  },
]

const CategoryCard = ({ cat, onClick }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 14,
        aspectRatio: '3/4', cursor: 'pointer', border: 'none', padding: 0,
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.22)' : '0 4px 16px rgba(0,0,0,0.10)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'block', width: '100%',
      }}
    >
      <img
        src={cat.image}
        alt={cat.label}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.45s ease',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)',
      }} />
      {cat.badge && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
          background: '#C4783A', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {cat.badge}
        </span>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        <p style={{
          color: '#fff', fontWeight: 700, fontSize: 17, margin: 0,
          fontFamily: "'Playfair Display', serif", letterSpacing: '-0.2px',
        }}>
          {cat.label}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 12, margin: '3px 0 0', fontWeight: 400 }}>
          {cat.count} items
        </p>
      </div>
    </button>
  )
}

const HomePage = () => {
  const { search } = useLocation()
  const urlKeyword = new URLSearchParams(search).get('keyword') || ''
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [toast, setToast]   = useState({ show: false, message: '' })
  const [sortBy, setSortBy] = useState('default')

  
  
  const isSearch = Boolean(urlKeyword)

  const {
    data: catalogData,
    isLoading: catalogLoading,
    error: catalogError,
  } = useGetProductsQuery({ keyword: urlKeyword }, { skip: !isSearch })

  const {
    data: featuredData,
    isLoading: featuredLoading,
    error: featuredError,
  } = useGetFeaturedProductsQuery(12, { skip: isSearch })

  const isLoading = isSearch ? catalogLoading : featuredLoading
  const error      = isSearch ? catalogError   : featuredError

  
  const products = isSearch ? (catalogData?.products || []) : (featuredData || [])

  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }))
    setToast({ show: true, message: `"${product.name}" added to cart!` })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  const currencySymbol = 'Rs.'

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low')  return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating')     return b.rating - a.rating
    return 0
  })

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>

      
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border"
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#fff' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-sm font-semibold">{toast.message}</p>
          <button onClick={() => navigate('/cart')} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: '#C4783A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            View Cart →
          </button>
        </div>
      )}

      
      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>

        
        <img
          src="/Background.png"
          alt="Fashion"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(15,10,5,0.93) 0%, rgba(30,26,22,0.80) 45%, rgba(44,35,24,0.35) 100%)',
        }} />

        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />

        
        <div className="relative z-10 max-w-7xl mx-auto px-8 flex flex-col justify-center" style={{ minHeight: 480, paddingTop: 80, paddingBottom: 80 }}>
          <h1 className="text-5xl font-bold leading-tight mb-4 max-w-xl" style={{ fontFamily: "'Playfair Display', serif", color: '#fff', letterSpacing: '-1px' }}>
            Elevate <span style={{ color: '#C4783A', fontStyle: 'italic' }}>Your Style.</span>
          </h1>
          <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Discover the latest fashion trends with premium quality clothing. Enjoy fast delivery straight to your doorstep.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="font-semibold text-sm px-7 py-3 rounded-lg" style={{ background: '#C4783A', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Shop Now
            </button>
          </div>
        </div>
      </section>

      
      <section className="max-w-7xl mx-auto px-8 py-14">
        <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.label} cat={cat} onClick={() => navigate(`/category?keyword=${cat.keyword}`)} />
          ))}
        </div>
      </section>

      
      <section id="catalog" className="max-w-7xl mx-auto px-8 pb-16 scroll-mt-4">
        <div className="flex items-center justify-between mb-6 pb-5 border-b" style={{ borderColor: '#ebe8e0' }}>
          <div>
            {urlKeyword ? (
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
                  Results for <span style={{ color: '#C4783A' }}>"{urlKeyword}"</span>
                </h2>
                <button onClick={() => navigate('/')} className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: '#F0EDE5', color: '#555', border: 'none', cursor: 'pointer' }}>
                  Clear ✕
                </button>
              </div>
            ) : (
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>Featured Products</h2>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ background: '#fff', borderColor: '#e0ddd6', color: '#555', outline: 'none', cursor: 'pointer' }}>
            <option value="default">Sort: Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border p-10 text-center max-w-sm mx-auto my-10" style={{ borderColor: '#ebe8e0' }}>
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-sm font-bold mb-1" style={{ color: '#1a1a1a' }}>Could not load products</h3>
            <p className="text-xs mb-4" style={{ color: '#aaa' }}>Check your API connection and try again.</p>
            <button onClick={() => window.location.reload()} className="text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: '#1a1a1a', border: 'none', cursor: 'pointer' }}>Retry</button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center max-w-sm mx-auto my-12" style={{ borderColor: '#ebe8e0' }}>
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-sm font-bold mb-1" style={{ color: '#1a1a1a' }}>
              {urlKeyword ? 'No products found' : 'No featured products yet'}
            </h3>
            <p className="text-xs mb-4" style={{ color: '#aaa' }}>
              {urlKeyword ? 'Try a different category or search term.' : 'Mark products as "Featured" in admin to show them here.'}
            </p>
            <button onClick={() => navigate('/')} className="text-xs font-semibold" style={{ color: '#C4783A', background: 'none', border: 'none', cursor: 'pointer' }}>View All Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white rounded-xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: '#ebe8e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
              >
                <span className="absolute top-3 left-3 z-10 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded" style={{ background: '#1a1a1a' }}>
                  {product.category}
                </span>
                <Link to={`/product/${product._id}`} className="relative block overflow-hidden border-b" style={{ aspectRatio: '4/3', background: '#F7F6F2', borderColor: '#f0ede6' }}>
                  <img
                    src={product.image} alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    style={{ mixBlendMode: 'multiply' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/F7F6F2/999?text=No+Image' }}
                  />
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1 block" style={{ color: '#C4783A' }}>{product.brand || 'ProShop'}</span>
                  <Link to={`/product/${product._id}`} className="font-semibold text-sm leading-snug line-clamp-2 mb-3 block" style={{ color: '#1a1a1a', minHeight: 36, textDecoration: 'none' }}>
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={product.rating} />
                    <span className="text-[11px] font-medium" style={{ color: '#999' }}>{product.rating?.toFixed(1)} ({product.numReviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: '#f0ede6' }}>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#bbb' }}>Price</span>
                      <p className="text-base font-bold" style={{ color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                        {currencySymbol} {product.price?.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCartHandler(product)}
                      className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg active:scale-95"
                      style={{ background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: '0.5px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      
      <section className="max-w-7xl mx-auto px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-9 flex flex-col justify-end" style={{ minHeight: 200, background: 'linear-gradient(135deg,#1a1a1a,#2c2c2c)' }}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">🕶️</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px' }}>Accessories</p>
          <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Complete Your <span style={{ color: '#C4783A', fontStyle: 'italic' }}>Look</span></h3>
          <button onClick={() => navigate('/category?keyword=accessories')} className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-white w-fit" style={{ color: '#1a1a1a', border: 'none', cursor: 'pointer' }}>Shop Accessories →</button>
        </div>
        <div className="relative overflow-hidden rounded-2xl p-9 flex flex-col justify-end" style={{ minHeight: 200, background: 'linear-gradient(135deg,#3d2510,#5c3820)' }}>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">✨</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px' }}>New Arrivals</p>
          <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Fresh Drops This <span style={{ color: '#C4783A', fontStyle: 'italic' }}>Season</span></h3>
          <button onClick={() => navigate('/category?keyword=new')} className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-white w-fit" style={{ color: '#1a1a1a', border: 'none', cursor: 'pointer' }}>See What's New →</button>
        </div>
      </section>

    
      <div className="border-t" style={{ background: '#fff', borderColor: '#ebe8e0' }}>
        <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border" style={{ background: '#F7F6F2', borderColor: '#ebe8e0' }}>{f.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{f.title}</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#aaa' }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

export default HomePage