"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, toggleCart } = useCart();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger animation when cartCount changes
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Don't show store navbar in dashboard (check AFTER all hooks)
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <header className={`nemr-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Left: Navigation */}
        <nav className="nav-left">
          <Link href="/shop?cat=men" className="nav-link">Men</Link>
          <Link href="/shop?cat=women" className="nav-link">Women</Link>
          <Link href="/shop?cat=kids" className="nav-link">Kids</Link>
        </nav>

        {/* Center: Logo */}
        <Link href="/" className="brand-logo">
          <h1>NEMR</h1>
        </Link>

        {/* Right: Actions */}
        <div className="nav-right">
          <Link href="/search" className="search-trigger">
            <i className="bi bi-search"></i>
          </Link>
          <div className="user-actions d-flex align-items-center gap-3">
            
            {user ? (
              <div className="position-relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                <button className="nav-icon-link bg-transparent border-0 p-0" style={{ cursor: 'pointer' }}>
                  <i className="bi bi-person-check-fill" style={{ color: '#000' }}></i>
                </button>
                {showDropdown && (
                  <div className="auth-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    padding: '15px',
                    minWidth: '150px',
                    zIndex: 1000,
                    border: '1px solid #eee'
                  }}>
                    <p className="mb-2 fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>Hi, {user.username.split(' ')[0]}</p>
                    <Link href="/profile" className="d-block mb-2 text-dark text-decoration-none small hover-underline" onClick={() => setShowDropdown(false)}>Profile</Link>
                    {(user.role === 'admin' || user.role === 'seller') && (
                      <Link href="/dashboard" className="d-block mb-2 text-primary text-decoration-none small fw-bold hover-underline" onClick={() => setShowDropdown(false)}>Dashboard</Link>
                    )}
                    <Link href="/orders" className="d-block mb-2 text-dark text-decoration-none small hover-underline" onClick={() => setShowDropdown(false)}>My Orders</Link>
                    <hr className="my-2" />
                    <button onClick={() => { logout(); setShowDropdown(false); }} className="d-block w-100 text-start bg-transparent border-0 p-0 text-danger small fw-bold">LOGOUT</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="nav-icon-link">
                 <i className="bi bi-person"></i>
              </Link>
            )}

            <Link href="/wishlist">
              <i className="bi bi-heart"></i>
            </Link>
            <button 
              className={`cart-icon bg-transparent border-0 p-0 position-relative ${animateCart ? 'animate' : ''}`} 
              onClick={toggleCart}
            >
              <i className="bi bi-bag"></i>
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
