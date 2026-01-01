"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Close drawer on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setIsCartOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="drawer-header d-flex justify-content-between align-items-center p-4 border-bottom">
          <h4 className="mb-0 fw-bold letter-spacing-1">SHOPPING BAG</h4>
          <button 
            className="btn-close-drawer bg-transparent border-0" 
            onClick={() => setIsCartOpen(false)}
          >
            <i className="bi bi-x-lg fs-4"></i>
          </button>
        </div>

        <div className="drawer-content p-4">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted mb-4">Your bag is currently empty.</p>
              <button 
                className="btn btn-dark rounded-0 px-4 py-2 text-uppercase small fw-bold"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.cartItemId || `${item.id}-${item.size}`} className="cart-item-row d-flex gap-3 mb-4">
                  <div className="item-image" style={{ width: '80px', height: '100px', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} className="w-100 h-100 object-fit-cover rounded-1" />
                  </div>
                  <div className="item-details flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="mb-0 text-uppercase small fw-bold lh-base">{item.name}</h6>
                      <button 
                        className="bg-transparent border-0 p-0 text-muted"
                        onClick={() => removeFromCart(item.cartItemId || item.id)}
                      >
                        <i className="bi bi-trash small"></i>
                      </button>
                    </div>
                    <div className="text-muted small mb-3">
                        {item.size && <span className="d-block">Size: {item.size}</span>}
                        {item.color && (
                            <span className="d-flex align-items-center gap-1 mt-1">
                                Color: 
                                <span className="d-inline-block rounded-circle border" style={{width:10, height:10, background: item.color.toLowerCase()}}></span> 
                                {item.color}
                            </span>
                        )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="quantity-controls d-flex align-items-center border">
                        <button 
                          className="bg-transparent border-0 px-2 py-1"
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="px-2 small">{item.quantity}</span>
                        <button 
                          className="bg-transparent border-0 px-2 py-1"
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="fw-bold small">{item.price * item.quantity} EGP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer p-4 border-top">
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted text-uppercase small letter-spacing-1">Subtotal</span>
              <span className="fw-bold">{cartTotal} EGP</span>
            </div>
            <p className="text-muted small mb-4">Shipping and taxes calculated at checkout.</p>
            <Link 
              href="/checkout" 
              className="btn btn-dark w-100 rounded-0 py-3 fw-bold letter-spacing-1 mb-2"
              onClick={() => setIsCartOpen(false)}
            >
              PROCEED TO CHECKOUT
            </Link>
            <Link 
              href="/cart" 
              className="btn btn-outline-dark w-100 rounded-0 py-3 fw-bold letter-spacing-1"
              onClick={() => setIsCartOpen(false)}
            >
              VIEW FULL CART
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
