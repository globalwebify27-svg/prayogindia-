'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CategoryBreadcrumb } from '@/components/categories/CategoryBreadcrumb';
import { ServiceEnquiryModal } from '@/components/services/ServiceEnquiryModal';
import { SERVICES_DATA, ServiceItem } from '@/data/servicesData';
import { CheckCircle2, ArrowLeft, Send, MessageSquare, Maximize2, X } from 'lucide-react';

interface ServiceDetailProps {
  slug: string;
}

export const ServiceDetailView: React.FC<ServiceDetailProps> = ({ slug }) => {
  const service = SERVICES_DATA.find(s => s.slug === slug || s.id === slug) || SERVICES_DATA[0];

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  const whatsappMessage = encodeURIComponent(
    `Hi Prayog India, I am interested in "${service.name}". Please share complete proposal brochure, BOQ, and installation details.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Breadcrumb */}
      <CategoryBreadcrumb
        items={[
          { label: 'Services', href: '/services' },
          { label: service.name }
        ]}
      />

      {/* 2. Service Banner Header */}
      <div className="relative h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-end p-6 sm:p-10 group shadow-2xl">
        <Image
          src={service.bannerImage}
          alt={service.name}
          fill
          priority
          className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="relative z-10 space-y-2 max-w-2xl text-white">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC20E] bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 inline-block">
            Official Service
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {service.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {service.shortDescription}
          </p>
        </div>
      </div>

      {/* 3. Action Buttons Bar (Enquiry + WhatsApp) */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        <button
          onClick={() => setEnquiryOpen(true)}
          className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00AEEF]/20 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Enquire Now</span>
        </button>

        <a
          href={`https://wa.me/919876543210?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>Contact on WhatsApp</span>
        </a>

        <Link
          href="/services"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 ml-auto flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
      </div>

      {/* 4. Service Description */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Overview & Description</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {service.description}
        </p>
      </section>

      {/* 5. Features Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Key Service Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {service.features.map((feat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/90 text-xs font-bold text-slate-800 flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Target Applications */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Target Applications & Beneficiaries</h2>
        <div className="flex flex-wrap gap-2.5 max-w-4xl">
          {service.applications.map((app, idx) => (
            <span key={idx} className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-extrabold px-3.5 py-2 rounded-xl border border-[#00AEEF]/20">
              {app}
            </span>
          ))}
        </div>
      </section>

      {/* 7. Installation Gallery */}
      {service.gallery && service.gallery.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Service & Setup Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {service.gallery.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedGalleryImg(img)}
                className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
              >
                <Image src={img} alt={`Gallery image ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-slate-900/70 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Lightbox Modal */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setSelectedGalleryImg(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
          <div className="relative max-w-4xl w-full h-[70vh] bg-white rounded-3xl overflow-hidden p-4 z-10">
            <button onClick={() => setSelectedGalleryImg(null)} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full z-20">
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <Image src={selectedGalleryImg} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}

      {/* Service Enquiry Modal Component */}
      <ServiceEnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        serviceName={service.name}
      />

    </div>
  );
};
