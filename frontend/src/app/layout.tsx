import type { Metadata } from 'next';
import './globals.css';
import '@/styles/storefront-layout.css';
import '@/styles/storefront-components.css';
import '@/styles/storefront-pages.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'NEMR | Premium Fashion Marketplace',
  description: 'A premium fashion marketplace for modern style.',
};

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import CartDrawer from '@/components/layout/CartDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
