import Link from 'next/link';

export default function Services() {
  const services = [
    {
      id: 'embedded-firmware',
      title: 'Embedded Linux Firmware Development',
      description: 'Custom embedded Linux firmware development for IoT devices, embedded systems, and industrial applications',
      features: [
        'Custom Linux Kernel Configuration',
        'Bootloader Development (U-Boot, GRUB)',
        'Root Filesystem Build (Buildroot, Yocto)',
        'Real-time System Integration',
        'Hardware-Specific Optimizations',
        'IoT Connectivity (WiFi, Bluetooth, LoRa)'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m-2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'device-drivers',
      title: 'Device Driver Development',
      description: 'Linux and Windows device driver development for hardware interfaces, peripherals, and custom devices',
      features: [
        'Linux Kernel Driver Development',
        'Windows WDF/WDM Drivers',
        'Character & Block Device Drivers',
        'Network Driver Development',
        'USB & PCI Device Drivers',
        'Hardware Abstraction Layer (HAL)'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      id: 'ai-models',
      title: 'AI Model Design & Development',
      description: 'AI/ML model design, development, training, optimization, and deployment services',
      features: [
        'Model Architecture Design',
        'Deep Learning (CNN, RNN, Transformer)',
        'Training & Fine-tuning',
        'Model Optimization & Quantization',
        'Edge AI Deployment',
        'Production ML Pipeline'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      id: 'fpga-design',
      title: 'FPGA Design & Development',
      description: 'FPGA/SoC design, implementation, verification, and optimization services',
      features: [
        'VHDL/Verilog Design',
        'FPGA Synthesis & Implementation',
        'High-Speed Interface Design',
        'DSP & Signal Processing',
        'Timing Closure & Optimization'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      color: 'orange'
    },
    {
      id: 'communication-systems',
      title: 'Communication Systems Consulting',
      description: 'Wireless and wired communication system design, protocol development, and network architecture consulting',
      features: [
        'Wireless Protocol Design (WiFi, Bluetooth, Zigbee)',
        'Network Architecture & Planning',
        'Signal Processing & Modulation',
        'Protocol Stack Implementation',
        'Network Security & Encryption'
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-20 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
                Our Software Services
              </h1>
              <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
                Specialized embedded systems, device driver, and AI solutions designed to accelerate your 
                technology innovation and product development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {services.map((service) => {
              const bgGradients = {
                blue: 'from-blue-50 to-indigo-100',
                green: 'from-green-50 to-emerald-100',
                purple: 'from-purple-50 to-pink-100',
                orange: 'from-orange-50 to-amber-100',
                red: 'from-red-50 to-rose-100',
                indigo: 'from-indigo-50 to-purple-100'
              };
              const borderColors = {
                blue: 'border-blue-200/50',
                green: 'border-green-200/50',
                purple: 'border-purple-200/50',
                orange: 'border-orange-200/50',
                red: 'border-red-200/50',
                indigo: 'border-indigo-200/50'
              };
              
              const gradient = bgGradients[service.color as keyof typeof bgGradients] || 'from-blue-50 to-indigo-100';
              const border = borderColors[service.color as keyof typeof borderColors] || 'border-blue-200/50';
              
              return (
              <div key={service.id} className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-3d-lg hover:shadow-3d-xl transition-all transform hover:scale-105 card-3d border-2 ${border} p-8`}>
                <div className={`w-16 h-16 ${getColorClasses(service.color)} rounded-lg flex items-center justify-center mb-6`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/contact"
                  className={`inline-block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    service.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    service.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                    service.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                    service.color === 'orange' ? 'bg-orange-600 text-white hover:bg-orange-700' :
                    service.color === 'red' ? 'bg-red-600 text-white hover:bg-red-700' :
                    'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Development Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven methodology that ensures successful project delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-3d-lg transform hover:scale-110 transition-all">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Discovery</h3>
              <p className="text-gray-600">
                We analyze your requirements and define project scope and objectives.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-3d-lg transform hover:scale-110 transition-all">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Design</h3>
              <p className="text-gray-600">
                We create detailed wireframes and design mockups for your approval.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-3d-lg transform hover:scale-110 transition-all">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Development</h3>
              <p className="text-gray-600">
                Our team builds your solution using agile methodology with regular updates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-3d-lg transform hover:scale-110 transition-all">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deployment</h3>
              <p className="text-gray-600">
                We deploy your solution and provide ongoing support and maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-purple-50 mb-8 max-w-2xl mx-auto">
              Contact us today for a free consultation and project estimate.
            </p>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block"
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
