import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Marketplace from './pages/marketplace/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import Checkout from './pages/checkout/Checkout';
import OrderConfirmation from './pages/checkout/OrderConfirmation';
import MyOrders from './pages/orders/MyOrders';
import Dashboard from './pages/vendor/Dashboard';
import AddProduct from './pages/vendor/AddProduct';
import MyProducts from './pages/vendor/MyProducts';
import EditProduct from './pages/vendor/EditProduct';
import VendorOrders from './pages/vendor/VendorOrders';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminVendors from './pages/admin/AdminVendors';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'Inter' },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer */}
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><MyOrders /></ProtectedRoute>
          } />
          <Route path="/orders/:id/confirmation" element={
            <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
          } />

          {/* Vendor */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['VENDOR']}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/vendor/products" element={
            <ProtectedRoute roles={['VENDOR']}><MyProducts /></ProtectedRoute>
          } />
          <Route path="/vendor/products/add" element={
            <ProtectedRoute roles={['VENDOR']}><AddProduct /></ProtectedRoute>
          } />
          <Route path="/vendor/products/edit/:id" element={
            <ProtectedRoute roles={['VENDOR']}><EditProduct /></ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute roles={['VENDOR']}><VendorOrders /></ProtectedRoute>
          } />

          {/* Admin — nested layout */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);