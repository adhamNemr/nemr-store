"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2 className="display-4 fw-bold">YOUR BAG IS EMPTY</h2>
        <p className="text-muted mb-4">You need items in your bag to checkout.</p>
        <Link href="/shop" className="btn btn-dark px-5 py-3 rounded-0">CONTINUE SHOPPING</Link>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2 className="fw-bold">PLEASE SIGN IN</h2>
        <p className="text-muted mb-4">You must be logged in to complete your order.</p>
        <Link href="/login" className="btn btn-dark px-5 py-3 rounded-0">SIGN IN TO CHECKOUT</Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', 
        { items: orderItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        clearCart();
        router.push(`/orders/success?orderId=${response.data.orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row g-5">
        {/* Left: Shipping Info */}
        <div className="col-lg-7">
          <h2 className="fw-bold mb-4 letter-spacing-1">SHIPPING INFORMATION</h2>
          <form onSubmit={handlePlaceOrder}>
            <div className="row g-3">
              <div className="col-sm-6">
                <input
                  type="text"
                  name="firstName"
                  className="form-control rounded-0 py-3"
                  placeholder="First Name"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-sm-6">
                <input
                  type="text"
                  name="lastName"
                  className="form-control rounded-0 py-3"
                  placeholder="Last Name"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  name="address"
                  className="form-control rounded-0 py-3"
                  placeholder="Street Address"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12">
                <input
                  type="text"
                  name="city"
                  className="form-control rounded-0 py-3"
                  placeholder="City / Province"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12">
                <input
                  type="tel"
                  name="phone"
                  className="form-control rounded-0 py-3"
                  placeholder="Phone Number"
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-5">
              <h2 className="fw-bold mb-4 letter-spacing-1">PAYMENT</h2>
              <div className="p-3 border rounded-0 bg-light d-flex align-items-center justify-content-between">
                <span>Cash on Delivery</span>
                <i className="bi bi-check-circle-fill text-dark"></i>
              </div>
              <small className="text-muted d-block mt-2">Currently, we only support Cash on Delivery.</small>
            </div>

            {error && <div className="alert alert-danger mt-4 rounded-0">{error}</div>}

            <button
              type="submit"
              className="btn btn-dark w-100 py-4 mt-5 fw-bold letter-spacing-2"
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : `PLACE ORDER • ${cartTotal} EGP`}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="col-lg-5">
          <div className="p-4 border rounded-0 sticky-top" style={{ top: '120px' }}>
            <h4 className="fw-bold mb-4">ORDER SUMMARY</h4>
            <div className="checkout-items max-vh-50 overflow-auto">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                  <div className="flex-shrink-0" style={{ width: '80px', height: '100px', backgroundColor: '#f5f5f5' }}>
                    <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">{item.name}</h6>
                    <p className="small text-muted mb-1">Size: {item.size} • Qty: {item.quantity}</p>
                    <p className="small fw-bold">{item.price} EGP</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{cartTotal} EGP</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>TOTAL</span>
                <span>{cartTotal} EGP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
