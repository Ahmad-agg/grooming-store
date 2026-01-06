import { Routes, Route, NavLink } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails.jsx';
import Categories from './pages/Categories'
import About from './pages/About'
import Contact from './pages/Contact'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Dashboard from './pages/seller/Dashboard.jsx'
import Auth from './pages/Auth/Auth'
import Debug from './pages/Debug'
import Logout from './pages/Auth/Logout.jsx'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders.jsx'
import OrderConfirmed from './pages/OrderConfirmed.jsx'
import SearchResults from './pages/SearchResults.jsx';
import NotFound from './pages/NotFound'






export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:idOrSlug" element={<ProductDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="auth" element={<Auth />} />
        <Route path="logout" element={<Logout />} />
        <Route path="debug" element={<Debug />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="orders/:orderId" element={<OrderConfirmed />} />
        <Route path="seller" element={<Dashboard />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}