"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container py-5 mt-5 text-center">
      <div className="mb-4">
        <i className="bi bi-check-circle text-success" style={{ fontSize: '5rem' }}></i>
      </div>
      <h1 className="display-4 fw-bold mb-3 letter-spacing-1">THANK YOU FOR YOUR ORDER</h1>
      <p className="lead mb-4 text-muted">Your order <span className="text-dark fw-bold">#{orderId}</span> has been placed successfully.</p>
      <p className="mb-5">We've sent a confirmation email (simulated) with your order details.</p>
      
      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <Link href="/shop" className="btn btn-dark px-5 py-3 rounded-0 fw-bold letter-spacing-1">CONTINUE SHOPPING</Link>
        <Link href="/orders" className="btn btn-outline-dark px-5 py-3 rounded-0 fw-bold letter-spacing-1">VIEW MY ORDERS</Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-5 mt-5 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
