import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/navbar/navbar";
import { Suspense } from "react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
            <NavBar/>
            <main style={{ marginLeft: "250px", padding: "20px" }}>
              {children}
            </main>
        </Suspense>
      </body>
    </html>
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuestBoard",
  description: "A project management service",
};