import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIET University KRA Portal | Key Result Area Management System",
  description: "Centralized institutional KRA management, bimonthly tracking, and accreditation monitoring platform for KIET Deemed to be University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
        {children}
      </body>
    </html>
  );
}
