// src/components/layout/Footer.tsx
import React from 'react';
import { Cloud, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="w-8 h-8 text-blue-400" />
              <h3 className="text-2xl font-bold">HAZ</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Keeping communities safe through hazard awareness and preparedness education.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#hazards" className="text-gray-400 hover:text-white transition-colors">Hazards</a></li>
              <li><a href="#preparedness" className="text-gray-400 hover:text-white transition-colors">Preparedness</a></li>
              <li><a href="#alerts" className="text-gray-400 hover:text-white transition-colors">Alerts</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Emergency Kits</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Guides</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Weather Updates</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community Forum</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">info@haz.gov</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Emergency Services</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 HAZ - Hazard Awareness. All rights reserved. | Built for community safety.
          </p>
        </div>
      </div>
    </footer>
  );
}