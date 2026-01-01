"use client";

import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import api from '@/lib/api';
import { useState, useEffect } from 'react';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function SettingsPage() {
  const { token, user } = useAuth();
  const { data: settings, error, mutate, isLoading } = useSWR(token ? '/dashboard/settings' : null, fetcher);
  
  const [formData, setFormData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => prev.map(item => item.key === key ? { ...item, value } : item));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/dashboard/settings', formData);
      mutate();
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-5 text-center text-danger">Access Denied</div>;
  }

  if (isLoading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;

  return (
    <div className="animate-fade-in pb-5" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Store Settings</h2>
        <p className="text-muted">Global marketplace configuration.</p>
      </div>

      <div className="dashboard-card border-0 shadow-sm p-4">
        <form onSubmit={handleSubmit}>
          {formData.map((s: any) => (
            <div className="mb-4" key={s.key}>
              <label className="form-label small fw-bold text-uppercase text-muted">{s.label}</label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                value={s.value} 
                onChange={(e) => handleChange(s.key, e.target.value)} 
              />
            </div>
          ))}

          <hr className="my-4" />

          <button type="submit" className="btn btn-dark px-5 py-2 rounded-pill fw-bold" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
