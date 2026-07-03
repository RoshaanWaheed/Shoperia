import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  return (
    <footer style={{ background: '#0f0f0f', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>

      
      <div style={{ borderBottom: '1px solid #1f1f1f', background: '#141414' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 32px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
         
        </div>
      </div>

      
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 40 }}>

          
          <div>
            <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: '#fff', textDecoration: 'none', display: 'block', marginBottom: 12, letterSpacing: '-0.3px' }}>
              SHOPERIA
            </Link>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: '#6b7280', marginBottom: 18 }}>
              Your premier fashion marketplace for trendy clothing, premium apparel, and lifestyle accessories.
            </p>
            <div style={{ fontSize: 12, color: '#4b5563', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span>📍 Islamabad</span>
              <a href="mailto:support@shoperia.com" style={{ color: '#4b5563', textDecoration: 'none' }}>✉️ support@shoperia.com</a>
              <a href="https://wa.me/923115629464" style={{ color: '#4b5563', textDecoration: 'none' }}>📱 +92 311 5629464</a>
            </div>
          </div>

          
          <div>
            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #1f1f1f' }}>
              Shop
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: "Men's Collection", kw: 'men' },
                { label: "Women's Fashion",  kw: 'women' },
                { label: 'Kids Clothing',    kw: 'kids' },
                { label: '🔥 Sale',          kw: 'sale' },
                { label: '✨ New Arrivals',  kw: 'new' },
              ].map(({ label, kw }) => (
                <li key={kw}>
                  <button onClick={() => navigate(`/category?keyword=${kw}`)}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: '#9ca3af', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'left' }}
                    onMouseEnter={e => e.target.style.color = '#C4783A'}
                    onMouseLeave={e => e.target.style.color = '#9ca3af'}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        

          
          <div>
            <h4 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #1f1f1f' }}>
              Account
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(userInfo ? [
                { label: 'My Profile',  to: '/profile' },
                { label: 'My Orders',   to: '/orders' },
                { label: 'My Cart',     to: '/cart' },
              ] : [
                { label: 'Sign In',     to: '/login' },
                { label: 'Register',    to: '/register' },
                { label: 'My Cart',     to: '/cart' },
              ]).map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = '#9ca3af'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '16px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>© {currentYear} SHOPERIA Marketplace. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
            
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;