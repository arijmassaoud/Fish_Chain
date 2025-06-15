import React from 'react';

import { Card, CardContent } from '@/components/UI/card';
import { Award, Target, Heart, Zap } from 'lucide-react';
import Image from 'next/image';
import bg from '../../../../public/design/herobg.jpg'
const About = () => {
  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Accurate data and reliable tools for informed decisions."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Cutting-edge technology serving traditional fishing."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Built by fishing enthusiasts, for fishing enthusiasts."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to quality and user satisfaction."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br text-white from-purple-900 via-indigo-800 to-blue-900">
      <div className="container-section">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-slideInLeft">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </div>
            
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6">
              Born from the passion for
              <span className="block text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text">the ocean and fishing</span>
            </h2>
            
            <div className="space-y-6 text-lg text-white/80 leading-relaxed">
              <p>
                Fish Chain was born from the vision of a group of professional fishermen and passionate developers 
                who identified the need for a modern solution to digitize and optimize fishing activities.
              </p>
              
              <p>
                After years of experience on the water and a deep understanding of the daily challenges faced by fishermen, 
                we created a platform that combines tradition and innovation to revolutionize the fishing industry.
              </p>
              
              <p>
                Today, we are proud to serve a growing community of fishermen who trust Fish Chain to turn their passion into success.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text mb-2">5+</div>
                <div className="text-white/80">Years of experience</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text mb-2">50+</div>
                <div className="text-white/80">Partner ports</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image and Values */}
          <div className="animate-slideInRight">
            {/* Professional Image */}
            <div className="relative mb-12">
              <div className="overflow-hidden rounded-3xl border-4 border-white/20 hover-lift">
                <Image
                  src={bg}
                  width={800}
                  height={600}
                  alt="Boats in harbor"
                  className="w-full h-80 object-cover"
                />
             
              </div>
              
              {/* Floating element */}
              <div className="absolute -bottom-6 -left-6 bg-primary backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl animate-float">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white ">500+</div>
                  <div className="text-sm text-white/80">Active users</div>
                </div>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-6">
              {values.map((value, index) => (
                <Card 
                  key={index}
                  className="hover-lift bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-white leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;