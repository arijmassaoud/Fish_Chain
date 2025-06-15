import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Fish, Anchor, Waves } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { name: 'Accueil', href: '#home' },
    { name: 'Fonctionnalités', href: '#features' },
    { name: 'À propos', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const resources = [
    { name: 'Documentation', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'FAQ', href: '#' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <Fish className="absolute top-10 left-10 w-8 h-8 animate-float" />
        <Anchor className="absolute top-20 right-20 w-6 h-6 animate-float" style={{ animationDelay: '2s' }} />
        <Waves className="absolute bottom-40 left-1/4 w-10 h-10 animate-float" style={{ animationDelay: '4s' }} />
        <Fish className="absolute bottom-20 right-1/3 w-7 h-7 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Animated Wave Pattern */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-pulse"></div>

      <div className="container-section py-16 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <Fish className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
              </div>
              <span className="font-playfair text-3xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Fish Chain
              </span>
            </div>
            
            <p className="text-white/90 leading-relaxed mb-8 text-lg">
              La plateforme révolutionnaire qui transforme la gestion de votre activité de pêche 
              avec des outils intelligents et une technologie de pointe made in Tunisia.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="group w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/25"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white/80 group-hover:text-white group-hover:animate-pulse" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-playfair font-bold text-white text-2xl mb-8 relative">
              Liens Rapides
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-5">
              {quickLinks.map((link, index) => (
                <li key={index} className="transform hover:translate-x-2 transition-transform duration-300">
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-cyan-300 transition-all duration-300 hover:underline text-lg font-medium group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-400 rounded-full transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-playfair font-bold text-white text-2xl mb-8 relative">
              Ressources
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
            </h3>
            <ul className="space-y-5">
              {resources.map((resource, index) => (
                <li key={index} className="transform hover:translate-x-2 transition-transform duration-300">
                  <a
                    href={resource.href}
                    className="text-white/80 hover:text-purple-300 transition-all duration-300 hover:underline text-lg font-medium group flex items-center"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 rounded-full transition-all duration-300 mr-0 group-hover:mr-3"></span>
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <h3 className="font-playfair font-bold text-white text-2xl mb-8 relative">
              Contact
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
            </h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 text-lg group-hover:text-green-300 transition-colors">contact@fishchain.tn</span>
              </div>
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 text-lg group-hover:text-blue-300 transition-colors">+216 70 123 456</span>
              </div>
              <div className="flex items-start space-x-4 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mt-1">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/90 text-lg group-hover:text-pink-300 transition-colors">
                  Port de La Goulette<br />
                  2060 Tunis, Tunisia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-16 pt-12 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-white/70 text-lg">
              © 2024 Fish Chain Tunisia. Tous droits réservés.
            </div>
            <div className="flex space-x-8 text-lg">
              <a href="/conditions" className="text-white/70 hover:text-cyan-300 transition-all duration-300 hover:underline hover:scale-105">
                Politique de confidentialité
              </a>
              <a href="/conditions" className="text-white/70 hover:text-purple-300 transition-all duration-300 hover:underline hover:scale-105">
                Conditions d&apos;utilisation
              </a>
              <a href="/Condtions" className="text-white/70 hover:text-pink-300 transition-all duration-300 hover:underline hover:scale-105">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
