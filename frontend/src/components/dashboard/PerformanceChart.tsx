"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: any[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Use data directly. Our backend now handles the period filtering.
  const displayData = data || [];

  return (
    <div className="h-100" style={{ minHeight: '300px' }}>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.08}/>
                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#999', fontSize: 10}} 
              dy={10} 
              tickFormatter={(val) => {
                try {
                  return new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                } catch {
                  return val;
                }
              }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#999', fontSize: 10}} 
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
              cursor={{ stroke: '#eee', strokeWidth: 2 }}
              itemStyle={{ fontWeight: '800', color: '#000' }}
              labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#000" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorSales)"
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#000' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
