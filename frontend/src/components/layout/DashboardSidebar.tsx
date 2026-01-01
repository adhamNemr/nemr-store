"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="d-lg-none btn btn-dark position-fixed top-0 start-0 m-3 z-3 shadow-lg rounded-circle"
        style={{ width: 45, height: 45 }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <i className={`bi ${isMobileOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar d-flex flex-column ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="mb-5 px-3">
          <Link href="/" className="sidebar-brand text-white text-decoration-none d-flex align-items-center gap-2">
            <div className="bg-white text-black px-2 py-0 fw-black rounded">N</div>
            <span className="fw-black" style={{letterSpacing: '-1px'}}>NEMR</span>
          </Link>
          <div className="d-flex align-items-center gap-3 mt-4 pt-4 border-top border-secondary border-opacity-25">
              <div className="bg-white text-black rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{width: 45, height: 45, minWidth: 45}}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden" style={{lineHeight: '1.2'}}>
                  <div className="fw-bold text-white small text-truncate">{user?.username}</div>
                  <div className="text-white-50 small" style={{fontSize: '10px', letterSpacing: '1px'}}>{user?.role?.toUpperCase()}</div>
              </div>
          </div>
        </div>

        <nav className="flex-grow-1 px-2" style={{ overflowY: 'auto' }}>
          <ul className="sidebar-nav list-unstyled">
            {/* COMMON / OVERVIEW */}
            <div className="sidebar-section-label">Core Management</div>
            <li>
              <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-grid-1x2-fill"></i>
                <span>{user?.role === 'admin' ? 'Marketplace Overview' : 'Shop Overview'}</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/stats" className={`sidebar-link ${isActive('/dashboard/stats') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-graph-up-arrow"></i>
                <span>{user?.role === 'admin' ? 'Global Analytics' : 'Sales Analytics'}</span>
              </Link>
            </li>

            {/* CATALOG / SALES MANAGEMENT */}
            <div className="sidebar-section-label mt-4">
              {user?.role === 'admin' ? 'Ecosystem Oversight' : 'My Inventory'}
            </div>
            <li>
              <Link href="/dashboard/products" className={`sidebar-link ${isActive('/dashboard/products') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-shield-check"></i>
                <span>{user?.role === 'admin' ? 'Product Moderation' : 'My Products'}</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/orders" className={`sidebar-link ${isActive('/dashboard/orders') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-bag-check-fill"></i>
                <span>{user?.role === 'admin' ? 'Marketplace Orders' : 'Store Orders'}</span>
              </Link>
            </li>

            {/* USER MANAGEMENT - ADMIN ONLY (mostly) */}
            <div className="sidebar-section-label mt-4">Users & Vendors</div>
            <li>
              <Link href="/dashboard/customers" className={`sidebar-link ${isActive('/dashboard/customers') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-people-fill"></i>
                <span>{user?.role === 'admin' ? 'All Customers' : 'My Customers'}</span>
              </Link>
            </li>
            
            {user?.role === 'admin' && (
               <li>
                  <Link href="/dashboard/sellers" className={`sidebar-link ${isActive('/dashboard/sellers') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                  <i className="bi bi-shop-window"></i>
                  <span>Sellers Management</span>
                  </Link>
              </li>
            )}

            {/* MARKETING */}
            <div className="sidebar-section-label mt-4">Growth & Marketing</div>
            <li>
              <Link href="/dashboard/coupons" className={`sidebar-link ${isActive('/dashboard/coupons') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className="bi bi-ticket-perforated-fill"></i>
                <span>{user?.role === 'admin' ? 'Platform Coupons' : 'My Discounts'}</span>
              </Link>
            </li>

            {/* SYSTEM SETTINGS - ADMIN ONLY */}
            {user?.role === 'admin' && (
               <>
                  <div className="sidebar-section-label mt-4">Configuration</div>
                  <li>
                      <Link href="/dashboard/settings" className={`sidebar-link ${isActive('/dashboard/settings') ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                      <i className="bi bi-shield-lock-fill text-warning"></i>
                      <span>Marketplace Settings</span>
                      </Link>
                  </li>
               </>
            )}
          </ul>
        </nav>

        <div className="px-2 pb-4 mt-auto">
          <Link href="/shop" className="sidebar-link mb-2 text-white-50">
              <i className="bi bi-box-arrow-up-right small"></i>
              <span className="small">Go to Storefront</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-100 border-0 bg-transparent text-danger-emphasis d-flex align-items-center gap-3 py-2 px-3 rounded">
            <i className="bi bi-power"></i>
            <span className="fw-bold small">Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
