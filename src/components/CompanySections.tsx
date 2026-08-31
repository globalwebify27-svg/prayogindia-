'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Building2, 
  Target, 
  Compass, 
  Award, 
  Users, 
  ShieldCheck, 
  Wrench, 
  Bot, 
  Plane, 
  Factory, 
  Lightbulb, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Briefcase, 
  CheckCircle2, 
  Upload, 
  Send,
  ArrowUpRight
} from 'lucide-react';

interface FullSectionsProps {
  onOpenB2BModal?: () => void;
}

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            About Prayog India Labs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Pioneering Pan-India STEM & Advanced Hardware Innovation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Prayog India is a premier technological enterprise delivering certified robotics, microcontrollers, UAV components, and turnkey STEM educational laboratories for institutions, researchers, and industrial makers.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00AEEF] text-white flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To empower every academic institution, engineering laboratory, and tech innovator across India with authentic, industrial-grade hardware tools and hands-on robotics skill ecosystems.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC20E] text-slate-900 flex items-center justify-center shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accelerate national STEM education and hardware R&D by providing 10,000+ verified components, rapid dispatch logistics, and expert technical support for next-generation drone and AI systems.
            </p>
          </div>
        </div>

        {/* Why Prayog India Grid */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 text-center">Why Institutions Choose Prayog India</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-8 h-8 text-[#00AEEF]" />
              <h4 className="text-sm font-bold text-slate-900">100% Genuine Certified</h4>
              <p className="text-xs text-slate-500">Directly sourced microcontrollers and sensors with full quality guarantee.</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Award className="w-8 h-8 text-[#FFC20E]" />
              <h4 className="text-sm font-bold text-slate-900">GST Invoice & Institutional Quotes</h4>
              <p className="text-xs text-slate-500">Custom B2B proforma invoicing with government & university compliance.</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Users className="w-8 h-8 text-[#00AEEF]" />
              <h4 className="text-sm font-bold text-slate-900">Dedicated Technical Support</h4>
              <p className="text-xs text-slate-500">In-house robotics engineers providing schematic and code troubleshooting.</p>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Building2 className="w-8 h-8 text-[#FFC20E]" />
              <h4 className="text-sm font-bold text-slate-900">500+ Labs Established</h4>
              <p className="text-xs text-slate-500">Turnkey laboratory setups active in premier Indian engineering colleges.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export const ServicesSection: React.FC<FullSectionsProps> = ({ onOpenB2BModal }) => {
  const servicesList = [
    {
      id: 'stem-lab',
      title: 'STEM Lab Setup',
      icon: Lightbulb,
      banner: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      description: 'End-to-end K-12 and university STEM tinkering labs complete with 3D printers, coding kits, and curriculum modules.',
      features: ['Curriculum-mapped DIY kits', 'Safety & workbench layout', 'Faculty training workshops'],
      apps: ['Schools & Colleges', 'ATL Labs', 'Robotics Clubs']
    },
    {
      id: 'robotics-lab',
      title: 'Robotics Lab Setup',
      icon: Bot,
      banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      description: 'Advanced industrial robotics labs featuring 6-axis manipulator arms, AGV mobile platforms, and ROS 2 simulation workstations.',
      features: ['Collaborative robot arms', 'SLAM LiDAR navigation rovers', 'ROS 2 Workstations'],
      apps: ['Mechatronics Departments', 'R&D Labs', 'Skill Development Centers']
    },
    {
      id: 'drone-lab',
      title: 'Drone Lab Setup',
      icon: Plane,
      banner: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
      description: 'Comprehensive UAV design & testing labs with flight simulation cages, telemetry stations, and DGCA compliant flight kits.',
      features: ['Quadcopter assembly bays', 'PID tuning & ground station', 'Safety flight netting'],
      apps: ['Aeronautical Engineering', 'Defense Research', 'Surveillance Training']
    },
    {
      id: 'industrial-projects',
      title: 'Industrial Projects & R&D',
      icon: Factory,
      banner: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      description: 'Custom prototype engineering, embedded system hardware design, and smart factory IoT automation solutions.',
      features: ['Custom PCB prototyping', 'Edge AI vision inspection', 'PLC & SCADA integration'],
      apps: ['Manufacturing Plants', 'Smart Agriculture', 'Healthcare Tech']
    },
    {
      id: 'consultancy',
      title: 'Technical Consultancy',
      icon: Wrench,
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      description: 'Expert engineering consulting for hardware component selection, BOM optimization, and academic lab accreditation.',
      features: ['BOM cost optimization', 'Component lifecycle analysis', 'Grant & lab proposal design'],
      apps: ['Tech Startups', 'Government Grants', 'Institutional Labs']
    }
  ];

  return (
    <section id="services" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            Services & Turnkey Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Specialized Hardware Services & Institutional Lab Design
          </h2>
          <p className="text-sm text-slate-600">
            Empowering institutions and enterprises with turnkey laboratories, technical consulting, and industrial prototype development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((srv) => {
            const IconComp = srv.icon;
            return (
              <div key={srv.id} className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="relative h-48 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={srv.banner} alt={srv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 text-[#00AEEF] shadow-md">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-extrabold text-slate-900">{srv.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[11px] font-bold text-slate-900 block">Key Features:</span>
                      <ul className="space-y-1">
                        {srv.features.map((feat, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00AEEF]" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                  <button 
                    onClick={onOpenB2BModal}
                    className="flex-1 bg-[#00AEEF] hover:bg-[#0096D6] text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Enquire Now <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <a 
                    href="https://wa.me/919876543210" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-[#25D366] text-white p-2.5 rounded-xl hover:bg-[#20ba5a] transition-colors flex items-center justify-center"
                    title="WhatsApp Enquiry"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <section id="contact" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-[#E0F7FC] text-[#00AEEF] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            Contact & Support
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Get in Touch with Prayog India Team
          </h2>
          <p className="text-sm text-slate-600">
            Have a technical query, order question, or institutional requirement? Our team responds within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Details Panel */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900">Direct Contact Desk</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin className="w-5 h-5 text-[#00AEEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Head Office & Lab Facility</h4>
                  <p className="text-slate-500 leading-relaxed">Prayog India Tech Hub, Plot 42, Electronics City Phase 1, Bengaluru, Karnataka - 560100</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-[#00AEEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Email Support</h4>
                  <p className="text-slate-500">support@prayogindia.com | sales@prayogindia.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 text-[#00AEEF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Phone & Helpline</h4>
                  <p className="text-slate-500">+91 (080) 4567 8900 / +91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">WhatsApp Business Desk</h4>
                  <p className="text-emerald-700">Instant Technical Support: +91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received Successfully</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out to Prayog India. Our technical desk will contact you via email/phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                <h3 className="text-xl font-extrabold text-slate-900">Send Us a Direct Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input required type="email" placeholder="john@domain.com" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input required type="text" placeholder="+91 98765 43210" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Inquiry Subject</label>
                    <select className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none text-slate-800">
                      <option>General Hardware Inquiry</option>
                      <option>Turnkey Lab Setup Quote</option>
                      <option>Order Tracking & Support</option>
                      <option>Careers & Internships</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">Your Message</label>
                  <textarea required rows={4} placeholder="Describe your requirement, components needed, or questions..." className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:outline-none"></textarea>
                </div>

                <button type="submit" className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-colors">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export const CareersSection: React.FC = () => {
  const [appliedJob, setAppliedJob] = useState<string | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const jobs = [
    {
      id: 'job-1',
      title: 'Senior Embedded Firmware Engineer',
      dept: 'Hardware Engineering',
      type: 'Full-time',
      loc: 'Bengaluru / Hybrid',
      desc: 'Lead RTOS firmware development for ESP32, STM32, and Raspberry Pi drone flight controller platforms.'
    },
    {
      id: 'job-2',
      title: 'Robotics & Mechatronics Specialist',
      dept: 'R&D Labs',
      type: 'Full-time',
      loc: 'Bengaluru',
      desc: 'Design turnkey manipulator arms, ROS 2 navigation packages, and test educational robotics kits.'
    },
    {
      id: 'job-3',
      title: 'Institutional Sales & B2B Procurement Lead',
      dept: 'Sales & Institutional',
      type: 'Full-time',
      loc: 'Pan-India / Remote',
      desc: 'Manage engineering college and school STEM lab procurement proposals and government portal tenders.'
    }
  ];

  return (
    <section id="careers" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="bg-[#FFC20E] text-slate-900 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            Careers at Prayog India
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Build the Future of Indian Robotics & Hardware Tech
          </h2>
          <p className="text-sm text-slate-600">
            Join our team of hardware engineers, educators, and robotics visionaries building India&apos;s leading STEM platform.
          </p>
        </div>

        {/* Job Listings Grid */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {jobs.map((j) => (
            <div key={j.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-[#00AEEF] transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">{j.dept}</span>
                  <span className="bg-[#E0F7FC] text-[#00AEEF] text-[10px] font-bold px-2.5 py-0.5 rounded-md">{j.type}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{j.title}</h3>
                <p className="text-xs text-slate-600">{j.desc}</p>
                <div className="text-[11px] font-semibold text-slate-400">Location: {j.loc}</div>
              </div>

              <button 
                onClick={() => setAppliedJob(j.title)}
                className="bg-[#00AEEF] hover:bg-[#0096D6] text-white px-5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>

        {/* Apply Modal Drawer */}
        {appliedJob && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div onClick={() => setAppliedJob(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
            
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900">Apply for Position</h3>
                <button onClick={() => setAppliedJob(null)} className="text-slate-400 hover:text-slate-800 text-sm font-bold">✕</button>
              </div>

              {applicationSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <h4 className="text-base font-bold text-slate-900">Application Submitted</h4>
                  <p className="text-xs text-slate-500">Our HR team will review your application for {appliedJob} and respond via email.</p>
                  <button onClick={() => { setAppliedJob(null); setApplicationSuccess(false); }} className="bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-full">Done</button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setApplicationSuccess(true); }} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Position</label>
                    <input type="text" readOnly value={appliedJob} className="w-full bg-slate-100 p-2.5 rounded-xl font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input required type="text" placeholder="Your Name" className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <input required type="email" placeholder="email@domain.com" className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Upload Resume (PDF)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#00AEEF]">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-500 block">Click to select PDF or Drag file here</span>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#00AEEF] hover:bg-[#0096D6] text-white py-3 rounded-xl font-bold shadow-sm">
                    Submit Application
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
