'use client';

import React from 'react';
import { FolderTree, Wrench, GraduationCap, Tag, FolderKanban } from 'lucide-react';

export default function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{title} Management</h1>
        <p className="text-xs text-slate-500 font-medium">Manage {title.toLowerCase()} catalog and database content</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#E0F7FC] text-[#00AEEF] flex items-center justify-center mx-auto">
          <FolderTree className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">{title} Portal Active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          All {title.toLowerCase()} changes made through this portal immediately update the customer-facing website via the unified PostgreSQL database engine.
        </p>
      </div>
    </div>
  );
}
