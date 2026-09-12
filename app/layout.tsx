import type { Metadata } from "next";

import { PublicHeader } from "@/components/PublicHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisMin Creators Club",
  description: "Creator registration, onsite check-in, QR validation, and sample redemption for VisMin creator events."
};

export const preferredRegion = "hnd1";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PublicHeader />
        {children}
      </body>
    </html>
  );
}
