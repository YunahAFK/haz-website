// src/pages/Home.tsx
import React from 'react';
import { HazardCard } from '../components/hazard/HazardCard';
import { Footer } from '../components/layout/Footer';
import { Cloud, CloudRain, Sun, Snowflake } from 'lucide-react';

const hazards = [
  {
    id: 'typhoon',
    title: 'Typhoon',
    image: 'https://images.unsplash.com/photo-1601110958456-0bee398ce406?...',
    description: 'Powerful tropical storms with strong winds and heavy rainfall that can cause significant damage.'
  },
  {
    id: 'flooding',
    title: 'Flooding',
    image: 'https://images.unsplash.com/photo-1657069343871-fd1476990d04?...',
    description: 'Water overflow that submerges normally dry land, often caused by heavy rainfall or dam failure.'
  },
  {
    id: 'volcanic',
    title: 'Volcanic Eruption',
    image: 'https://images.unsplash.com/photo-1623059570754-5462839e76a7?...',
    description: 'Explosive release of lava, ash, and gases from volcanic activity that can affect large areas.'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      <main className="relative">
        {/* Hero Section */}
        <section className="text-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
              HAZ
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              stay informed about natural hazards and protect your community with 
              comprehensive disaster information and preparedness resources.
            </p>
          </div>
        </section>

        {/* Hazards Section */}
        <section id="hazards" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Hazards</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hazards.map((hazard) => (
                <HazardCard
                  key={hazard.id}
                  title={hazard.title}
                  image={hazard.image}
                  description={hazard.description}
                  onClick={() => console.log(`Clicked on ${hazard.title}`)}
                />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
