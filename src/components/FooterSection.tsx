import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, CheckCircle2, Phone, MapPin, Globe } from 'lucide-react';
import { PrayogLogo } from './PrayogLogo';

export const FooterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#050B14] text-white pt-16 pb-10 border-t border-slate-800">
      
      {/* Community Newsletter Box */}
      <div id="community" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-[#0B1528] via-[#00AEEF]/20 to-[#0B1528] rounded-3xl p-8 sm:p-12 border border-[#00AEEF]/40 text-center max-w-4xl mx-auto shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Join the <span className="text-[#00AEEF]">PRAYOG</span> <span className="text-[#FFC20E]">INDIA</span> Community
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
            Get updates about new products, robotics workshops, student internships, hardware learning programs and technology launches.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-5 py-2.5 rounded-full text-xs font-bold border border-emerald-500/40 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#FFC20E]" /> Thank you for subscribing! Check your inbox for your welcome coupon.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <div className="relative w-full">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your institutional or personal email"
                  required
                  className="w-full bg-slate-900/90 text-white placeholder-slate-400 pl-11 pr-4 py-3 rounded-full text-xs border border-slate-700 focus:outline-none focus:border-[#00AEEF]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#00AEEF] hover:bg-[#0096D6] text-white font-extrabold px-6 py-3 rounded-full text-xs shadow-md shrink-0 flex items-center justify-center gap-2 transition-all"
              >
                <span>Join Community</span>
                <Send className="w-3.5 h-3.5 text-[#FFC20E]" />
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-400 mt-4">
            We respect your privacy. Unsubscribe at any time. Zero spam.
          </p>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800 text-xs">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <PrayogLogo size="md" dark={true} />
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs">
              India&apos;s premier e-commerce ecosystem for robotics components, STEM learning kits, drone electronics, and research development boards.
            </p>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFC20E]" /> New Delhi &amp; Bengaluru, India
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#00AEEF]" /> +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#FFC20E]" /> www.prayogindia.in
              </div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">Products</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><Link href="#categories" className="hover:text-white transition-colors">Robotics Kits & Manipulators</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">Arduino & Shields</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">Drone & Autopilot Gear</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">IoT & LoRa Modules</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">STEM DIY Hardware</Link></li>
              <li><Link href="#categories" className="hover:text-white transition-colors">Raspberry Pi & Jetson</Link></li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><Link href="#solutions" className="hover:text-white transition-colors">Educational STEM Labs</Link></li>
              <li><Link href="#solutions" className="hover:text-white transition-colors">Industrial Arm Automation</Link></li>
              <li><Link href="#solutions" className="hover:text-white transition-colors">Custom UAV Aerial Platforms</Link></li>
              <li><Link href="#solutions" className="hover:text-white transition-colors">AI Machine Vision Systems</Link></li>
              <li><Link href="#solutions" className="hover:text-white transition-colors">B2B Hardware Procurement</Link></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">Resources</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><Link href="#learning-hub" className="hover:text-white transition-colors">Learning Hub & Blogs</Link></li>
              <li><Link href="#learning-hub" className="hover:text-white transition-colors">Robotics Workshops</Link></li>
              <li><Link href="#learning-hub" className="hover:text-white transition-colors">Circuit Schematics</Link></li>
              <li><Link href="#learning-hub" className="hover:text-white transition-colors">Careers at Dilay Robotics</Link></li>
              <li><Link href="#learning-hub" className="hover:text-white transition-colors">Customer Technical Support</Link></li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#FFC20E] mb-4">Company</h4>
            <ul className="space-y-2.5 text-slate-400 font-medium">
              <li><Link href="#why-prayog" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#why-prayog" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Refund Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GST Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs gap-4">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-white">PRAYOG INDIA</span> — By Dilay ROBOTICS. All Rights Reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Designed for Robotics & Tech Innovation</span>
            <span>Pan-India Fulfillment</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
