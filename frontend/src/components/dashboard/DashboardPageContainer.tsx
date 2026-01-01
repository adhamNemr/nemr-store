"use client";

import React from 'react';

interface DashboardPageContainerProps {
  children: React.ReactNode;
  isShrunk: boolean;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  overlay?: React.ReactNode; // New prop for slide-overs
}

export default function DashboardPageContainer({ 
  children, 
  isShrunk, 
  title, 
  subtitle, 
  actions,
  overlay
}: DashboardPageContainerProps) {
  return (
    <>
      <div className="animate-fade-in pb-5">
        <div 
          className={isShrunk ? 'nemr-shrink-effect' : ''} 
          style={{
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isShrunk ? 'none' : 'auto',
            minHeight: '100vh' /* Ensure it covers full height */
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">{title}</h2>
              {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
            </div>
            {actions && <div className="d-flex gap-2">{actions}</div>}
          </div>
          
          {children}
        </div>
      </div>

      {/* Render overlay outside of the animated container to avoid transform-based clipping/offsetting */}
      {overlay}
    </>
  );
}
