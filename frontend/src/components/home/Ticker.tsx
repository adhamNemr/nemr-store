import React from 'react';

const tickerItems = [
  "FREE SHIPPING ON ORDERS OVER 2000 EGP",
  "NEW DROPS EVERY FRIDAY",
  "SUMMER SALE IS LIVE",
  "WORLDWIDE EXPRESS SHIPPING",
  "NEMR PREMIUM CLOTHING"
];

export default function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {tickerItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="ticker__item">{item}</div>
            <div className="ticker__item"> • </div>
          </React.Fragment>
        ))}
        {/* Mirror for continuous loop */}
        {tickerItems.map((item, idx) => (
          <React.Fragment key={`mirror-${idx}`}>
            <div className="ticker__item">{item}</div>
            <div className="ticker__item"> • </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
