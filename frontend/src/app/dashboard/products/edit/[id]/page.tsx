"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function EditProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('vital');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    stock: '0',
    description: '',
    size: '',
    condition: 'new',
    category: 'men',
    image: '',
    allowDiscounts: true
  });

  const [options, setOptions] = useState<{name: string, values: string[]}[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [invSearch, setInvSearch] = useState('');
  const [invFilters, setInvFilters] = useState<{[key: string]: string}>({});
  const [isDirty, setIsDirty] = useState(false);
  
  const [visualOptionIndex, setVisualOptionIndex] = useState<number>(-1);
  const [activeVisualValue, setActiveVisualValue] = useState<string>(''); // For Tabs

  useEffect(() => {
     if (visualOptionIndex === -1 && options.length > 0) {
        const potentialIdx = options.findIndex(o => ['color', 'colour', 'style', 'material', 'pattern'].some(k => o.name.toLowerCase().includes(k)));
        if (potentialIdx !== -1) {
            setVisualOptionIndex(potentialIdx);
            setActiveVisualValue(options[potentialIdx].values[0] || '');
        } else if (options.length > 0) {
            setVisualOptionIndex(0);
            setActiveVisualValue(options[0].values[0] || '');
        }
     } else if (visualOptionIndex !== -1 && options[visualOptionIndex] && !activeVisualValue) {
         setActiveVisualValue(options[visualOptionIndex].values[0] || '');
     }
  }, [options.length, visualOptionIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        const p = response.data;
        
        setFormData({
          name: p.name || '',
          price: p.price?.toString() || '',
          discountPrice: p.discountPrice?.toString() || '',
          stock: p.stock?.toString() || '0',
          description: p.description || '',
          size: p.size || '',
          condition: p.condition || 'new',
          category: p.category || 'men',
          image: p.image || '',
          allowDiscounts: p.allowDiscounts !== undefined ? p.allowDiscounts : true
        });
        
        if (p.variants && p.variants.length > 0) {
           const colorValues = Array.from(new Set(p.variants.map((v: any) => v.color).filter(Boolean))) as string[];
           const sizeValues = Array.from(new Set(p.variants.map((v: any) => v.size).filter(Boolean))) as string[];
           
           const newOptions = [];
           if (colorValues.length > 0) newOptions.push({ name: 'Color', values: colorValues });
           if (sizeValues.length > 0) newOptions.push({ name: 'Size', values: sizeValues });
           
           setOptions(newOptions);
           
           const parsedVariants = p.variants.map((v: any) => ({
               ...v,
               images: typeof v.images === 'string' ? JSON.parse(v.images) : (Array.isArray(v.images) ? v.images : [])
           }));
           setVariants(parsedVariants);
        } else {
            setVariants([]);
        }
      } catch (err) {
        alert('Failed to load product');
        console.error(err);
        router.push('/dashboard/products');
      } finally {
        setFetching(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, router]);

  const generateVariants = (updatedOptions: typeof options) => {
    if (updatedOptions.length === 0) {
      setVariants([]);
      return;
    }

    const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
    const valueGroups = updatedOptions.map(o => o.values);
    if (valueGroups.some(g => g.length === 0)) return;

    let combinations = valueGroups.length === 1 ? valueGroups[0].map((v: any) => [v]) : cartesian(...valueGroups);

    const newVariants = combinations.map((combo: any[]) => {
      const variantObj: any = { stock: '0', images: [] };
      updatedOptions.forEach((opt, i) => {
        const val = combo[i];
        if (opt.name.toLowerCase().includes('color')) variantObj.color = val;
        else if (opt.name.toLowerCase().includes('size')) variantObj.size = val;
        else variantObj[opt.name.toLowerCase()] = val;
      });

      const existing = variants.find(v => {
          return updatedOptions.every((opt, i) => {
             const key = opt.name.toLowerCase().includes('color') ? 'color' : (opt.name.toLowerCase().includes('size') ? 'size' : opt.name.toLowerCase());
             return v[key] === combo[i];
          });
      });

      if (existing) {
          variantObj.stock = existing.stock;
          variantObj.images = existing.images || [];
      }

      return variantObj;
    });
    setVariants(newVariants);
  };

  const addOption = () => {
    if (options.length >= 3) return;
    const defaultNames = ['Size', 'Color', 'Material'];
    const nextName = defaultNames.find(n => !options.some(o => o.name === n)) || 'Option';
    setOptions([...options, { name: nextName, values: [] }]);
  };

  const updateOptionName = (idx: number, name: string) => {
    const newOpts = [...options];
    newOpts[idx].name = name;
    setOptions(newOpts);
    setIsDirty(true);
    generateVariants(newOpts);
  };

  const addOptionValue = (idx: number, val: string) => {
    if (!val.trim()) return;
    const newOpts = [...options];
    if (!newOpts[idx].values.includes(val.trim())) {
      newOpts[idx].values.push(val.trim());
      setOptions(newOpts);
      setIsDirty(true);
      generateVariants(newOpts);
    }
  };

  const removeOptionValue = (oIdx: number, vIdx: number) => {
    const newOpts = [...options];
    newOpts[oIdx].values.splice(vIdx, 1);
    setOptions(newOpts);
    setIsDirty(true);
    generateVariants(newOpts);
  };

  const removeOption = (idx: number) => {
    const newOpts = options.filter((_, i) => i !== idx);
    setOptions(newOpts);
    setIsDirty(true);
    generateVariants(newOpts);
  };

  const handleVariantStockChange = (idx: number, stock: string) => {
    const newVariants = [...variants];
    newVariants[idx].stock = stock;
    setVariants(newVariants);
    setIsDirty(true);
    const total = newVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
    setFormData(prev => ({ ...prev, stock: total.toString() }));
  };

  const addImageToProperty = (propName: string, propValue: string, url: string) => {
      if (!url.trim()) return;
      const newVariants = variants.map(v => {
          const key = propName.toLowerCase().includes('color') ? 'color' : (propName.toLowerCase().includes('size') ? 'size' : propName.toLowerCase());
          if (v[key] === propValue) {
              const currentImages = v.images || [];
              if (!currentImages.includes(url)) {
                  return { ...v, images: [...currentImages, url] };
              }
          }
          return v;
      });
      setVariants(newVariants);
      setIsDirty(true);
  };

  const removeImageFromProperty = (propName: string, propValue: string, imgIdx: number) => {
      const newVariants = variants.map(v => {
          const key = propName.toLowerCase().includes('color') ? 'color' : (propName.toLowerCase().includes('size') ? 'size' : propName.toLowerCase());
          if (v[key] === propValue) {
               const currentImages = [...(v.images || [])];
               currentImages.splice(imgIdx, 1);
               return { ...v, images: currentImages };
          }
          return v;
      });
      setVariants(newVariants);
      setIsDirty(true);
  };

  const moveImageInProperty = (propName: string, propValue: string, oldIdx: number, newIdx: number) => {
      const newVariants = variants.map(v => {
          const key = propName.toLowerCase().includes('color') ? 'color' : (propName.toLowerCase().includes('size') ? 'size' : propName.toLowerCase());
          if (v[key] === propValue) {
               const currentImages = [...(v.images || [])];
               const item = currentImages[oldIdx];
               currentImages.splice(oldIdx, 1);
               currentImages.splice(newIdx, 0, item);
               return { ...v, images: currentImages };
          }
          return v;
      });
      setVariants(newVariants);
      setIsDirty(true);
  };
  
  const getImagesForValue = (optionName: string, optionValue: string) => {
      const key = optionName.toLowerCase().includes('color') ? 'color' : (optionName.toLowerCase().includes('size') ? 'size' : optionName.toLowerCase());
      const variant = variants.find(v => v[key] === optionValue);
      return variant?.images || [];
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };
  
  // Set first image of first variant as main image if empty
  const setMainImageFromVariant = () => {
      const firstVariantWithImage = variants.find(v => v.images && v.images.length > 0);
      if (firstVariantWithImage && firstVariantWithImage.images[0]) {
          setFormData(prev => ({ ...prev, image: firstVariantWithImage.images[0] }));
          setIsDirty(true);
      }
  };

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
      showToast('Sale price must be lower than the original price.', 'error');
      setLoading(false);
      return;
    }

    const payload = { ...formData, variants };
    if (variants.length > 0) {
      payload.stock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0).toString();
    }

    try {
      await api.put(`/products/${productId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDirty(false); 
      showToast('Product updated successfully!', 'success');
      setTimeout(() => router.push('/dashboard/products'), 1500);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update product', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-5"><div className="spinner-border text-dark" role="status"></div></div>;

  return (
    <div className="animate-fade-in position-relative">
        {toast.show && (
            <div className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3" style={{ zIndex: 9999 }}>
                <div className={`shadow-lg rounded-pill px-4 py-3 d-flex align-items-center gap-3 animate__animated animate__fadeInDown ${toast.variant === 'success' ? 'bg-dark text-white' : 'bg-danger text-white'}`}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center bg-white ${toast.variant === 'success' ? 'text-dark' : 'text-danger'}`} style={{ width: 24, height: 24 }}><i className={`bi ${toast.variant === 'success' ? 'bi-check-lg' : 'bi-exclamation-lg'}`} style={{ fontSize: '16px' }}></i></div>
                    <div className="fw-bold small">{toast.message}</div>
                </div>
            </div>
        )}
      <div className="mb-4">
        <Link href="/dashboard/products" className="text-dark text-decoration-none small fw-bold"><i className="bi bi-arrow-left me-2"></i> Back to Products</Link>
      </div>

      <div className="row">
        <div className="col-lg-9">
          <div className="dashboard-card shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h3 className="fw-bold mb-0">Edit Product: {formData.name}</h3>
               <span className="badge bg-light text-dark border p-2">PID: {productId}</span>
            </div>

            <div className="amazon-tabs">
              <div className={`amazon-tab-item ${activeTab === 'vital' ? 'active' : ''}`} onClick={() => setActiveTab('vital')}>1. GENERAL INFO</div>
              <div className={`amazon-tab-item ${activeTab === 'options' ? 'active' : ''}`} onClick={() => setActiveTab('options')}>2. DEFINE SIZES/COLORS</div>
              <div className={`amazon-tab-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>3. MANAGE STOCK</div>
              <div className={`amazon-tab-item ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>4. PRICE & PHOTOS</div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {activeTab === 'vital' && (
                  <div className="col-12 animate-fade-in">
                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-bold small text-uppercase mb-1">Product Name *</label>
                        <input type="text" name="name" className="form-control form-control-lg rounded-3" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="fw-bold small text-uppercase text-muted mb-1">Category</label>
                        <select name="category" className="form-select form-select-lg rounded-3" value={formData.category} onChange={handleChange}>
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                          <option value="kids">Kids</option>
                          <option value="shoes">Shoes</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="fw-bold small text-uppercase text-muted mb-1">Condition</label>
                        <select name="condition" className="form-select form-select-lg rounded-3" value={formData.condition} onChange={handleChange}>
                          <option value="new">New</option>
                          <option value="used">Used</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold small text-uppercase">Description</label>
                        <textarea name="description" className="form-control rounded-3" rows={6} value={formData.description} onChange={handleChange} />
                      </div>
                      <div className="col-12 text-end pt-3"><button type="button" className="btn btn-dark px-4 fw-bold rounded-pill" onClick={() => setActiveTab('options')}>Continue to Options</button></div>
                    </div>
                  </div>
                )}

                {activeTab === 'options' && (
                  <div className="col-12 animate-fade-in">
                    <div className="variation-theme-box shadow-sm mb-4">
                        <h6 className="fw-bold mb-3">Product Properties</h6>
                        <p className="small text-muted mb-4">Update the properties like Size or Color.</p>
                        {options.map((opt, optIdx) => (
                           <div key={optIdx} className="mb-4 pb-3 border-bottom">
                              <div className="row g-2 align-items-center mb-2">
                                 <div className="col-md-3">
                                    <label className="small fw-bold text-muted">Property Name</label>
                                    <select className="form-select form-select-sm" value={opt.name} onChange={(e) => updateOptionName(optIdx, e.target.value)}>
                                       <option value="Size">Size</option>
                                       <option value="Color">Color</option>
                                       <option value="Material">Material</option>
                                       <option value="Style">Style</option>
                                    </select>
                                 </div>
                                 <div className="col-md-8">
                                    <label className="small fw-bold text-muted">Available Values</label>
                                    <input type="text" placeholder="Add value & press Enter" className="form-control form-control-sm" onKeyDown={(e: any) => {
                                        if (e.key === 'Enter') { e.preventDefault(); addOptionValue(optIdx, e.target.value); e.target.value = ''; }
                                    }} />
                                 </div>
                                 <div className="col-md-1 text-end pt-4"><button type="button" onClick={() => removeOption(optIdx)} className="btn btn-link text-danger p-0"><i className="bi bi-trash"></i></button></div>
                              </div>
                              <div className="d-flex flex-wrap gap-2 mt-2">
                                 {opt.values.map((val, valIdx) => (
                                    <span key={valIdx} className="option-tag shadow-sm">{val}<i className="bi bi-x ms-2" onClick={() => removeOptionValue(optIdx, valIdx)}></i></span>
                                 ))}
                              </div>
                           </div>
                        ))}
                        {options.length < 3 && <button type="button" onClick={addOption} className="btn btn-outline-dark btn-sm rounded-pill fw-bold"><i className="bi bi-plus-lg me-1"></i> Add Another Property</button>}
                    </div>
                    <div className="col-12 text-end mt-5 border-top pt-4"><button type="button" className="btn btn-dark px-4 fw-bold rounded-pill" onClick={() => setActiveTab('inventory')}>Continue to Inventory</button></div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="col-12 animate-fade-in">
                    {variants.length > 0 ? (
                      <div className="mt-2">
                        <div className="table-responsive">
                            <table className="amazon-variant-table shadow-sm">
                               <thead><tr><th style={{width: '250px'}}>Item Details</th><th>Availability</th><th style={{width: '150px'}}>Adjust Stock</th></tr></thead>
                               <tbody>
                                  {variants.map((v, vIdx) => {
                                      const originalIdx = variants.indexOf(v);
                                      const stockVal = parseInt(v.stock) || 0;
                                      const isSoldOut = stockVal === 0;
                                      return (
                                        <tr key={vIdx} className={isSoldOut ? 'bg-soft-danger' : ''}>
                                           <td className="fw-bold text-dark text-capitalize">
                                              <div className="d-flex align-items-center gap-2">
                                                  {v.images && v.images[0] && <img src={v.images[0]} className="rounded-1 border" style={{width:24, height:24}} />}
                                                  {options.map(opt => v[opt.name.toLowerCase()] || v[opt.name]).filter(Boolean).join(' / ')}
                                              </div>
                                           </td>
                                           <td>{isSoldOut ? <span className="badge bg-danger">Sold Out</span> : <span className="badge bg-success">In Stock</span>}</td>
                                           <td>
                                              <div className="input-group input-group-sm">
                                                <input type="number" className="form-control border-dark border-2 fw-bold text-center" style={{maxWidth: '70px'}} value={v.stock} onChange={(e) => handleVariantStockChange(originalIdx, e.target.value)} />
                                                <button type="button" className="btn btn-outline-dark px-1 x-small fw-bold" onClick={() => handleVariantStockChange(originalIdx, ((parseInt(v.stock) || 0) + 5).toString())}>+5</button>
                                                <button type="button" className="btn btn-outline-dark px-1 x-small fw-bold" onClick={() => handleVariantStockChange(originalIdx, ((parseInt(v.stock) || 0) + 10).toString())}>+10</button>
                                              </div>
                                           </td>
                                        </tr>
                                      );
                                    })}
                               </tbody>
                            </table>
                        </div>
                      </div>
                    ) : (
                      <div className="row g-4 pt-2">
                         <div className="col-md-6 text-center mx-auto py-5">
                            <label className="fw-bold small text-uppercase text-muted mb-3 d-block">Global Warehouse Stock</label>
                             <div className="input-group input-group-lg shadow-sm border rounded-3">
                                <input type="number" name="stock" className="form-control text-center fw-bold border-0 bg-light" min="0" value={formData.stock} onChange={handleChange} required />
                             </div>
                         </div>
                      </div>
                    )}
                    <div className="col-12 text-end mt-5 border-top pt-4"><button type="button" className="btn btn-dark px-4 fw-bold rounded-pill" onClick={() => setActiveTab('images')}>Continue to Pricing & Photos</button></div>
                  </div>
                )}

                {activeTab === 'images' && (
                   <div className="col-12 animate-fade-in">
                      <div className="row g-4">
                        {/* LEFT COLUMN: Price & Base Info */}
                        <div className="col-md-5">
                            <div className="p-4 bg-white rounded-4 shadow-sm h-100 border">
                                <h6 className="fw-bold small text-muted text-uppercase mb-4 pb-2 border-bottom">Pricing & Info</h6>
                                
                                <label className="fw-bold small text-muted mb-1">Base Price (EGP)</label>
                                <div className="input-group shadow-sm rounded-3 overflow-hidden mb-4">
                                    <span className="input-group-text bg-light border-0 fw-bold text-muted">EGP</span>
                                    <input type="number" name="price" className="form-control border-0 fw-bold fs-5" placeholder="0.00" value={formData.price} onChange={handleChange} required={options.length === 0} />
                                </div>

                                <label className="fw-bold small text-muted mb-1">Sale Price <span className="fw-normal text-muted">(Optional)</span></label>
                                <div className="input-group shadow-sm rounded-3 overflow-hidden mb-4">
                                    <span className="input-group-text bg-light border-0 fw-bold text-muted">EGP</span>
                                    <input type="number" name="discountPrice" className="form-control border-0 fw-bold fs-5 text-danger" placeholder="0.00" value={formData.discountPrice} onChange={handleChange} />
                                </div>

                                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border">
                                     <div>
                                        <span className="d-block small fw-bold text-dark">Allow Coupons</span>
                                        <span className="d-block x-small text-muted">Customers can use discount codes</span>
                                     </div>
                                     <div className="form-check form-switch m-0">
                                         <input className="form-check-input" type="checkbox" checked={formData.allowDiscounts} style={{ transform: 'scale(1.3)', cursor:'pointer' }} onChange={(e) => setFormData({...formData, allowDiscounts: e.target.checked})} />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Imagery */}
                        <div className="col-md-7">
                             <div className="p-4 bg-white rounded-4 shadow-sm h-100 border d-flex flex-column">
                                <h6 className="fw-bold small text-muted text-uppercase mb-4 pb-2 border-bottom">Visuals & Search</h6>
                                
                                {/* Main Search Image */}
                                <div className="mb-4">
                                    <label className="fw-bold small text-muted mb-2">Main Search Thumbnail</label>
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="position-relative shadow-sm rounded-3 border" style={{width: 80, height: 100, flexShrink: 0, backgroundColor:'#f9f9f9'}}>
                                             {formData.image ? (
                                                 <img src={formData.image} className="w-100 h-100 object-fit-cover rounded-3" />
                                             ) : (
                                                 <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted"><i className="bi bi-image"></i></div>
                                             )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="input-group input-group-sm mb-2">
                                                <input type="url" name="image" className="form-control" placeholder="https://..." value={formData.image} onChange={handleChange} />
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-dark btn-sm rounded-pill fw-bold x-small px-3"
                                                onClick={() => {
                                                    // Smart Logic: Try to get image from CURRENT active variant tab first
                                                    let imgToUse = '';
                                                    if (visualOptionIndex !== -1 && activeVisualValue) {
                                                        const activeImgs = getImagesForValue(options[visualOptionIndex].name, activeVisualValue);
                                                        if (activeImgs.length > 0) imgToUse = activeImgs[0];
                                                    }
                                                    // Fallback: Try ANY variant image
                                                    if (!imgToUse) {
                                                        const firstVariant = variants.find(v => v.images && v.images.length > 0);
                                                        if (firstVariant) imgToUse = firstVariant.images[0];
                                                    }

                                                    if (imgToUse) {
                                                        setFormData(prev => ({ ...prev, image: imgToUse }));
                                                        setIsDirty(true);
                                                        showToast('Thumbnail updated from active variant!', 'success');
                                                    } else {
                                                        showToast('No variant images found to copy.', 'error');
                                                    }
                                                }}
                                            >
                                                <i className="bi bi-magic me-1"></i> Use from Active Variant
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-grow-1 border-top pt-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <label className="fw-bold small text-muted mb-0">Variant Galleries</label>
                                        {options.filter(o => ['color', 'style', 'material'].some(k => o.name.toLowerCase().includes(k))).length > 1 && (
                                             <select className="form-select form-select-sm w-auto border-0 bg-light fw-bold" value={visualOptionIndex} onChange={(e) => {setVisualOptionIndex(parseInt(e.target.value)); setActiveVisualValue(options[parseInt(e.target.value)].values[0] || '');}}>
                                                {options.map((o, i) => <option key={i} value={i}>Group by {o.name}</option>)}
                                             </select>
                                        )}
                                    </div>
                                    
                                    {options.length > 0 && visualOptionIndex !== -1 && options[visualOptionIndex] ? (
                                        <>
                                            {/* Modern Pill Tabs */}
                                            <div className="d-flex flex-wrap gap-2 mb-4">
                                                {options[visualOptionIndex].values.map((val, idx) => {
                                                    const isActive = activeVisualValue === val;
                                                    const count = getImagesForValue(options[visualOptionIndex].name, val).length;
                                                    return (
                                                        <button 
                                                            key={idx} 
                                                            type="button" 
                                                            className={`btn btn-sm rounded-pill fw-bold px-3 transition-all ${isActive ? 'btn-dark shadow-sm' : 'btn-light text-muted border'}`}
                                                            onClick={() => setActiveVisualValue(val)}
                                                        >
                                                            {val} <span className={`ms-1 opacity-75 small`}>({count})</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {/* Gallery Grid */}
                                            <div className="bg-light p-3 rounded-4 border">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <h6 className="fw-bold mb-0 text-dark small"><i className="bi bi-images me-2"></i>Gallery for <span className="text-dark">{activeVisualValue}</span></h6>
                                                </div>
                                                
                                                <div className="d-flex flex-wrap gap-3 mb-3">
                                                    {getImagesForValue(options[visualOptionIndex].name, activeVisualValue).map((img: string, i: number, arr: string[]) => (
                                                        <div key={i} className="d-flex flex-column align-items-center gap-1" style={{width: 100}}>
                                                            {/* Image */}
                                                            <div className="position-relative shadow-sm rounded-3 overflow-hidden border" style={{width: 100, height: 133}}>
                                                                <img src={img} className="w-100 h-100 object-fit-cover" />
                                                            </div>
                                                            
                                                            {/* Always Visible Controls */}
                                                            <div className="btn-group btn-group-sm shadow-sm" role="group">
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-light border" 
                                                                    disabled={i === 0} 
                                                                    onClick={() => moveImageInProperty(options[visualOptionIndex].name, activeVisualValue, i, i - 1)}
                                                                >
                                                                    <i className="bi bi-chevron-left"></i>
                                                                </button>
                                                                
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-light border text-danger" 
                                                                    onClick={() => removeImageFromProperty(options[visualOptionIndex].name, activeVisualValue, i)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>

                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-light border" 
                                                                    disabled={i === arr.length - 1} 
                                                                    onClick={() => moveImageInProperty(options[visualOptionIndex].name, activeVisualValue, i, i + 1)}
                                                                >
                                                                    <i className="bi bi-chevron-right"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Stable Add Image Input */}
                                                <div className="bg-white p-2 rounded-3 border">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text border-0 bg-transparent"><i className="bi bi-link-45deg"></i></span>
                                                        <input 
                                                            type="text" 
                                                            className="form-control border-0" 
                                                            placeholder="Paste Image URL & Press Enter"
                                                            id="gallery-input-edit"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = e.currentTarget.value;
                                                                    if (val) {
                                                                        addImageToProperty(options[visualOptionIndex].name, activeVisualValue, val);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <button className="btn btn-dark rounded-pill px-3 fw-bold" type="button" onClick={() => {
                                                            const inp = document.getElementById('gallery-input-edit') as HTMLInputElement;
                                                            if (inp && inp.value) {
                                                                addImageToProperty(options[visualOptionIndex].name, activeVisualValue, inp.value);
                                                                inp.value = '';
                                                            }
                                                        }}>ADD</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-5 rounded-4 bg-light border border-dashed">
                                            <i className="bi bi-diagram-3 text-muted fs-2 mb-2"></i>
                                            <p className="text-muted small fw-bold mb-0">No variants defined yet.</p>
                                            <button className="btn btn-link text-decoration-none small fw-bold" onClick={() => setActiveTab('options')}>Go to Options Tab</button>
                                        </div>
                                    )}
                                 </div>
                             </div>
                        </div>

                        {/* Action Bar */}
                        <div className="col-12 mt-3 pt-3 border-top text-end sticky-bottom bg-white p-3 shadow-sm rounded-4" style={{zIndex: 100, bottom: 20}}>
                          <div className="d-flex align-items-center justify-content-between">
                              <span className="small text-muted fw-bold">
                                  {isDirty ? <span className="text-warning"><i className="bi bi-circle-fill small me-1"></i>Unsaved Changes</span> : <span className="text-success"><i className="bi bi-check-circle-fill small me-1"></i>Saved</span>}
                              </span>
                              <button type="submit" className="btn btn-warning btn-lg px-5 fw-bold rounded-pill shadow-sm hover-scale" style={{ background: '#FFD814', border: '1px solid #FCD200', color: '#0F1111' }} disabled={loading}>
                                {loading ? 'SAVING...' : 'SAVE CHANGES'}
                              </button>
                          </div>
                        </div>
                      </div>
                   </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="dashboard-card bg-light border-0 shadow-sm sticky-top" style={{ top: '24px' }}>
            <h6 className="fw-bold text-uppercase small mb-3">Live Preview {activeVisualValue ? `(${activeVisualValue})` : ''}</h6>
            {(() => {
                const variantImg = activeVisualValue && visualOptionIndex !== -1 ? getImagesForValue(options[visualOptionIndex].name, activeVisualValue)[0] : null;
                const displayImg = variantImg || formData.image;
                return displayImg ? (
                    <img src={displayImg} className="w-100 shadow-sm rounded-3 mb-3 bg-white" style={{ aspectRatio: '3/4', objectFit: 'contain' }} />
                ) : (
                    <div className="w-100 shadow-sm rounded-3 mb-3 bg-white d-flex align-items-center justify-content-center text-muted" style={{ aspectRatio: '3/4' }}>No Image</div>
                );
            })()}
            <h6 className="fw-bold small mb-1">{formData.name}</h6>
            <p className="h5 fw-bold text-success mb-2">{formData.price} EGP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
