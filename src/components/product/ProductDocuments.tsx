import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { ProductDocument } from '@/data/mockData';

interface ProductDocumentsProps {
  documents?: ProductDocument[];
}

export const ProductDocuments: React.FC<ProductDocumentsProps> = ({ documents }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <section id="documents" className="space-y-3 border-t border-slate-200 pt-8">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Datasheets & Downloads</h2>
      <p className="text-xs text-slate-500">Download official engineering schematics, pinout diagrams, and programming manuals.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {documents.map((doc, idx) => (
          <a
            key={idx}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-50 hover:bg-[#E0F7FC] border border-slate-200 hover:border-[#00AEEF]/40 p-4 rounded-2xl flex items-center justify-between transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#00AEEF] group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#00AEEF] transition-colors leading-snug">
                  {doc.title}
                </h4>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">{doc.type} Document</span>
              </div>
            </div>

            <Download className="w-4 h-4 text-slate-400 group-hover:text-[#00AEEF] shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
};
