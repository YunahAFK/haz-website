// src/components/layout/Footer.tsx
import React from 'react';
import { Cloud, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <Cloud className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold">HAZ</h3>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>info@haz.gov</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>HAZ Office</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 pt-4 text-center text-xs text-gray-500">
          © 2025 HAZ - Hazard Awareness. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
