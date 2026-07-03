import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store/index.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import PageTransition from './components/PageTransition.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx';
import ShippingPage from './pages/ShippingPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PlaceOrderPage from './pages/PlaceOrderPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProductList from './pages/admin/ProductList.jsx';
import ProductEdit from './pages/admin/ProductEdit.jsx';
import OrderList from './pages/admin/OrderList.jsx';
import UserList from './pages/admin/UserList.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import AdminRoute from './AdminRoute.jsx';
import SearchPage from './pages/SearchPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ReviewPopup from './components/ReviewPopup.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import './App.css';


const CustomerRoute = ({ children }) => {
  const { userInfo } = useSelector(state => state.auth);
  return userInfo?.isAdmin ? <Navigate to="/admin" replace /> : <Outlet />;
};



const P = (Component) => (
  <PageTransition>
    <Component />
  </PageTransition>
)

function AnimatedRoutes() {
  const location = useLocation();

  
  
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  
  
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={P(Dashboard)} />
          <Route path="/admin/products" element={P(ProductList)} />
          <Route path="/admin/product/:id/edit" element={P(ProductEdit)} />
          <Route path="/admin/orders" element={P(OrderList)} />
           <Route path="/admin/reviews" element={P(AdminReviewsPage)} />
          <Route path="/admin/users" element={P(UserList)} />
          <Route path="/admin/profile" element={P(ProfilePage)} />
        </Route>

        
        <Route element={<CustomerRoute />}>
          <Route element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-0">
                <Outlet />
              </main>
              <Footer />
              <BackToTop />
              <ReviewPopup />
            </div>
          }>
            <Route path="/" element={P(HomePage)} />
            <Route path="/product/:id" element={P(ProductPage)} />
            <Route path="/cart" element={P(CartPage)} />
            <Route path="/login" element={P(LoginPage)} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={P(RegisterPage)} />
            <Route path="/search" element={P(SearchPage)} />
            <Route path="/category" element={P(CategoryPage)} />
            <Route path="/category/:keyword" element={P(CategoryPage)} />

            <Route element={<PrivateRoute />}>
              <Route path="/shipping" element={P(ShippingPage)} />
              <Route path="/payment" element={P(PaymentPage)} />
              <Route path="/placeorder" element={P(PlaceOrderPage)} />
              <Route path="/order/:id" element={P(OrderPage)} />
              <Route path="/profile" element={P(ProfilePage)} />
            </Route>
          </Route>
        </Route>

        
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AnimatedRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </Provider>
  );
}

export default App;