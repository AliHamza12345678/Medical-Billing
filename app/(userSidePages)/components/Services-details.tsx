import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ServicesDetail() {
  const departments = [
    'CLAIM SUBMISSION',
    'DENIAL MANAGEMENT',
    'PATIENT BILLING',
    'REVENUE CYCLE MANAGEMENT',
    'MEDICAL CODING',
    'CREDENTIALING',
  ];

  const pricingList = [
    { name: 'STARTER (CLAIM AUDIT)', price: '$199 / MO' },
    { name: 'FULL BILLING SERVICE', price: '4% – 7% NET' },
    { name: 'DENIAL RECOVERY', price: '15% RECOVERED' },
    { name: 'CODING CONSULTATION', price: '$85 / HR' },
  ];

  return (
    <section className="bg-white py-10 px-4 md:px-8 max-w-7xl mx-auto text-gray-700 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Hero Image */}
          <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden shadow-sm">
            <Image
              src="/detail1.png"
              alt="Medical billing specialist analyzing claims and revenue reports"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Heading & Intro Description */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Medical Billing & RCM Services
            </h1>
            <p className="text-sm leading-relaxed text-gray-500">
              Streamline your practice&apos;s financial performance with our end-to-end medical billing solutions. 
              We handle complex insurance claims, reduce denial rates, and ensure faster reimbursements 
              so your clinical team can focus entirely on delivering exceptional patient care.
            </p>
          </div>

          {/* Highlight Callout Box */}
          <div className="bg-[#e6fbf9] border-l-0 p-6 sm:p-8 rounded-2xl text-center">
            <p className="text-sm sm:text-base font-bold text-gray-800 leading-relaxed max-w-2xl mx-auto">
              Maximized Revenue, Reduced Administrative Burden. Our certified coders and billing specialists 
              achieve a 98% clean claims rate, ensuring your practice gets paid faster with minimal delay.
            </p>
          </div>

          {/* Our Services Include */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Our Billing Solutions Include:
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We offer comprehensive revenue cycle management tailored to medical practices, specialty clinics, 
              and healthcare systems of all sizes.
            </p>
            <ul className="space-y-2.5 pt-1 text-sm font-semibold text-gray-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>End-to-End Electronic Claim Submission & Real-time Tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>Accurate ICD-10, CPT, and HCPCS Coding Verification</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>Patient Invoicing, Statement Generation & Transparent Statements</span>
              </li>
            </ul>
          </div>

          {/* Why Choose Our Services Team */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Why Partner With Our Medical Billing Team?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Managing in-house billing often leads to costly coding errors, delayed payouts, and high overhead costs. 
              Our dedicated billing professionals keep your revenue cycle predictable and compliant.
            </p>
            <ul className="space-y-2.5 pt-1 text-sm font-semibold text-gray-700">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>HIPAA-Compliant Workflows & Enterprise Security Standards</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>Proactive Denial Management & Rapid Appeals Handling</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#00bba7] flex-shrink-0" />
                <span>Transparent Monthly Financial Analytics & Custom Reporting</span>
              </li>
            </ul>
          </div>

          {/* Our Approach To Cardiology Health -> Revenue Cycle Approach */}
          <div className="space-y-6 pt-2">
            <h2 className="text-xl font-bold text-gray-900">
              Our Revenue Cycle Management Approach
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              From initial patient intake and insurance verification to final payment collection, we optimize every stage 
              of your billing workflow to eliminate bottlenecks and increase practice collections.
            </p>

            {/* Pricing List & Billing Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <div className="space-y-6">
                {pricingList.map((item, index) => (
                  <div key={index} className="flex items-baseline justify-between text-xs font-bold tracking-wider">
                    <span className="text-gray-800 uppercase">{item.name}</span>
                    <span className="flex-1 border-b border-dotted border-gray-400 mx-2"></span>
                    <span className="text-gray-800">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="relative w-full h-56 rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src="/detail2.png"
                  alt="Medical biller reviewing financial reports"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Support Hours */}
          <div className="bg-[#f2fcfb] p-6 sm:p-7 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-gray-900">
              Billing Support Hours
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We Strive To Make Medical Billing & Practice Management Hassle-Free For You
            </p>
            <div className="space-y-3 text-xs text-gray-600 font-medium pt-1">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-bold text-gray-800">8AM - 8PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-bold text-gray-800">9AM - 4PM EST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-bold text-gray-800">Closed</span>
              </div>
            </div>

            <button className="w-full bg-[#00bba7] hover:bg-[#00a392] transition-colors text-white text-xs font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 mt-4 shadow-sm">
              <span>CALL +1 (123) 456–7890</span>
              <span className="bg-white text-[#00bba7] rounded-full p-1 flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          </div>

          {/* Card 2: Billing Specialties / Departments */}
          <div className="bg-[#f2fcfb] p-6 sm:p-7 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Billing Services
            </h3>
            <div className="space-y-3">
              {departments.map((dept, index) => (
                <button
                  key={index}
                  className="w-full bg-[#00bba7] hover:bg-[#00a392] transition-colors text-white text-xs font-bold py-3 px-5 rounded-full flex items-center justify-between shadow-sm"
                >
                  <span className="tracking-wider">{dept}</span>
                  <span className="bg-white text-[#00bba7] rounded-full p-1 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Promo / Consultation CTA Card */}
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="relative w-full h-48">
              <Image
                src="/detail2.png"
                alt="Free billing audit specialist"
                fill
                className="object-cover"
              />
            </div>
            <div className="bg-[#00bba7] p-6 text-center space-y-4">
              <h4 className="text-white text-lg font-bold leading-tight max-w-[200px] mx-auto">
                Trust Your Practice Revenue To The Experts
              </h4>
              <button className="bg-white text-[#00bba7] text-xs font-bold py-2.5 px-5 rounded-full inline-flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span>FREE AUDIT</span>
                <span className="bg-[#00bba7] text-white rounded-full p-1 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}