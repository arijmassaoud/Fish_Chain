import React from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent } from '@/components/UI/card';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import bg from '../../../../public/design/groupers.jpg'
const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "contact@fishchain.com",
      action: "Send us a message"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+33 1 23 45 67 89",
      action: "Call us"
    },
    {
      icon: MapPin,
      title: "Address",
      details: "123 Port de Plaisance, 06000 Nice",
      action: "Visit us"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <div className="container-section">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Us
          </div>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6">
            Ready to sail toward
            <span className="block text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text">success?</span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Our team of experts is here to guide you through your digital transformation. 
            Contact us to discover how Fish Chain can revolutionize your business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="animate-slideInLeft">
            <h3 className="text-2xl font-bold text-white mb-8">
              Let's talk about your project
            </h3>
            
            <div className="space-y-6 mb-12">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index}
                  className="hover-lift bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{info.title}</h4>
                        <p className="text-white/80 mb-2">{info.details}</p>
                        <span className="text-sm text-yellow-200 font-medium hover:underline cursor-pointer">
                          {info.action}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Image */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-white/20 hover-lift">
              <Image
                src={bg}
                alt="Laptop on desk"
                width={209}
                height={300}
                className="w-full h-64 object-cover"
              />
           
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slideInRight">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Request Information
                </h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        First Name *
                      </label>
                      <Input 
                        placeholder="Your first name"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-yellow-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Last Name *
                      </label>
                      <Input 
                        placeholder="Your last name"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-yellow-200 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-yellow-200 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phone
                    </label>
                    <Input 
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-yellow-200 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Message *
                    </label>
                    <Textarea 
                      placeholder="Tell us about your project or needs..."
                      rows={5}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-yellow-200 transition-colors resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 text-lg rounded-xl hover-lift transition-all duration-300"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
                
                <p className="text-sm text-white/60 mt-4 text-center">
                  We will respond within one business day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;