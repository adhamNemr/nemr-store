"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  Product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  OrderItems: OrderItem[];
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!user) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h2 className="fw-bold">PLEASE SIGN IN</h2>
        <p className="text-muted mb-4">You must be logged in to view your order history.</p>
        <Link href="/login" className="btn btn-dark px-5 py-3 rounded-0">SIGN IN</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <h1 className="display-5 fw-bold mb-5 letter-spacing-1">MY ORDERS</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="btn btn-dark mt-3 px-5 py-3 rounded-0">START SHOPPING</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card mb-5 border rounded-0 overflow-hidden shadow-sm">
              <div className="order-header bg-light p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <p className="small text-muted mb-1 text-uppercase">Order Placed</p>
                  <p className="fw-bold mb-0">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="small text-muted mb-1 text-uppercase">Total Amount</p>
                  <p className="fw-bold mb-0 text-dark">{order.totalPrice} EGP</p>
                </div>
                <div>
                  <p className="small text-muted mb-1 text-uppercase">Order ID</p>
                  <p className="fw-bold mb-0">#{order.id}</p>
                </div>
                <div>
                  <span className={`badge rounded-0 px-3 py-2 text-uppercase ${
                    order.status === 'completed' ? 'bg-success' : 
                    order.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="order-body p-4">
                {order.OrderItems.map((item) => (
                  <div key={item.id} className="order-item d-flex gap-4 mb-4 pb-4 border-bottom last-item-no-border">
                    <div style={{ width: '100px', height: '130px', backgroundColor: '#f0f0f0' }}>
                      <img 
                        src={item.Product.image} 
                        alt={item.Product.name} 
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-2">{item.Product.name}</h5>
                      <p className="text-muted mb-2">Quantity: {item.quantity}</p>
                      <p className="fw-bold">{item.price} EGP</p>
                      <Link href={`/product/${item.id}`} className="btn btn-sm btn-outline-dark rounded-0 mt-2">Buy it again</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
