import React from 'react';

// Walk-in kiosk layout — completely standalone, no main site header/footer
// This ensures the kiosk is full-screen and clean for in-store tablet use

export default function WalkInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
