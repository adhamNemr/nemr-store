"use client";

import React from 'react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface CustomerDetailsSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export default function CustomerDetailsSlideOver({ isOpen, onClose, customer }: CustomerDetailsSlideOverProps) {
  useScrollLock(isOpen);

  if (!isOpen || !customer) return null;

  return (
    <>
      <div className="nemr-blur-overlay" onClick={onClose} />
      <div className="nemr-details-panel">
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
          <div>
            <h4 className="fw-black mb-0" style={{ letterSpacing: '-1px' }}>CUSTOMER INSIGHT</h4>
            <p className="text-muted extra-small mb-0 fw-bold text-uppercase">Member since {new Date(customer.joinedAt).toLocaleDateString()}</p>
          </div>
          <button className="btn-nemr-action" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
          {/* Main Profile Image/Bio */}
          <div className="text-center mb-5 pb-4 border-bottom">
            <div className="position-relative d-inline-block mb-3">
              <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center fw-bold text-white border-4 border-white shadow" style={{width: 100, height: 100, fontSize: '2.5rem'}}>
                {customer.name?.[0]?.toUpperCase()}
              </div>
              <span className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: 24, height: 24 }}></span>
            </div>
            <h3 className="fw-black mb-1" style={{ letterSpacing: '-1px' }}>{customer.name}</h3>
            <div className="text-muted small mb-3"><i className="bi bi-geo-alt me-2"></i>Cairo, Egypt</div>
            
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold small border"><i className="bi bi-envelope me-2"></i>EMAIL</button>
              <button className="btn btn-sm btn-light rounded-pill px-3 fw-bold small border"><i className="bi bi-telephone me-2"></i>CALL</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="row g-3 mb-5">
            <div className="col-6">
              <div className="bg-light p-4 rounded-4 text-center border border-white h-100">
                <div className="text-muted extra-small fw-black text-uppercase mb-2 letter-spacing-1">Lifetime Orders</div>
                <div className="fw-black fs-2 text-dark">{customer.orderCount}</div>
                <div className="extra-small text-muted fw-bold">Success: 100%</div>
              </div>
            </div>
            <div className="col-6">
              <div className="bg-light p-4 rounded-4 text-center border border-white h-100">
                <div className="text-muted extra-small fw-black text-uppercase mb-2 letter-spacing-1">Total Conversion</div>
                <div className="fw-black fs-2 text-primary">{customer.totalSpent?.toLocaleString()}</div>
                <div className="extra-small text-muted fw-bold">EGP TOTAL</div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="mb-4">
            <h6 className="text-uppercase extra-small fw-black text-muted mb-4 letter-spacing-2">Purchase Timeline</h6>
            <div className="d-grid gap-3">
              <div className="d-flex gap-3 position-relative">
                <div className="bg-soft-success text-success p-2 rounded-3 h-fit-content">
                  <i className="bi bi-cart-check-fill"></i>
                </div>
                <div className="border-bottom pb-3 w-100">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold small">Latest Purchase - Completed</span>
                    <span className="extra-small text-muted">{new Date(customer.lastOrderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="small text-muted">Order #429 • Electronics Category</div>
                </div>
              </div>
              <div className="d-flex gap-3 text-muted opacity-50">
                <div className="bg-light p-2 rounded-3 h-fit-content">
                  <i className="bi bi-clock-history"></i>
                </div>
                <div className="w-100">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold small">Previous Engagement</span>
                    <span className="extra-small text-muted">2 months ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-top bg-white">
          <button className="btn btn-dark w-100 py-3 rounded-pill fw-bold extra-small letter-spacing-1 shadow-lg" onClick={onClose}>
            DOWNLOAD FULL DOSSIER
          </button>
        </div>
      </div>
    </>
  );
}
