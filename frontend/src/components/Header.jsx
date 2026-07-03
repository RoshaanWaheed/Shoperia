import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { logout } from '../store/authSlice'

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { cartItems } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdown, setDropdown] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const [activeAccordion, setActiveAccordion] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const logoutHandler = () => {
    dispatch(logout())
    setDropdown(false)
    setMobileOpen(false)
    navigate('/')
  }

  const searchHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) navigate(`/category/${keyword}`)
    else navigate('/')
    setMobileOpen(false)
  }

  const handleNav = (kw) => {
    navigate(`/category/${kw}`)
    setMobileOpen(false)
  }

  const toggleAccordion = (name) => setActiveAccordion(prev => prev === name ? null : name)
  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0)

  const navigationMenu = [
    {
      name: 'Men',
      subcategories: [
        { label: 'All Men',        keyword: 'men' },
        { label: 'T-Shirts',       keyword: 'men-tshirts' },
        { label: 'Shirts',         keyword: 'men-shirts' },
        { label: 'Pants / Jeans',  keyword: 'men-pants' },
        { label: 'Jackets',        keyword: 'men-jackets' },
        { label: 'Suits',          keyword: 'men-suits' },
        { label: 'Footwear',    keyword: 'men-footwear',    divider: true },
        { label: 'Sneakers',       keyword: 'men-sneakers' },
        { label: 'Formal Shoes',   keyword: 'men-formal' },
        { label: 'Boots',          keyword: 'men-boots' },
        { label: 'Accessories', keyword: 'men-accessories', divider: true },
        { label: 'Bags & Belts',   keyword: 'men-bags' },
        { label: 'Watches',        keyword: 'men-watches' },
        { label: 'Sunglasses',     keyword: 'men-sunglasses' },
      ],
    },
    {
      name: 'Women',
      subcategories: [
        { label: 'All Women',      keyword: 'women' },
        { label: 'Dresses',        keyword: 'women-dresses' },
        { label: 'Tops',           keyword: 'women-tops' },
        { label: 'Jeans / Pants',  keyword: 'women-jeans' },
        { label: 'Jackets',        keyword: 'women-jackets' },
        { label: 'Skirts',         keyword: 'women-skirts' },
        { label: 'Footwear',    keyword: 'women-footwear',    divider: true },
        { label: 'Heels',          keyword: 'women-heels' },
        { label: 'Sneakers',       keyword: 'women-sneakers' },
        { label: 'Boots',          keyword: 'women-boots' },
        { label: 'Accessories', keyword: 'women-accessories', divider: true },
        { label: 'Bags & Purses',  keyword: 'women-bags' },
        { label: 'Jewelry',        keyword: 'women-jewelry' },
        { label: 'Sunglasses',     keyword: 'women-sunglasses' },
      ],
    },
    {
      name: 'Kids',
      subcategories: [
        { label: 'All Kids',    keyword: 'kids' },
        { label: 'Boys',        keyword: 'boys' },
        { label: 'Girls',       keyword: 'girls' },
      ],
    },
    { name: 'Sale',         isHot: true, keyword: 'sale' },
    { name: 'New Arrivals', isNew: true, keyword: 'new'  },
  ]

  return (
    <>
      <header className="w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full bg-white border-b" style={{ borderColor: '#e8e5de' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-4 h-16">

            
            <button onClick={() => setMobileOpen(true)}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-lg flex-shrink-0"
              style={{ border: '1px solid #e0ddd6', background: '#fff', gap: 5, cursor: 'pointer' }}
              aria-label="Open menu">
              <span style={{ display: 'block', width: 18, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 18, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 12, height: 1.5, background: '#1a1a1a', borderRadius: 2 }} />
            </button>

            
            <Link to="/" className="text-xl font-bold tracking-tight flex-shrink-0"
              style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', textDecoration: 'none' }}>
              SHOP<span style={{ color: '#C4783A' }}>ERIA</span>

            </Link>

            
            <form onSubmit={searchHandler} className="hidden sm:flex flex-1 max-w-xl mx-auto" style={{ position: 'relative' }}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search for clothing, brands, styles…"
                className="w-full h-10 pl-9 pr-4 text-sm rounded-l-lg border-y border-l focus:outline-none"
                style={{ borderColor: '#e0ddd6', background: '#F7F6F2', color: '#1a1a1a', fontFamily: "'DM Sans', sans-serif" }}
                onFocus={(e) => { e.target.style.borderColor = '#C4783A'; e.target.style.background = '#fff' }}
                onBlur={(e)  => { e.target.style.borderColor = '#e0ddd6'; e.target.style.background = '#F7F6F2' }}
              />
              <button type="submit" className="h-10 px-5 text-sm font-semibold rounded-r-lg flex-shrink-0"
                style={{ background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
                Search
              </button>
            </form>

            
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {userInfo ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdown(!dropdown)}
                    className="flex items-center gap-2 h-9 px-3.5 rounded-lg border text-sm font-medium"
                    style={{ border: '1px solid #e0ddd6', background: dropdown ? '#F0EDE5' : '#fff', color: '#1a1a1a', cursor: 'pointer' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#C4783A', color: '#fff' }}>
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:block max-w-[90px] truncate">{userInfo.name}</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
                      <path d="M1 1l4 4 4-4" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {dropdown && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl overflow-hidden z-50"
                      style={{ background: '#fff', border: '1px solid #ebe8e0', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
                      <div className="px-4 py-3.5" style={{ background: '#1a1a1a' }}>
                        <p className="font-semibold text-white text-sm">{userInfo.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{userInfo.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
                          style={{ color: '#333', textDecoration: 'none' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F7F6F2'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          My Profile
                        </Link>
                        {userInfo.isAdmin && (
                          <>
                            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                              style={{ color: '#bbb', borderTop: '1px solid #f0ede6', marginTop: 4, paddingTop: 10 }}>
                              Admin Panel
                            </div>
                            {[
                              { to: '/admin',          icon: '📊', label: 'Dashboard' },
                              { to: '/admin/products', icon: '📦', label: 'Products' },
                              { to: '/admin/orders',   icon: '🛍️', label: 'Orders' },
                              { to: '/admin/users',    icon: '👥', label: 'Users' },
                            ].map((item) => (
                              <Link key={item.to} to={item.to} onClick={() => setDropdown(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
                                style={{ color: '#333', textDecoration: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#F7F6F2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <span>{item.icon}</span> {item.label}
                              </Link>
                            ))}
                          </>
                        )}
                        <div style={{ borderTop: '1px solid #f0ede6', marginTop: 4 }} />
                        <button onClick={logoutHandler}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-left"
                          style={{ color: '#c0392b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FFF5F5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="h-9 px-4 flex items-center text-sm font-medium rounded-lg border"
                    style={{ border: '1px solid #e0ddd6', color: '#333', textDecoration: 'none', background: '#fff' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F0EDE5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>Login</Link>
                  <Link to="/register" className="h-9 px-4 flex items-center text-sm font-semibold rounded-lg"
                    style={{ background: '#1a1a1a', color: '#fff', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#C4783A'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>Register</Link>
                </div>
              )}

              
              <Link to="/cart" className="relative flex items-center gap-2 h-9 px-3.5 rounded-lg text-sm font-semibold flex-shrink-0"
                style={{ background: '#1a1a1a', color: '#fff', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                    style={{ background: '#C4783A' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      
      <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.45)', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', transition: 'opacity 0.3s ease' }} />

      
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999, width: 300, background: '#fff', boxShadow: '4px 0 32px rgba(0,0,0,0.15)', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif", overflowY: 'auto' }}>

        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0ede6', flexShrink: 0 }}>
          <Link to="/" onClick={() => setMobileOpen(false)} style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none' }}>
            SHOPERIA
          </Link>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        
        {isMobile && (
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0ede6', flexShrink: 0 }}>
            <form onSubmit={searchHandler} style={{ display: 'flex', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search…"
                style={{ flex: 1, height: 38, paddingLeft: 30, paddingRight: 12, fontSize: 13, borderRadius: '8px 0 0 8px', border: '1px solid #e0ddd6', background: '#F7F6F2', color: '#1a1a1a', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              <button type="submit" style={{ height: 38, padding: '0 14px', fontSize: 13, fontWeight: 600, borderRadius: '0 8px 8px 0', border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>Go</button>
            </form>
          </div>
        )}

        
        <div style={{ padding: '10px 12px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#bbb', textTransform: 'uppercase', padding: '4px 4px 8px', margin: 0 }}>Categories</p>

          {navigationMenu.map((item) => {
            const hasSubs = item.subcategories?.length > 0
            const isOpen  = activeAccordion === item.name

            return (
              <div key={item.name} style={{ marginBottom: 2 }}>
                {hasSubs ? (
                  <button onClick={() => toggleAccordion(item.name)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 12px', borderRadius: 8, border: 'none', background: isOpen ? '#F7F6F2' : 'transparent', color: '#1a1a1a', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                    <span>{item.name}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.22s ease', flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ) : (
                  <button onClick={() => handleNav(item.keyword)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#1a1a1a', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F7F6F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span>
                      {item.name}
                      {item.isHot && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#C4783A', color: '#fff' }}>HOT</span>}
                      {item.isNew && <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#1a1a1a', color: '#fff' }}>NEW</span>}
                    </span>
                  </button>
                )}

                
                {hasSubs && (
                  <div style={{ maxHeight: isOpen ? `${item.subcategories.length * 42}px` : '0px', overflow: 'hidden', transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
                    {item.subcategories.map((sub, idx) => (
                      <div key={sub.keyword}>
                        {sub.divider && idx !== 0 && (
                          <div style={{ borderTop: '1px solid #f0ede6', margin: '4px 12px' }} />
                        )}
                        {sub.divider ? (
                          <button onClick={() => handleNav(sub.keyword)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px 4px 20px', border: 'none', background: 'transparent', color: '#1a1a1a', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
                            {sub.label}
                          </button>
                        ) : (
                          <button onClick={() => handleNav(sub.keyword)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px 8px 28px', border: 'none', background: 'transparent', color: '#666', fontSize: 13, fontWeight: 400, cursor: 'pointer', textAlign: 'left', borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#C4783A'; e.currentTarget.style.background = '#FDF6EF' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'transparent' }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4783A', flexShrink: 0 }} />
                            {sub.label}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ borderTop: '1px solid #f0ede6' }} />

        
        {isMobile && (
          <div style={{ padding: '12px' }}>
            {userInfo ? (
              <>
                <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 16px', margin: '4px 0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#C4783A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {userInfo.name?.charAt(0).toUpperCase()}
                    </span>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.email}</p>
                    </div>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#333', fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F6F2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> My Profile
                </Link>
                {userInfo.isAdmin && (
                  <>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#bbb', textTransform: 'uppercase', padding: '10px 12px 6px', margin: 0 }}>Admin Panel</p>
                    {[
                      { to: '/admin', icon: '📊', label: 'Dashboard' },
                      { to: '/admin/products', icon: '📦', label: 'Products' },
                      { to: '/admin/orders', icon: '🛍️', label: 'Orders' },
                      { to: '/admin/users', icon: '👥', label: 'Users' },
                    ].map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#333', fontSize: 14, fontWeight: 500 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F7F6F2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                  </>
                )}
                <div style={{ borderTop: '1px solid #f0ede6', margin: '8px 0' }} />
                <button onClick={logoutHandler} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#c0392b', fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.background = '#FFF5F5'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 10, border: '1px solid #e0ddd6', textDecoration: 'none', color: '#333', fontSize: 14, fontWeight: 600, background: '#fff' }}>Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 10, textDecoration: 'none', color: '#fff', fontSize: 14, fontWeight: 600, background: '#1a1a1a' }}>Create Account</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Header