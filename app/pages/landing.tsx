'use client';

import React from 'react';
import Hero from '../components/Hero';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
      </main>
    </div>
  );
};

export default LandingPage;