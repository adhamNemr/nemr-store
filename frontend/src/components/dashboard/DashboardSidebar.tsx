"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
    { name: 'My Products', path: '/dashboard/products', icon: 'bi-bag-fill' },
    { name: 'Orders', path: '/dashboard/orders', icon: 'bi-cart-check-fill' },
  ];

  // Admin only items
  if (isAdmin) {
    menuItems.push(
      { name: 'Marketplace Stats', path: '/dashboard/admin/stats', icon: 'bi-graph-up-arrow' },
      { name: 'Manage Sellers', path: '/dashboard/admin/sellers', icon: 'bi-people-fill' }
    );
  }

  return (
    <aside className="dashboard-sidebar">
      <Link href="/" className="sidebar-brand">NEMR.</Link>
      
      <div className="user-profile mb-5 px-2">
         <p className="small text-muted mb-1 text-uppercase letter-spacing-1">Logged as</p>
         <h6 className="fw-bold mb-0 text-white">{user?.username}</h6>
         <span className="badge bg-white text-black mt-2 rounded-0 small">{user?.role}</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-5">
        <button onClick={logout} className="sidebar-link w-100 border-0 bg-transparent text-danger">
          <i className="bi bi-box-arrow-left"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}
