"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Don't show store footer in dashboard (check AFTER hook)
  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <footer className="modern-footer">
      <div className="footer-top">
        <div className="brand-col">
          <h1>NEMR</h1>
        </div>
        <div className="links-col">
          <h5>Shop</h5>
          <Link href="/shop?cat=men">Men</Link>
          <Link href="/shop?cat=women">Women</Link>
          <Link href="/shop?cat=kids">Kids</Link>
          <Link href="/shop?cat=sale">Sale</Link>
        </div>
        <div className="links-col">
          <h5>Support</h5>
          <Link href="/help">Help</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/size-guide">Size Guide</Link>
        </div>
        <div className="links-col">
          <h5>Company</h5>
          <Link href="/about">About</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NEMR STORE. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
