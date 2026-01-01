"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [cache] = useState<Record<string, any>>({});
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const response = await api.get('/products');
        const data = response.data.products || response.data;
        setTrending(data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const fetchResults = useCallback(async (searchQuery: string, signal: AbortSignal) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    if (cache[searchQuery]) {
      setResults(cache[searchQuery]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // REMOVED setResults([]); to keep current results while searching (no blank screen)
    
    try {
      const response = await api.get(`/products?q=${encodeURIComponent(searchQuery)}`, { signal });
      const data = response.data.products || response.data;
      setResults(data);
      cache[searchQuery] = data;
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  useEffect(() => {
    const controller = new AbortController();
    
    // 🟢 Instant Check: If it's in cache, show it IMMEDIATELY without debounce
    if (query.trim() && cache[query.trim()]) {
       setResults(cache[query.trim()]);
       setLoading(false);
       return;
    }

    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        fetchResults(query.trim(), controller.signal);
        const params = new URLSearchParams();
        params.set('q', query);
        router.replace(`/search?${params.toString()}`, { scroll: false });
      } else {
        setResults([]);
        router.replace('/search', { scroll: false });
      }
    }, 250); 

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [query, router, fetchResults, cache]);

  return (
    <div className="container py-5 mt-5" style={{ minHeight: '80vh' }}>
      <div className="search-header mb-5">
        <h1 className="display-4 fw-bold mb-4 letter-spacing-1">SEARCH</h1>
        <div className="position-relative">
          <input 
            type="text" 
            className="form-control border-0 border-bottom rounded-0 px-0 py-3 fs-3 fw-light"
            placeholder="Explore NEMR Collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              boxShadow: 'none', 
              backgroundColor: 'transparent',
              outline: 'none',
              paddingRight: '60px'
            }}
            autoFocus
          />
          <div className="position-absolute end-0 top-50 translate-middle-y d-flex align-items-center">
            {loading && <div className="spinner-border spinner-border-sm text-muted me-3" role="status"></div>}
            {query && (
              <button className="bg-transparent border-0 p-2 text-muted" onClick={() => setQuery('')}>
                <i className="bi bi-x-lg fs-5"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="results-wrapper" style={{ transition: 'opacity 0.3s ease', opacity: loading ? 0.6 : 1 }}>
        {query.trim() !== '' ? (
          <div className="search-results-view">
            {/* Stable Header Area */}
            <div className="results-info-bar mb-5 d-flex justify-content-between align-items-center border-bottom pb-3" style={{ height: '40px' }}>
               {loading ? (
                 <span className="text-muted small text-uppercase letter-spacing-2">Finding items...</span>
               ) : (
                 <p className="text-muted text-uppercase small letter-spacing-2 mb-0">
                   {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
                 </p>
               )}
            </div>

            {/* Results Grid */}
            <div className="row g-4">
              {results.map((product: any) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {!loading && results.length === 0 && (
              <div className="text-center py-5 my-5">
                <h2 className="fw-light mb-3">NO MATCHES FOUND</h2>
                <p className="text-muted mb-5">Try searching for something more general.</p>
                <button onClick={() => setQuery('')} className="btn btn-dark rounded-0 px-5 py-3 text-uppercase small fw-bold">Reset Search</button>
              </div>
            )}
          </div>
        ) : (
          <div className="discovery-view animate-fade-in">
             <div className="mb-5">
              <h5 className="text-uppercase small fw-bold letter-spacing-2 mb-4 color-black border-bottom pb-3">Trending Now</h5>
              {loadingTrending ? (
                <div className="row g-4">
                  {[1,2,3,4].map(i => <div key={i} className="col-6 col-md-3 bg-light" style={{ height: '300px' }}></div>)}
                </div>
              ) : (
                <div className="row g-4">
                  {trending.map((product: any) => (
                    <div key={product.id} className="col-6 col-md-3">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-light p-4">
               <h5 className="text-uppercase small fw-bold letter-spacing-2 mb-3">Promoted Tags</h5>
               <div className="d-flex flex-wrap gap-2">
                {['Winter', 'Sales', 'New In', 'Best Sellers'].map(tag => (
                  <button key={tag} onClick={() => setQuery(tag)} className="btn btn-white bg-white border-0 rounded-0 px-4 py-2 small shadow-sm">#{tag}</button>
                ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-5 mt-5 text-center">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
