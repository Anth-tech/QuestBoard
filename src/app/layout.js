import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/navbar";
import { ProjectsProvider } from "@/context/projectContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ProjectsProvider>
          <NavBar />
          <main style={{ marginLeft: "250px", padding: "20px" }}>
            {children}
          </main>
        </ProjectsProvider>
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