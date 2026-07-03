import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetProductsQuery, useDeleteProductMutation } from '../../store/productsApi.js'
import axios from 'axios'
import AdminLayout from './AdminLayout.jsx'

const ProductList = () => {
  const { userInfo } = useSelector((s) => s.auth)
  const { data, isLoading, error, refetch } = useGetProductsQuery({})
  const [deleteProduct] = useDeleteProductMutation()
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await deleteProduct(id); refetch() } catch { alert('Failed to delete') }
  }

  const createHandler = async () => {
    setCreating(true)
    try {
      const { data } = await axios.post('/api/products',
        { name: 'New Product', price: 0, image: 'https://placehold.co/400x300?text=New+Product', brand: 'Brand', category: 'Men', subcategory: 'T-Shirts', description: 'Description', countInStock: 0 },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      )
      navigate(`/admin/product/${data._id}/edit`)
    } catch { alert('Failed to create product') } finally { setCreating(false) }
  }

  const allProducts  = data?.products || []
  const categories   = [...new Set(allProducts.map((p) => p.category))]
  const filtered     = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter === '' || p.category === catFilter)
  )
  const outOfStock   = allProducts.filter((p) => p.countInStock === 0).length

  if (isLoading) return (
    <AdminLayout title="Products">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '2px solid #C4783A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize: 13, color: '#aaa' }}>Loading…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout
      title="Products"
      action={
        <button onClick={createHandler} disabled={creating}
          style={{ height: 40, padding: '0 20px', background: creating ? '#ccc' : '#C4783A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          {creating ? 'Creating…' : '+ New Product'}
        </button>
      }
    >
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Products', value: allProducts.length },
          { label: 'Categories',     value: categories.length },
          { label: 'Out of Stock',   value: outOfStock, accent: outOfStock > 0 ? '#c0392b' : '#1a1a1a' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: s.accent || '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
          </div>
        ))}
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#bbb' }}>🔍</span>
          <input type="text" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 40, border: '1px solid #e0ddd6', borderRadius: 8, paddingLeft: 36, paddingRight: 14, fontSize: 13, background: '#F7F6F2', color: '#1a1a1a', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' }}
          />
        </div>
        <select value={catFilter} onChange={(e) => setCat(e.target.value)}
          style={{ height: 40, border: '1px solid #e0ddd6', borderRadius: 8, padding: '0 14px', fontSize: 13, background: '#F7F6F2', color: catFilter ? '#1a1a1a' : '#aaa', outline: 'none', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      
      <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FDFCFB' }}>
              {['Image', 'Product', 'Price', 'Category', 'Stock', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#bbb', borderBottom: '1px solid #f0ede6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#aaa' }}>No products found</td></tr>
            ) : filtered.map((product, i) => (
              <tr key={product._id}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f7f5f2' : 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FDFCFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ width: 52, height: 52, background: '#F7F6F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: 4 }}
                      onError={(e) => { e.target.src = 'https://placehold.co/52x52/F7F6F2/999?text=?' }} />
                  </div>
                </td>
                <td style={{ padding: '12px 18px', maxWidth: 200 }}>
                  <p style={{ fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{product.brand}</p>
                </td>
                <td style={{ padding: '12px 18px', fontWeight: 700, color: '#1a1a1a' }}>Rs. {product.price.toLocaleString()}</td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#F0EDE5', color: '#555' }}>{product.category}</span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: product.countInStock > 0 ? '#EDFAF3' : '#FFF0F0', color: product.countInStock > 0 ? '#1a7a4a' : '#c0392b' }}>
                    {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/admin/product/${product._id}/edit`} style={{ fontSize: 12, fontWeight: 600, color: '#C4783A', textDecoration: 'none', padding: '4px 12px', background: '#FFF4E8', borderRadius: 6 }}>
                      Edit
                    </Link>
                    <button onClick={() => deleteHandler(product._id)}
                      style={{ fontSize: 12, fontWeight: 600, color: '#c0392b', background: '#FFF0F0', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default ProductList