import React from 'react';
import { APP_CONFIG } from '../../constants/defaults';

export const HeroSection: React.FC = () => (
    <section className="text-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
                {APP_CONFIG.title}
            </h1>
        </div>
    </section>
);