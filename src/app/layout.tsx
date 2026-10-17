import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { AppShell } from "@/components/AppShell";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased overflow-x-clip w-full max-w-full`}
    >
      <body className="min-h-screen flex flex-col font-sans overflow-x-clip w-full max-w-full">
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
