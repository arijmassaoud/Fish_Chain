import React from 'react';
import { ScrollText, Shield, Lock, UserCheck, Fish, Anchor, Scale, Users, MapPin, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';

const Conditions = () => {
  const sections = [
    {
      title: "Terms of Use Fish Chain",
      icon: ScrollText,
      gradient: "from-blue-500 to-indigo-600",
      content: [
        "By using Fish Chain Tunisia, you agree to abide by our terms of use specific to the Tunisian fishing industry.",
        "You must provide accurate information regarding your fishing activities and vessel.",
        "Use of the platform must comply with Tunisian laws and current maritime regulations.",
        "We reserve the right to suspend an account in case of violation of our terms or fishing laws.",
        "Fishing zone location data is protected and cannot be shared without authorization."
      ]
    },
    {
      title: "Privacy Policy",
      icon: Shield,
      gradient: "from-green-500 to-emerald-600",
      content: [
        "Your personal data is protected according to GDPR standards and Tunisian data protection laws.",
        "We never sell your personal information or fishing data to third parties.",
        "The location data of your fishing zones remains your exclusive and confidential property.",
        "You may request the complete deletion of your data at any time via our support team.",
        "We respect the confidentiality of fishing spots shared within the Fish Chain community."
      ]
    },
    {
      title: "Marine Data Security",
      icon: Lock,
      gradient: "from-purple-500 to-pink-600",
      content: [
        "Bank-grade encryption for all communications and navigation data.",
        "Automatic and secure backup of your fishing logs and weather data.",
        "Two-factor authentication available to protect your professional account.",
        "Continuous threat monitoring and anti-hacking protection.",
        "Secure storage of GPS coordinates and sensitive navigation information."
      ]
    },
    {
      title: "Responsibilities at Sea",
      icon: UserCheck,
      gradient: "from-orange-500 to-red-600",
      content: [
        "Fish Chain provides decision-making tools to optimize your fishing trips.",
        "Navigation and fishing decisions remain entirely under your responsibility as captain.",
        "We do not guarantee fishing results – the sea remains unpredictable.",
        "Always respect Tunisian fishing regulations and current quotas.",
        "Always use required safety equipment according to maritime standards."
      ]
    },
    {
      title: "Tunisian Regulations",
      icon: Scale,
      gradient: "from-cyan-500 to-blue-600",
      content: [
        "Fish Chain respects and promotes Tunisian maritime fishing regulations.",
        "Users must hold the necessary licenses and authorizations for their activities.",
        "We collaborate with Tunisian maritime authorities for resource preservation.",
        "Compliance with protected areas and breeding seasons is mandatory.",
        "Automatic reporting of catches according to fishing authorities' requirements."
      ]
    },
    {
      title: "Community & Sharing",
      icon: Users,
      gradient: "from-indigo-500 to-purple-600",
      content: [
        "Fish Chain encourages responsible sharing of information among Tunisian fishermen.",
        "Mutual respect and support are the core values of our community.",
        "Shared information must be accurate and respect the confidentiality of private spots.",
        "Prohibition of sharing information that could harm the marine environment.",
        "Promotion of sustainable and ecosystem-friendly Mediterranean fishing practices."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <Fish className="absolute top-20 left-20 w-16 h-16 animate-float text-white" />
        <Anchor className="absolute top-60 right-32 w-12 h-12 animate-float text-white" style={{ animationDelay: '2s' }} />
        <Globe className="absolute bottom-40 left-1/4 w-14 h-14 animate-float text-white" style={{ animationDelay: '4s' }} />
        <Fish className="absolute bottom-60 right-20 w-10 h-10 animate-float text-white" style={{ animationDelay: '1s' }} />
      </div>
      <div className="pt-20">
        {/* Header */}
        <section className="py-20 text-white">
          <div className="container-section">
            <div className="text-center animate-fadeInUp">
              <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-lg font-medium mb-8 animate-pulse">
                <Shield className="w-6 h-6 mr-3 text-white" />
                Fish Chain Tunisia Terms & Privacy
              </div>
              <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-8 leading-tight">
                Transparency and security
                <span className="block text-transparent bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text animate-pulse">
                  at the heart of our commitment
                </span>
              </h1>
              <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                Discover our terms tailored to the Tunisian fishing industry 
                and our commitment to protecting your marine data
              </p>
            </div>
          </div>
        </section>
        {/* Content Sections */}
        <section className="py-20">
          <div className="container-section">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {sections.map((section, index) => (
                <Card 
                  key={index} 
                  className="group bg-white/10  text-white backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-700 hover:scale-105 animate-fadeInUp hover:bg-white/15"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center space-x-4 text-white">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                        <section.icon className="w-8 h-8 text-white group-hover:animate-pulse" />
                      </div>
                      <span className="font-playfair text-2xl xl:text-3xl font-bold group-hover:text-cyan-200 transition-colors duration-300">
                        {section.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-4 group-hover:translate-x-2 transition-transform duration-300" style={{transitionDelay: `${itemIndex * 0.1}s`}}>
                        <div className={`w-3 h-3 bg-gradient-to-br ${section.gradient} rounded-full mt-2 flex-shrink-0 animate-pulse`} />
                        <p className="text-white/90 leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
                          {item}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        {/* Legal Notice */}
        <section className="py-20">
          <div className="container-section">
            <Card className="bg-white/10 text-white backdrop-blur-md border border-white/20 animate-fadeInUp shadow-2xl hover:shadow-purple-500/25 transition-all duration-700">
              <CardContent className="p-12">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center space-x-3 mb-6">
                    <MapPin className="w-12 h-12 text-cyan-400 animate-bounce text-white" />
                    <h2 className="text-4xl font-playfair font-bold text-white">
                      Legal Notice Fish Chain Tunisia
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/90 text-lg">
                  <div className="space-y-4 animate-slideInLeft">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
                      <Fish className="w-6 h-6 mr-3 text-white" />
                      Publisher
                    </h3>
                    <p><strong>Fish Chain Tunisia SARL</strong></p>
                    <p>Port de La Goulette, Zone Industrielle</p>
                    <p>2060 Tunis, Tunisia</p>
                    <p>Business Registration: 123456789</p>
                    <p>VAT Number: TN123456789</p>
                    <p>Marine Fishing License: TN-MAR-2024-001</p>
                  </div>
                  <div className="space-y-4 animate-slideInRight">
                    <h3 className="text-2xl font-bold text-purple-300 mb-6 flex items-center">
                      <Globe className="w-6 h-6 mr-3 text-white" />
                      Contact
                    </h3>
                    <p>Email: contact@fishchain.tn</p>
                    <p>Phone: +216 70 123 456</p>
                    <p>Technical Support: support@fishchain.tn</p>
                    <p>Sea Emergencies: +216 71 234 567</p>
                    <p>Partnerships: partners@fishchain.tn</p>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/20 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <Anchor className="w-8 h-8 text-cyan-400 animate-spin text-white" style={{ animationDuration: '3s' }} />
                    <p className="text-white/70 text-lg">
                      Last update: {new Date().toLocaleDateString('en-US')}
                    </p>
                    <Fish className="w-8 h-8 text-blue-400 animate-bounce text-white" />
                  </div>
                  <p className="text-cyan-200 font-medium text-lg">
                    🇹🇳 Proudly developed in Tunisia for Tunisian fishermen 🇹🇳
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Conditions;