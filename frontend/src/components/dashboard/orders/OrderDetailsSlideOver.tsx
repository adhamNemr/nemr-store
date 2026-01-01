"use client";

import React from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface OrderDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdateStatus?: (newStatus: string) => void;
}

export default function OrderDetailsSlideOver({ isOpen, onClose, order, onUpdateStatus }: OrderDetailsSlideOverProps) {
  useScrollLock(isOpen);
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Reset confirmation state when modal closes or order changes
  React.useEffect(() => {
    setIsConfirming(false);
  }, [isOpen, order?.id]);

  if (!isOpen || !order) return null;

// ... (render content remains same until Footer) ...


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-soft-warning text-warning border-warning';
      case 'processing': return 'bg-soft-info text-info border-info';
      case 'shipped': return 'bg-soft-primary text-primary border-primary';
      case 'delivered': return 'bg-soft-primary text-primary border-primary';
      case 'completed': return 'bg-soft-success text-success border-success';
      case 'cancelled': return 'bg-soft-danger text-danger border-danger';
      default: return 'bg-soft-secondary text-secondary border-secondary';
    }
  };

  return (
    <>
      <div className="nemr-blur-overlay" onClick={onClose} />
      <div className="nemr-details-panel">
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
          <div>
            <div className={`badge ${getStatusColor(order.status)} border px-3 py-1 rounded-pill mb-2 text-uppercase`} style={{ fontSize: '10px', letterSpacing: '1px' }}>
              {order.status || 'Pending'}
            </div>
            <h4 className="fw-black mb-0" style={{ letterSpacing: '-1px' }}>ORDER #{order.id}</h4>
            <p className="text-muted extra-small mb-0 fw-bold text-uppercase">{new Date(order.createdAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button className="btn-nemr-action" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
          {/* Status Timeline / Progress (Simple Visual) */}
          <div className="mb-4">
             <div className="d-flex justify-content-between text-center position-relative">
                <div className="position-absolute top-50 start-0 w-100 bg-light" style={{ height: '2px', zIndex: 0 }}></div>
                {['pending', 'processing', 'shipped', 'delivered', 'completed'].map((s, i) => {
                  const statusList = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
                  const currentIdx = statusList.indexOf(order.status || 'pending');
                  const stepIdx = statusList.indexOf(s);
                  const isCancelled = order.status === 'cancelled';
                  const isCompleted = !isCancelled && stepIdx <= currentIdx;
                  
                  return (
                    <div key={s} className="position-relative z-1 bg-white px-1">
                      <div 
                         className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${isCompleted ? 'bg-dark text-white' : 'bg-light text-muted border'} ${isCancelled ? 'opacity-50' : ''}`}
                        style={{ width: 24, height: 24, fontSize: '10px' }}
                      >
                        {isCompleted ? <i className="bi bi-check"></i> : i + 1}
                      </div>
                      <div className={`extra-small fw-bold text-uppercase ${isCompleted ? 'text-dark' : 'text-muted'} ${isCancelled ? 'text-decoration-line-through' : ''}`} style={{ fontSize: '9px' }}>{s}</div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Customer Card */}
          <div className="mb-4">
            <h6 className="text-uppercase extra-small fw-black text-muted mb-3 letter-spacing-2">Customer Details</h6>
            <div className="bg-white p-3 rounded-4 border shadow-sm d-flex align-items-center gap-3">
              <div className="bg-soft-dark rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                {(order.User?.username?.[0] || order.customer?.[0] || 'G').toUpperCase()}
              </div>
              <div className="overflow-hidden flex-grow-1">
                <div className="fw-bold text-dark text-truncate">{order.User?.username || order.customer || 'Guest Customer'}</div>
                <div className="text-muted extra-small text-truncate"><i className="bi bi-envelope-fill me-1"></i>{order.User?.email || 'N/A'}</div>
                {order.phone && (
                  <div className="text-primary extra-small fw-bold mt-1">
                    <i className="bi bi-telephone-fill me-1"></i>{order.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-4">
            <h6 className="text-uppercase extra-small fw-black text-muted mb-3 letter-spacing-2">
              Order Items ({ (order.items?.length || order.OrderItems?.length || 0) })
            </h6>
            <div className="d-grid gap-2">
              {(order.items || order.OrderItems || []).map((item: any, idx: number) => {
                const product = item.Product || item;
                const name = item.productName || product.name || 'Unknown Product';
                const price = item.price || product.price || 0;
                
                return (
                  <div key={idx} className="d-flex align-items-center gap-3 p-2 border-bottom border-light">
                    <div className="bg-light rounded-3 overflow-hidden border flex-shrink-0" style={{ width: 56, height: 56 }}>
                      {product.image ? (
                        <img src={product.image} alt="" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted"><i className="bi bi-box"></i></div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small mb-1">{name}</div>
                      <div className="text-muted extra-small">
                        {item.quantity} x {price.toLocaleString()} EGP
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-dark small">{(item.quantity * price).toLocaleString()} EGP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics & Payment Grid */}
          <div className="row g-3">
             <div className="col-12">
               <div className="p-3 bg-soft-light rounded-3 border border-dashed">
                 <h6 className="text-uppercase extra-small fw-bold text-muted mb-2">Shipping Information</h6>
                 <div className="d-flex align-items-start gap-2">
                   <i className="bi bi-geo-alt-fill text-danger mt-1"></i>
                   <p className="small text-dark mb-0 lh-sm">
                     <strong>City: {order.city || 'Standard Delivery'}</strong><br/>
                     {order.shippingAddress || 'No address provided'}<br/>
                     <span className="text-muted extra-small">Phone: {order.phone || 'N/A'}</span>
                   </p>
                 </div>
               </div>
             </div>
             <div className="col-12">
               <div className="p-3 bg-soft-light rounded-3 border border-dashed">
                 <h6 className="text-uppercase extra-small fw-bold text-muted mb-2">Payment Info</h6>
                 <div className="d-flex align-items-center gap-2">
                   <i className="bi bi-cash-stack text-success"></i>
                   <span className="small fw-bold text-dark">
                     {order.paymentMethod === 'Card' ? 'Paid via Credit Card' : 'Cash on Delivery (COD)'}
                   </span>
                   <span className={`badge ${order.paymentMethod === 'Card' ? 'bg-success' : 'bg-white border text-dark'} ms-auto`}>
                     {order.paymentMethod === 'Card' ? 'PAID' : 'UNPAID'}
                   </span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Footer / Actions - Seller Guidelines Mode */}
        <div className="p-4 border-top bg-white">
          {/* Seller Instruction Box */}
          {order.status === 'processing' && (
            <div className="bg-soft-warning p-3 rounded-3 mb-3 border border-warning dashed small">
              <div className="d-flex gap-2">
                <i className="bi bi-info-circle-fill text-warning flex-shrink-0 mt-1"></i>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Order Ready?</h6>
                  <ol className="mb-0 ps-3 text-muted extra-small">
                    <li>Pack the item securely.</li>
                    <li>Attach the invoice.</li>
                    <li>Click <strong>"Ready for Pickup"</strong> to notify courier.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

           {/* Accept Order Hint */}
           {order.status === 'pending' && (
            <div className="bg-soft-primary p-3 rounded-3 mb-3 border border-primary dashed small">
               <div className="d-flex gap-2">
                <i className="bi bi-exclamation-circle-fill text-primary flex-shrink-0 mt-1"></i>
                <div>
                  <h6 className="fw-bold text-dark mb-1">New Order Received</h6>
                  <p className="mb-0 text-muted extra-small">Review items and stock. Click <strong>"Accept Order"</strong> to start processing.</p>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="text-muted small fw-bold text-uppercase letter-spacing-1">Total Amount</div>
            <div className="text-end">
              <span className="h3 fw-black mb-0 text-dark" style={{ letterSpacing: '-1px' }}>
                {(order.totalPrice || order.total || 0).toLocaleString()}
              </span>
              <span className="ms-1 fw-bold text-muted small">EGP</span>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            {!isConfirming ? (
              <>
                <button className="btn btn-white border flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small shadow-sm" onClick={onClose}>
                  Close
                </button>
                {order.status === 'pending' && (
                  <button 
                    className="btn btn-primary flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small shadow-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                        if (onUpdateStatus) onUpdateStatus('processing');
                    }}
                  >
                    <i className="bi bi-check-lg"></i> Accept Order
                  </button>
                )}
                {order.status === 'processing' && (
                  <button 
                    className="btn btn-dark flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small shadow-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setIsConfirming(true)}
                  >
                    <i className="bi bi-box-seam"></i> Ready for Pickup
                  </button>
                )}
                {!['pending', 'processing'].includes(order.status) && (
                    <div className="btn btn-light flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small text-muted disabled">
                      {order.status}
                    </div>
                )}
              </>
            ) : (
              // Confirmation State
              <div className="d-flex gap-2 w-100 animate__animated animate__fadeIn">
                <button 
                  className="btn btn-danger flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small shadow-sm" 
                  onClick={() => setIsConfirming(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success flex-grow-1 py-3 rounded-pill fw-bold text-uppercase extra-small shadow-lg d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    if (onUpdateStatus) {
                      onUpdateStatus('shipped');
                    } else {
                       onClose();
                    }
                  }}
                >
                  <i className="bi bi-check2-circle"></i> Yes, Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
