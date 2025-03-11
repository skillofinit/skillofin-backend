import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Skillofin",
  description: "Skillofin is best paltform to communicate with talented persons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
