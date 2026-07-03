import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromCart, updateCartItem } from '../store/cartSlice.js'

const CartPage = () => {
  const { cartItems } = useSelector((s) => s.cart)
  const { userInfo }  = useSelector((s) => s.auth)
  const dispatch      = useDispatch()
  const navigate      = useNavigate()

  const remove  = (id)       => dispatch(removeFromCart(id))
  const update  = (id, qty)  => dispatch(updateCartItem({ id, qty }))

  const itemsPrice    = cartItems.reduce((a, i) => a + i.price * i.qty, 0)
  const shippingPrice = itemsPrice > 1000 ? 0 : 100
  const taxPrice      = Number((0.15 * itemsPrice).toFixed(2))
  const totalPrice    = (itemsPrice + shippingPrice + taxPrice).toFixed(2)
  const totalItems    = cartItems.reduce((a, i) => a + i.qty, 0)

  const checkoutHandler = () => navigate(userInfo ? '/shipping' : '/login?redirect=/shipping')

  const s = {
    page:  { minHeight: '100vh', background: '#F7F6F2', fontFamily: "'DM Sans', sans-serif", padding: '40px 32px' },
    card:  { background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16 },
  }

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: '#1a1a1a' }}>
            Shopping Cart
          </h1>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ ...s.card, padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#1a1a1a', marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ fontSize: 14, color: '#aaa', marginBottom: 24 }}>Looks like you haven't added anything yet.</p>
            <Link to="/" style={{ display: 'inline-block', background: '#1a1a1a', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cartItems.map((item) => (
                <div key={item._id} style={{ ...s.card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* Image */}
                  <Link to={`/product/${item._id}`}>
                    <div style={{ width: 80, height: 80, background: '#F7F6F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', padding: 8 }}
                        onError={(e) => { e.target.src = 'https:
                    </div>
                  </Link>

                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#C4783A' }}>{item.brand}</span>
                    <Link to={`/product/${item._id}`} style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none', marginTop: 2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Link>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>

                  
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0ddd6', borderRadius: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        if (item.qty > 1) {
                          update(item._id, item.qty - 1);
                        } else {
                          remove(item._id);
                        }
                      }}
                      style={{ width: 40, height: 40, background: '#F7F6F2', border: 'none', fontSize: 18, cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >-</button>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1a1a1a', borderLeft: '1px solid #e0ddd6', borderRight: '1px solid #e0ddd6', lineHeight: '40px' }}>{item.qty}</span>
                    <button
                      onClick={() => {
                        if (item.qty < item.countInStock) {
                          update(item._id, item.qty + 1);
                        }
                      }}
                      disabled={item.qty >= item.countInStock}
                      style={{ width: 40, height: 40, background: '#F7F6F2', border: 'none', fontSize: 18, cursor: item.qty >= item.countInStock ? 'not-allowed' : 'pointer', color: item.qty >= item.countInStock ? '#ccc' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >+</button>
                  </div>

                  
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </p>
                    <button onClick={() => remove(item._id)}
                      style={{ fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#aaa', textDecoration: 'none', padding: '8px 0' }}>
                ← Continue Shopping
              </Link>
            </div>

            
            <div style={{ ...s.card, padding: 28, position: 'sticky', top: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {[
                  { label: `Items (${totalItems})`, value: `Rs. ${itemsPrice.toLocaleString()}` },
                  { label: 'Shipping', value: shippingPrice === 0 ? 'Free' : `Rs. ${shippingPrice}` },
                  { label: 'Tax (15%)', value: `Rs. ${taxPrice}` },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{r.value}</span>
                  </div>
                ))}

                {shippingPrice > 0 && (
                  <p style={{ fontSize: 11, color: '#1a7a4a', background: '#EDFAF3', padding: '6px 10px', borderRadius: 6 }}>
                    Add Rs. {(1000 - itemsPrice).toLocaleString()} more for free shipping
                  </p>
                )}

                <div style={{ borderTop: '1px solid #f0ede6', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Playfair Display', serif" }}>
                    Rs. {Number(totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              <button onClick={checkoutHandler}
                style={{ width: '100%', height: 48, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                Proceed to Checkout →
              </button>

              
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                {['🔒 Secure', '🚚 Fast', '🔄 Returns'].map((t) => (
                  <span key={t} style={{ fontSize: 11, color: '#bbb' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage