import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useUpdateProductMutation } from '../../store/productsApi.js'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const COLORS   = ['Black', 'White', 'Navy', 'Grey', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Orange', 'Purple']


const WAIST_SIZES  = ['26', '28', '30', '32', '34', '36', '38', '40', '42']

const INSEAM_SIZES = ['28', '30', '32', '34', '36']

const SUBCATEGORIES = {
  Men: [
    'T-Shirts', 'Shirts', 'Pants / Jeans', 'Jacket', 'Suits',
    'Sneakers', 'Formal Shoes', 'Boots', 'Footwear',
    'Belts', 'Watches', 'Sunglasses', 'Accessories',
  ],
  Women: [
    'Dresses', 'Tops', 'Jeans / Pants', 'Jacket', 'Skirts',
    'Heels', 'Sneakers', 'Boots', 'Footwear',
    'Bags & Purses', 'Jewelry', 'Sunglasses', 'Accessories',
  ],
  Kids: ['Boys', 'Girls'],
}





const JEANS_PANTS_SUBCATEGORIES = ['Pants / Jeans', 'Jeans / Pants']
const isJeansOrPants = (subcat) => JEANS_PANTS_SUBCATEGORIES.includes(subcat)

const ProductEdit = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { userInfo } = useSelector((s) => s.auth)
  const [updateProduct] = useUpdateProductMutation()

  const [name,         setName]     = useState('')
  const [price,        setPrice]    = useState(0)
  const [salePrice,    setSalePrice]= useState('')
  const [brand,        setBrand]    = useState('')
  const [category,     setCategory] = useState('')
  const [subcategory,  setSubcat]   = useState('')
  const [sku,          setSku]      = useState('')
  const [description,  setDesc]     = useState('')
  const [countInStock, setStock]    = useState(0)
  const [fabric,       setFabric]   = useState('')

  const [images,    setImages]   = useState([''])
  const [uploading, setUploading]= useState(false)

  const [sizes,   setSizes]   = useState([])
  const [colors,  setColors]  = useState([])
  const [inseam,  setInseam]  = useState([])
  const [isFeatured, setIsFeatured] = useState(false)
  const [showStockToCustomers, setShowStockToCustomers] = useState(true)

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const authHeader = userInfo?.token
    ? { Authorization: `Bearer ${userInfo.token}` }
    : {}

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(({ data }) => {
        setName(data.name || '')
        setPrice(data.price || 0)
        setSalePrice(data.salePrice ?? '')
        setBrand(data.brand || '')
        setCategory(data.category || '')
        setSubcat(data.subcategory || '')
        setSku(data.sku || '')
        setDesc(data.description || '')
        setStock(data.countInStock || 0)
        setFabric(data.fabric || '')
        setImages(data.images?.length ? data.images : [data.image || ''])
        setSizes(data.sizes || [])
        setColors(data.colors || [])
        setIsFeatured(Boolean(data.isFeatured))
        setShowStockToCustomers(data.showStockToCustomers !== undefined ? Boolean(data.showStockToCustomers) : true)
        
        const inseamData = data.inseam
        if (Array.isArray(inseamData)) {
          setInseam(inseamData)
        } else if (typeof inseamData === 'string' && inseamData) {
          setInseam(inseamData.split(',').map(s => s.trim()).filter(Boolean))
        } else {
          setInseam([])
        }
      })
      .catch((err) => setError('Failed to load product: ' + (err.response?.data?.message || err.message)))
      .finally(() => setLoading(false))
  }, [id])

  const uploadImage = async (file, index) => {
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authHeader,
        },
      })

      let url = ''
      if (typeof data === 'string') {
        url = data
      } else if (data?.url) {
        url = data.url
      } else if (data?.image) {
        url = data.image
      } else if (data?.imagePath) {
        url = data.imagePath
      } else if (data?.path) {
        url = data.path
      } else {
        throw new Error('Unexpected upload response: ' + JSON.stringify(data))
      }

      setImages(prev => {
        const arr = [...prev]
        arr[index] = url
        return arr
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed'
      setError('Image upload failed: ' + msg)
    } finally {
      setUploading(false)
    }
  }

  const addImageSlot = () => setImages(prev => [...prev, ''])
  const removeImage  = (i) => setImages(prev => prev.filter((_, idx) => idx !== i))
  const toggleSize   = (s) => setSizes(prev  => prev.includes(s)  ? prev.filter(x => x !== s) : [...prev, s])
  const toggleColor  = (c) => setColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleInseam = (s) => setInseam(prev => prev.includes(s)  ? prev.filter(x => x !== s) : [...prev, s])

  
  
  const handleSubcatChange = (value) => {
    setSubcat(value)
    if (!isJeansOrPants(value)) {
      setInseam([])
      
      
      setSizes([])
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    const cleanImages = images.filter(Boolean)

    const salePriceValue = salePrice !== '' && salePrice !== null
      ? Number(salePrice)
      : null

    if (salePriceValue !== null && salePriceValue >= Number(price)) {
      setError('Sale price must be less than the regular price.')
      setSaving(false)
      return
    }

    const isJeans = isJeansOrPants(subcategory)

    try {
      await updateProduct({
        id,
        name,
        price:        Number(price),
        salePrice:    salePriceValue,
        image:        cleanImages[0] || 'https://placehold.co/400x300?text=No+Image',
        images:       cleanImages,
        brand,
        category,
        subcategory,
        sku,
        fabric,
        description,
        countInStock: Number(countInStock),
        sizes,
        colors,
        
        
        inseam: isJeans ? inseam : [],
        isFeatured,
        showStockToCustomers,
      }).unwrap()

      setSuccess('Product saved!')
      setTimeout(() => navigate('/admin/products'), 1200)
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const base = {
    width: '100%', height: 44, border: '1px solid #e0ddd6', borderRadius: 10,
    padding: '0 14px', fontSize: 14, background: '#F7F6F2', color: '#1a1a1a',
    outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  }
  const lbl  = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }
  const inp  = {
    onFocus: (e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' },
    onBlur:  (e) => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' },
  }
  const section      = { background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 28, marginBottom: 20 }
  const sectionTitle = { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f0ede6', display: 'block' }

  if (loading) return (
    <AdminLayout title="Edit Product">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout title="Edit Product" action={<Link to="/admin/products" style={{ fontSize: 13, color: '#aaa', textDecoration: 'none' }}>← Back to Products</Link>}>
      <div style={{ maxWidth: 760 }}>
        {error   && <div style={{ background: '#FFF0F0', border: '1px solid #fcd5d5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b' }}>{error}</div>}
        {success && <div style={{ background: '#EDFAF3', border: '1px solid #b7eacf', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1a7a4a' }}>{success}</div>}

        <form onSubmit={submitHandler}>

          
          <div style={section}>
            <span style={sectionTitle}>📷 Product Images</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ background: '#F7F6F2', borderRadius: 10, border: '1px solid #ebe8e0', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
                    {img ? (
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} onError={(e) => { e.target.style.display = 'none' }} />
                    ) : (
                      <span style={{ fontSize: 28, opacity: 0.3 }}>📷</span>
                    )}
                    {i === 0 && (
                      <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 700, background: '#C4783A', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>MAIN</span>
                    )}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: uploading ? '#aaa' : '#C4783A', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 6 }}>
                    {uploading ? (
                      <>
                        <span style={{ width: 10, height: 10, border: '1.5px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Uploading…
                      </>
                    ) : '↑ Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={(e) => {
                        if (e.target.files[0]) uploadImage(e.target.files[0], i)
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const arr = [...images]
                      arr[i] = e.target.value
                      setImages(arr)
                    }}
                    placeholder="or paste URL…"
                    style={{ ...base, height: 34, fontSize: 11, padding: '0 10px' }}
                    {...inp}
                  />

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: '#c0392b', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {images.length < 6 && (
                <button
                  type="button"
                  onClick={addImageSlot}
                  style={{ height: 130, borderRadius: 10, border: '2px dashed #e0ddd6', background: '#F7F6F2', cursor: 'pointer', fontSize: 24, color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              )}
            </div>
          </div>

          
          <div style={section}>
            <span style={sectionTitle}>📝 Basic Info</span>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Classic Slim Fit Shirt" style={base} {...inp} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Brand</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="e.g. Zara" style={base} {...inp} />
              </div>
              <div>
                <label style={lbl}>SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. ZRA-SHT-001" style={base} {...inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Category</label>
                <select value={category} onChange={(e) => { setCategory(e.target.value); handleSubcatChange('') }} required style={{ ...base, cursor: 'pointer' }} {...inp}>
                  <option value="">Select category</option>
                  {['Men', 'Women', 'Kids', 'Sale', 'New Arrivals'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Subcategory</label>
                <select value={subcategory} onChange={(e) => handleSubcatChange(e.target.value)} style={{ ...base, cursor: 'pointer' }} {...inp} disabled={!category || !SUBCATEGORIES[category]}>
                  <option value="">Select subcategory</option>
                  {(SUBCATEGORIES[category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {subcategory && SUBCATEGORIES[category] && !SUBCATEGORIES[category].includes(subcategory) && (
                  <p style={{ fontSize: 11, color: '#C4783A', marginTop: 6 }}>
                    Current: "{subcategory}" — please re-select from the list to fix filtering.
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Fabric / Material</label>
              <input type="text" value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="e.g. 100% Cotton, Linen blend…" style={base} {...inp} />
            </div>

            <div>
              <label style={lbl}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                required
                rows={4}
                placeholder="Product description…"
                style={{ ...base, height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
                onFocus={(e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' }}
                onBlur={(e)  => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' }}
              />
            </div>

            
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F7F6F2', borderRadius: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>⭐ Show on Homepage</p>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Featured products appear in the homepage showcase</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(prev => !prev)}
                style={{
                  width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: isFeatured ? '#C4783A' : '#e0ddd6', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
                aria-label="Toggle featured"
              >
                <span style={{
                  position: 'absolute', top: 3, left: isFeatured ? 23 : 3, width: 22, height: 22, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F7F6F2', borderRadius: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>📦 Show Stock to Customers</p>
                <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>
                  {showStockToCustomers
                    ? 'Customers will see stock status (e.g. "In Stock" / "Out of Stock") on the product page'
                    : 'Stock info will be hidden — customers will just see the Add to Cart button'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockToCustomers(prev => !prev)}
                style={{
                  width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: showStockToCustomers ? '#C4783A' : '#e0ddd6', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
                aria-label="Toggle stock visibility"
              >
                <span style={{
                  position: 'absolute', top: 3, left: showStockToCustomers ? 23 : 3, width: 22, height: 22, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          
          <div style={section}>
            <span style={sectionTitle}>Pricing & Stock</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Price (Rs.)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" placeholder="0" style={base} {...inp} />
              </div>
              <div>
                <label style={lbl}>Sale Price (Rs.)</label>
                <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} min="0" placeholder="Leave empty if no sale" style={base} {...inp} />
              </div>
              <div>
                <label style={lbl}>Stock Qty</label>
                <input type="number" value={countInStock} onChange={(e) => setStock(e.target.value)} required min="0" placeholder="0" style={base} {...inp} />
              </div>
            </div>
            {salePrice && Number(salePrice) < Number(price) && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF4E8', borderRadius: 8, fontSize: 13, color: '#C4783A', fontWeight: 600 }}>
                 {Math.round((1 - salePrice / price) * 100)}% OFF — customers will see Rs. {Number(salePrice).toLocaleString()} (was Rs. {Number(price).toLocaleString()})
              </div>
            )}
          </div>

          
          <div style={section}>
            {isJeansOrPants(subcategory) ? (
              <>
                <span style={sectionTitle}>Waist Sizes (inches)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {WAIST_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${sizes.includes(s) ? '#1a1a1a' : '#e0ddd6'}`, background: sizes.includes(s) ? '#1a1a1a' : '#fff', color: sizes.includes(s) ? '#fff' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                      {s}
                    </button>
                  ))}
                </div>
                {sizes.length > 0 && <p style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>Selected: {sizes.join(', ')}</p>}
              </>
            ) : (
              <>
                <span style={sectionTitle}>Available Sizes</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${sizes.includes(s) ? '#1a1a1a' : '#e0ddd6'}`, background: sizes.includes(s) ? '#1a1a1a' : '#fff', color: sizes.includes(s) ? '#fff' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                      {s}
                    </button>
                  ))}
                </div>
                {sizes.length > 0 && <p style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>Selected: {sizes.join(', ')}</p>}
              </>
            )}
          </div>

          
          {isJeansOrPants(subcategory) && (
            <div style={section}>
              <span style={sectionTitle}>📏 Inseam Sizes (inches)</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {INSEAM_SIZES.map(s => (
                  <button key={s} type="button" onClick={() => toggleInseam(s)}
                    style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${inseam.includes(s) ? '#1a1a1a' : '#e0ddd6'}`, background: inseam.includes(s) ? '#1a1a1a' : '#fff', color: inseam.includes(s) ? '#fff' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                    {s}
                  </button>
                ))}
              </div>
              {inseam.length > 0 && <p style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>Selected: {inseam.join(', ')}</p>}
            </div>
          )}

          
          <div style={section}>
            <span style={sectionTitle}>Available Colors</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => toggleColor(c)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${colors.includes(c) ? '#C4783A' : '#e0ddd6'}`, background: colors.includes(c) ? '#FFF4E8' : '#fff', color: colors.includes(c) ? '#C4783A' : '#555', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>
                  {c}
                </button>
              ))}
            </div>
            {colors.length > 0 && <p style={{ marginTop: 10, fontSize: 12, color: '#aaa' }}>Selected: {colors.join(', ')}</p>}
          </div>

          
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving || uploading}
              style={{ flex: 1, height: 48, background: (saving || uploading) ? '#ccc' : '#C4783A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: (saving || uploading) ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {saving ? 'Saving…' : uploading ? 'Wait for upload…' : 'Save Product'}
            </button>
            <Link to="/admin/products"
              style={{ flex: 1, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0EDE5', color: '#555', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </AdminLayout>
  )
}

export default ProductEdit