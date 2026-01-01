"use client";

import React from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  createdAt: string;
  userId?: number;
  total: number;
  status: string;
  customer?: string;
  User?: { username: string };
}

interface OrdersTableProps {
  orders: Order[];
  isAdmin: boolean;
  onStatusUpdate: (id: number, status: string) => void;
  onViewDetails: (order: Order) => void;
  updatingId: number | null;
}

export default function OrdersTable({ orders, isAdmin, onStatusUpdate, onViewDetails, updatingId }: OrdersTableProps) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead className="text-muted small text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          <tr>
            <th className="fw-bold text-center">ID</th>
            <th className="fw-bold text-center">Date</th>
            <th className="fw-bold text-center">Entities</th>
            <th className="fw-bold text-center">Value</th>
            <th className="fw-bold text-center">Status</th>
            <th className="fw-bold text-center">Payment</th>
            <th className="fw-bold text-center">Details</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '13px' }}>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-bottom-light align-middle" style={{ height: '60px' }}>
              <td className="text-center">
                <span className="font-monospace fw-bold text-dark bg-light px-2 py-1 rounded small">#{order.id}</span>
              </td>
              <td className="text-center">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-calendar3 text-muted" style={{ fontSize: '12px' }}></i>
                  <div className="d-flex flex-column text-start" style={{ lineHeight: '1.2' }}>
                    <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>
                      {new Date(order.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </td>
              <td className="text-center">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <div className="bg-white border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {order.customer ? order.customer.charAt(0).toUpperCase() : <i className="bi bi-person text-secondary"></i>}
                  </div>
                  <div className="d-flex flex-column text-start" style={{ lineHeight: '1.2' }}>
                    <span className="fw-bold text-dark small">{order.customer || order.User?.username || 'Guest'}</span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>Customer</span>
                  </div>
                </div>
              </td>
              <td className="text-center">
                <span className="fw-bold text-dark">{order.total.toLocaleString()}</span>
              </td>
              <td className="text-center">
                {isAdmin ? (
                  <select 
                    className={`form-select form-select-sm border-0 fw-bold text-uppercase mx-auto ${
                      order.status === 'completed' ? 'text-success bg-soft-success' : 
                      order.status === 'cancelled' ? 'text-danger bg-soft-danger' : 
                      'text-warning bg-soft-warning'
                    }`}
                    style={{ width: '110px', fontSize: '11px', cursor: 'pointer' }}
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  >
                    <option value="pending">PENDING</option>
                    <option value="processing">PROCESSING</option>
                    <option value="shipped">SHIPPED</option>
                    <option value="delivered">DELIVERED</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                ) : (
                  <div 
                    className={`badge rounded-pill fw-bold text-uppercase d-inline-flex align-items-center justify-content-center ${
                      order.status === 'completed' ? 'bg-soft-success text-success' : 
                      order.status === 'cancelled' ? 'bg-soft-danger text-danger' : 
                      'bg-soft-warning text-warning'
                    }`}
                    style={{ width: '110px', height: '28px', fontSize: '10px', letterSpacing: '0.5px' }}
                  >
                    {order.status}
                  </div>
                )}
              </td>
              <td className="text-center">
                <div className="d-flex flex-column align-items-center">
                    <div className="d-flex align-items-center gap-1">
                        <i className={`bi ${order.paymentMethod === 'Card' ? 'bi-credit-card text-primary' : 'bi-cash text-success'}`} style={{ fontSize: '14px' }}></i>
                        <span className="fw-bold" style={{ fontSize: '11px' }}>{order.paymentMethod || 'COD'}</span>
                    </div>
                    <span className="extra-small text-muted" style={{ fontSize: '9px' }}>
                        {order.paymentMethod === 'Card' ? 'Digital' : 'On Delivery'}
                    </span>
                </div>
              </td>
              <td className="text-center">
                <button 
                  className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold small" 
                  style={{ fontSize: '11px' }}
                  onClick={() => onViewDetails(order)}
                >
                  View Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
