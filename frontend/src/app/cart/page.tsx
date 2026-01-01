"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';

// --- PERFORMANCE OPTIMIZATION: Memoized Cart Item ---
const CartItemRow = memo(({ item, onUpdate, onRemove }: any) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.id), 400); // Wait for animation
  };

  return (
    <div className={`cart-item-card d-flex gap-4 py-4 border-bottom animate-fade-in ${isRemoving ? 'item-removing' : ''}`}>
      <div style={{ width: '150px', flexShrink: 0, position: 'relative', aspectRatio: '3/4' }}>
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-100 h-100 object-fit-cover shadow-sm border"
          loading="lazy"
        />
      </div>
      
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted small text-uppercase fw-bold letter-spacing-1">NEMR SELECTION</span>
          <button onClick={handleRemove} className="text-muted border-0 bg-transparent hover-dark p-0">
            <i className="bi bi-trash3 fs-5"></i>
          </button>
        </div>
        <h4 className="fw-bold text-uppercase mb-3 h5">{item.name}</h4>
        
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="product-label">Category</div>
            <div className="small fw-bold text-dark text-uppercase">{item.category || 'Essential'}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="product-label">Condition</div>
            <div className="small fw-bold text-dark text-uppercase">{item.condition || 'Mint'}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="product-label">Size</div>
            <div className="small fw-bold text-dark text-uppercase">{item.size || 'Standard'}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="product-label">Unit Price</div>
            <div className="small fw-bold text-dark">{item.price} EGP</div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="quantity-pill">
            <button onClick={() => onUpdate(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><i className="bi bi-dash"></i></button>
            <span>{item.quantity}</span>
            <button onClick={() => onUpdate(item.id, item.quantity + 1)}><i className="bi bi-plus"></i></button>
          </div>
          <div className="text-end">
            <div className="product-label">Item Total</div>
            <div className="h4 mb-0 fw-bold">{item.price * item.quantity} EGP</div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItemRow.displayName = 'CartItemRow';

// --- MAIN PAGE ---
export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  
  // UX: Shipping Logic (Example: Free shipping at 5000 EGP)
  const shippingThreshold = 5000;
  const progress = Math.min((cartTotal / shippingThreshold) * 100, 100);
  const remaining = shippingThreshold - cartTotal;

  return (
    <div className="container cart-page-content" style={{ minHeight: '100vh', paddingBottom: '100px', paddingTop: '180px' }}>
      <header className="mb-5 border-bottom pb-4">
        <h1 className="display-4 fw-bold letter-spacing-1">SHOPPING BAG</h1>
        <p className="text-muted text-uppercase small letter-spacing-2">{cartCount} Products Selected</p>
      </header>
      
      {cart.length === 0 ? (
        <div className="text-center py-5 bg-light border animate-fade-in shadow-sm">
          <i className="bi bi-bag-x display-1 text-muted mb-4 d-block"></i>
          <h2 className="fw-bold mb-3">YOUR BAG IS CURRENTLY EMPTY</h2>
          <p className="text-muted mb-5">Start curating your personal collection today.</p>
          <Link href="/shop" className="btn btn-dark px-5 py-3 rounded-0 fw-bold letter-spacing-1">EXPLORE NEW ARRIVALS</Link>
        </div>
      ) : (
        <div className="row g-5">
          {/* Products Column */}
          <div className="col-lg-8">
            {/* UX: Motivation Bar */}
            <div className="shipping-motivation p-4 bg-light shadow-sm mb-5 border">
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-uppercase letter-spacing-1">
                    {progress >= 100 ? '✨ You unlocked FREE PREMIUM SHIPPING!' : `Buy ${remaining} EGP more for FREE SHIPPING`}
                  </span>
                  <i className="bi bi-truck fs-4"></i>
               </div>
               <div className="shipping-progress-container">
                  <div className="shipping-progress-bar" style={{ width: `${progress}%` }}></div>
               </div>
            </div>

            <div className="cart-items-wrapper">
              {cart.map((item) => (
                <CartItemRow 
                  key={`${item.id}-${item.size}`} 
                  item={item} 
                  onUpdate={updateQuantity} 
                  onRemove={removeFromCart} 
                />
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="col-lg-4">
            <div style={{ position: 'sticky', top: '140px', zIndex: 900 }}>
              <div className="checkout-summary-box p-4 bg-white shadow-sm border">
                <h4 className="fw-bold mb-4 letter-spacing-1 text-uppercase border-bottom pb-3">Bag Summary</h4>
                
                <div className="d-flex justify-content-between mb-3 small">
                  <span className="text-muted text-uppercase">Subtotal</span>
                  <span className="fw-bold text-dark">{cartTotal} EGP</span>
                </div>
                
                <div className="d-flex justify-content-between mb-3 small">
                  <span className="text-muted text-uppercase">Standard Shipping</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>
                
                <div className="d-flex justify-content-between mb-4 pt-4 border-top">
                  <span className="fw-bold text-dark">TOTAL DUE</span>
                  <span className="h3 mb-0 fw-bold text-dark">{cartTotal} EGP</span>
                </div>
                
                <Link href="/checkout" className="btn btn-dark w-100 rounded-0 py-3 fw-bold letter-spacing-2">
                  SECURE CHECKOUT
                </Link>
                
                <div className="mt-4 pt-4 border-top">
                    <div className="d-flex align-items-center gap-3 mb-2 opacity-75">
                        <i className="bi bi-shield-check-fill text-dark"></i>
                        <span className="small">PCI-DSS Compliant Payments</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 opacity-75">
                        <i className="bi bi-arrow-repeat text-dark"></i>
                        <span className="small">14 Days Easy Returns</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-5">
          <Link href="/shop" className="btn border-dark rounded-0 px-4 py-2 small fw-bold text-dark text-decoration-none hover-dark-btn transition-all">
            <i className="bi bi-arrow-left me-2"></i> RETURN TO SHOP
          </Link>
        </div>
      )}
    </div>
  );
}
