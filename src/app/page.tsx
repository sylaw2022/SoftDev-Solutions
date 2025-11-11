import Link from 'next/link';
import RegistrationForm from '@/components/RegistrationForm';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                  Transform Your Business with
                  <span className="text-yellow-300"> Software Solutions</span>
                </h1>
                <p className="text-xl text-blue-50 mb-8 max-w-3xl mx-auto lg:mx-0">
                  We deliver embedded Linux firmware, device drivers, and AI model 
                  solutions that drive innovation and digital transformation for technology companies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/contact"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get Started Today
                  </Link>
                  <Link
                    href="/services"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View Our Services
                  </Link>
                </div>
              </div>
              
              {/* Name Card Image */}
              <div className="flex flex-col items-center lg:items-end">
                <div className="relative w-full max-w-md mb-4 transform hover:scale-105 transition-transform duration-300">
                  <div className="rounded-2xl shadow-3d-lg overflow-hidden border-4 border-white/20">
                    <img
                      src="/namecard.jpg"
                      alt="SoftDev Solutions - Virtual Name Card"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <a
                  href="/namecard.jpg"
                  download="SoftDev-Solutions-NameCard.jpg"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Virtual Name Card
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive software solutions tailored to meet your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Embedded Linux Firmware Development */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all transform hover:scale-105 card-3d border-2 border-blue-400/30">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m-2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Embedded Linux Firmware</h3>
              <p className="text-white/90 mb-4 text-sm">
                Custom embedded Linux firmware development for IoT devices, embedded systems, and industrial applications.
              </p>
              <Link href="/services#embedded-firmware" className="text-yellow-300 font-semibold hover:text-yellow-200 text-sm inline-flex items-center">
                Learn More →
              </Link>
            </div>

            {/* Device Driver Development */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all transform hover:scale-105 card-3d border-2 border-emerald-400/30">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Device Driver Development</h3>
              <p className="text-white/90 mb-4 text-sm">
                Linux and Windows device driver development for hardware interfaces, peripherals, and custom devices.
              </p>
              <Link href="/services#device-drivers" className="text-yellow-300 font-semibold hover:text-yellow-200 text-sm inline-flex items-center">
                Learn More →
              </Link>
            </div>

            {/* AI Model Design & Development */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all transform hover:scale-105 card-3d border-2 border-purple-400/30">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Model Design & Development</h3>
              <p className="text-white/90 mb-4 text-sm">
                AI/ML model design, development, training, optimization, and deployment services.
              </p>
              <Link href="/services#ai-models" className="text-yellow-300 font-semibold hover:text-yellow-200 text-sm inline-flex items-center">
                Learn More →
              </Link>
            </div>

            {/* FPGA Design & Development */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all transform hover:scale-105 card-3d border-2 border-orange-400/30">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">FPGA Design & Development</h3>
              <p className="text-white/90 mb-4 text-sm">
                FPGA/SoC design, implementation, verification, and optimization for high-performance computing and custom logic.
              </p>
              <Link href="/services#fpga-design" className="text-yellow-300 font-semibold hover:text-yellow-200 text-sm inline-flex items-center">
                Learn More →
              </Link>
            </div>

            {/* Communication System Consulting */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all transform hover:scale-105 card-3d border-2 border-indigo-400/30">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Communication Systems Consulting</h3>
              <p className="text-white/90 mb-4 text-sm">
                Wireless and wired communication system design, protocol development, and network architecture consulting.
              </p>
              <Link href="/services#communication-systems" className="text-yellow-300 font-semibold hover:text-yellow-200 text-sm inline-flex items-center">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SoftDev Solutions?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine technical skills with business acumen to deliver exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-3d-lg transform hover:scale-110 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Agile development methodology ensures rapid delivery without compromising quality.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-3d-lg transform hover:scale-110 transition-all">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                Rigorous testing and code review processes ensure reliable, bug-free software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RegistrationForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-cyan-50 mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss your project and create a custom solution that drives your business forward.
            </p>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}