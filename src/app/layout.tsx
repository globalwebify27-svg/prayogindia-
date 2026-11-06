import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Prayog India | Mechatronics, Robotics & STEM Hardware Store",
    template: "%s | Prayog India",
  },
  description:
    "Official online store for robotics kits, microcontrollers, Arduino, Raspberry Pi, drone components, STEM educational kits, and electronic sensors with Pan-India dispatch.",
  icons: {
    icon: "/images/prayog-logo.png",
    shortcut: "/images/prayog-logo.png",
    apple: "/images/prayog-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased overflow-x-clip w-full max-w-full"
    >
      <body className="min-h-screen flex flex-col font-sans overflow-x-clip w-full max-w-full">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
