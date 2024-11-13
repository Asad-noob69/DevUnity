"use client";

import "./globals.css";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/ReactFooter";
import { AuthProvider } from "./context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });

// Move metadata to a separate server component file since we're making layout client-side
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}