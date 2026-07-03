import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/cartSlice'
import axios from 'axios'




const JEANS_PANTS_SUBCATEGORIES = ['Pants / Jeans', 'Jeans / Pants']
const isJeansOrPants = (subcat) => JEANS_PANTS_SUBCATEGORIES.includes(subcat)


const StarRating = ({ rating = 0, interactive = false, onRate, hovered = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(star => (
      <svg key={star} width="16" height="16" viewBox="0 0 16 16"
        onClick={() => interactive && onRate?.(star)}
        style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0 }}>
        <polygon points="8,1 9.8,5.8 15,6.3 11,10 12.4,15 8,12.5 3.6,15 5,10 1,6.3 6.2,5.8"
          fill={star <= Math.round(hovered || rating) ? '#C4783A' : '#E8E3D8'} />
      </svg>
    ))}
  </div>
)

const ProductPage = () => {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const dispatch   = useDispatch()
  const { userInfo } = useSelector(s => s.auth)

  const [product,      setProduct]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [qty,          setQty]          = useState(1)
  const [activeImg,    setActiveImg]    = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor,setSelectedColor]= useState('')
  const [selectedWaist,setSelectedWaist]= useState('')
  const [selectedInseam,setSelectedInseam]= useState('')
  const [addedToCart,  setAddedToCart]  = useState(false)

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`)
      setProduct(data)
      if (data.colors?.length) setSelectedColor(data.colors[0])

      const isJeans = isJeansOrPants(data.subcategory)

      if (isJeans) {
        
        if (data.sizes?.length) setSelectedWaist(data.sizes[0])
        
        const inseamArray = Array.isArray(data.inseam)
          ? data.inseam
          : (typeof data.inseam === 'string' ? data.inseam.split(',').map(s => s.trim()).filter(Boolean) : [])
        if (inseamArray.length) setSelectedInseam(inseamArray[0])
      } else {
        
        if (data.sizes?.length) setSelectedSize(data.sizes[0])
      }
    } catch { setError('Product not found') }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchProduct() }, [id])

  const images = product?.images?.length > 0 ? product.images : product ? [product.image] : []

  const discountPct = product?.salePrice && product.salePrice < product.price
    ? Math.round((1 - product.salePrice / product.price) * 100) : 0

  const displayPrice = product?.salePrice || product?.price

  const addToCartHandler = () => {
    const isJeans = isJeansOrPants(product.subcategory)
    dispatch(addToCart({
      ...product,
      qty,
      selectedSize: isJeans ? selectedWaist : selectedSize,
      selectedColor,
      selectedWaist: isJeans ? selectedWaist : undefined,
      selectedInseam: isJeans ? selectedInseam : undefined,
    }))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F7F6F2', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: '#aaa', fontSize: 13 }}>Loading product…</p>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F7F6F2', gap: 16 }}>
      <span style={{ fontSize: 40 }}>⚠️</span>
      <p style={{ color: '#555', fontSize: 14, fontWeight: 600 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Back to Shop</button>
    </div>
  )

  const isJeans = isJeansOrPants(product.subcategory)

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#aaa', marginBottom: 24 }}>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#C4783A'} onMouseLeave={e => e.target.style.color='#aaa'}>Home</Link>
          <span>/</span>
          {product.category && <><Link to={`/?keyword=${product.category.toLowerCase()}`} style={{ color: '#aaa', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color='#C4783A'} onMouseLeave={e => e.target.style.color='#aaa'}>{product.category}</Link><span>/</span></>}
          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{product.name}</span>
        </div>

        
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #ebe8e0', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

            
            <div style={{ background: '#F7F6F2', borderRight: '1px solid #f0ede6', padding: 24 }}>
              
              <div style={{ position: 'relative', background: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 12, aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={images[activeImg]} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://placehold.co/500x600/F7F6F2/999?text=No+Image' }}
                />
                {discountPct > 0 && (
                  <span style={{ position: 'absolute', top: 14, left: 14, background: '#C4783A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                    -{discountPct}% OFF
                  </span>
                )}
                <span style={{ position: 'absolute', top: 14, right: 14, background: '#1a1a1a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {product.category}
                </span>
              </div>

              
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === activeImg ? '#C4783A' : '#e0ddd6'}`, padding: 0, cursor: 'pointer', background: '#fff', flexShrink: 0, transition: 'border-color 0.15s' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            
            <div style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>

              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4783A' }}>{product.brand}</span>
                {product.sku && <span style={{ fontSize: 11, color: '#bbb' }}>SKU: {product.sku}</span>}
              </div>

              
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 14 }}>
                {product.name}
              </h1>

              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <StarRating rating={product.rating} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{product.rating?.toFixed(1)}</span>
                <span style={{ fontSize: 12, color: '#bbb' }}>({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})</span>
              </div>

              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>
                  Rs. {Number(displayPrice).toLocaleString()}
                </span>
                {discountPct > 0 && (
                  <span style={{ fontSize: 18, color: '#bbb', textDecoration: 'line-through' }}>
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              
              {product.showStockToCustomers && (
                <div style={{ marginBottom: 20 }}>
                  {product.countInStock > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 20, background: '#EDFAF3', color: '#1a7a4a' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      In Stock · {product.countInStock} left
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 20, background: '#FFF0F0', color: '#c0392b' }}>
                      Out of Stock
                    </span>
                  )}
                </div>
              )}

              
              {product.colors?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                    Color: <span style={{ color: '#1a1a1a' }}>{selectedColor}</span>
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.colors.map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${selectedColor === c ? '#1a1a1a' : '#e0ddd6'}`, background: selectedColor === c ? '#1a1a1a' : '#fff', color: selectedColor === c ? '#fff' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              
              {product.sizes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {isJeans ? (
                    <>
                      
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                        Waist: <span style={{ color: '#1a1a1a' }}>{selectedWaist}</span>
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        {product.sizes.map(s => (
                          <button key={s} onClick={() => setSelectedWaist(s)}
                            style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${selectedWaist === s ? '#1a1a1a' : '#e0ddd6'}`, background: selectedWaist === s ? '#1a1a1a' : '#fff', color: selectedWaist === s ? '#fff' : '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                      
                      {(() => {
                        const inseamOptions = Array.isArray(product.inseam)
                          ? product.inseam
                          : (typeof product.inseam === 'string' ? product.inseam.split(',').map(s => s.trim()).filter(Boolean) : [])
                        if (!inseamOptions.length) return null
                        return (
                          <>
                            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                              Inseam: <span style={{ color: '#1a1a1a' }}>{selectedInseam}</span>
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {inseamOptions.map(s => (
                                <button key={s} onClick={() => setSelectedInseam(s)}
                                  style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${selectedInseam === s ? '#1a1a1a' : '#e0ddd6'}`, background: selectedInseam === s ? '#1a1a1a' : '#fff', color: selectedInseam === s ? '#fff' : '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </>
                        )
                      })()}
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: 10 }}>
                        Size: <span style={{ color: '#1a1a1a' }}>{selectedSize}</span>
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {product.sizes.map(s => (
                          <button key={s} onClick={() => setSelectedSize(s)}
                            style={{ width: 48, height: 48, borderRadius: 8, border: `1.5px solid ${selectedSize === s ? '#1a1a1a' : '#e0ddd6'}`, background: selectedSize === s ? '#1a1a1a' : '#fff', color: selectedSize === s ? '#fff' : '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              
              {product.fabric && (
                <div style={{ marginBottom: 18, padding: '10px 14px', background: '#F7F6F2', borderRadius: 8, fontSize: 13, color: '#666' }}>
                  <strong>Material:</strong> {product.fabric}
                </div>
              )}

              
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#666', marginBottom: 24 }}>{product.description}</p>

              
              {product.countInStock > 0 && (
                <div style={{ marginTop: 'auto' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa' }}>Qty</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0ddd6', borderRadius: 10, overflow: 'hidden' }}>
                      <button onClick={() => setQty(Math.max(1, qty-1))} style={{ width: 40, height: 40, background: '#F7F6F2', border: 'none', fontSize: 18, cursor: 'pointer', color: '#555' }}>−</button>
                      <span style={{ width: 44, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1a1a1a', borderLeft: '1px solid #e0ddd6', borderRight: '1px solid #e0ddd6', lineHeight: '40px' }}>{qty}</span>
                      <button onClick={() => setQty(Math.min(product.countInStock, qty+1))} style={{ width: 40, height: 40, background: '#F7F6F2', border: 'none', fontSize: 18, cursor: 'pointer', color: '#555' }}>+</button>
                    </div>
                  </div>

                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={addToCartHandler}
                      style={{ flex: 1, height: 50, borderRadius: 12, border: 'none', background: addedToCart ? '#1a7a4a' : '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'DM Sans', sans-serif" }}
                      onMouseEnter={e => { if (!addedToCart) e.currentTarget.style.background='#C4783A' }}
                      onMouseLeave={e => { if (!addedToCart) e.currentTarget.style.background='#1a1a1a' }}>
                      {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                    <button onClick={() => {
                      dispatch(addToCart({
                        ...product,
                        qty,
                        selectedSize: isJeans ? selectedWaist : selectedSize,
                        selectedColor,
                        selectedWaist: isJeans ? selectedWaist : undefined,
                        selectedInseam: isJeans ? selectedInseam : undefined,
                      }));
                      navigate('/cart')
                    }}
                      style={{ flex: 1, height: 50, borderRadius: 12, border: '1.5px solid #e0ddd6', background: '#fff', color: '#1a1a1a', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background='#F7F6F2'}
                      onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                      Buy Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #ebe8e0', padding: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>
            Reviews <span style={{ fontSize: 14, fontWeight: 400, color: '#aaa', fontFamily: "'DM Sans', sans-serif" }}>({product.numReviews})</span>
          </h2>
          {product.reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>No reviews yet</p>
              <p style={{ fontSize: 12, color: '#bbb', marginTop: 4 }}>Reviews appear here once verified buyers share their experience.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {product.reviews.map(r => (
                <div key={r._id} style={{ paddingBottom: 20, borderBottom: '1px solid #f0ede6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0EDE5', color: '#C4783A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                        {r.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{r.name}</p>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: '#ccc' }}>{new Date(r.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#666', marginLeft: 42 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPage