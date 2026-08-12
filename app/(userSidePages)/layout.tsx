import type { Metadata } from "next";

import Navbar from "./components/navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Medical Billing Services & RCM Solutions | Fast & Compliant",

  description:
    "Comprehensive medical billing, coding, and revenue cycle management (RCM) services designed to reduce claim denials, increase collections, and optimize practice efficiency.",

  keywords: [
    "medical billing services",
    "revenue cycle management",
    "RCM solutions",
    "medical coding",
    "claim denial management",
    "patient billing",
  ],

  openGraph: {
    title: "Medical Billing Services & Revenue Cycle Management",
    description:
      "Maximize practice revenue and decrease claim denials with our HIPAA-compliant medical billing and coding solutions.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}