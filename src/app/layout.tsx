// import 'bootstrap/dist/css/bootstrap.min.css';
"use client"; 
import './globals.css';

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import Providers from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
   const pathname = usePathname();
  
  // A list of routes that should NOT have the main app layout (Sidebar/Header)
  const noLayoutRoutes = ['/auth/signin'];

  // Check if the current route is one of the no-layout routes
  const isNoLayoutRoute = noLayoutRoutes.includes(pathname);
  return (
    <html lang="en">
      <body className="antialiased bg-white">
         <Providers>
          {isNoLayoutRoute ? (
            // If it's a no-layout route (like sign-in), just render the page content directly
            children
          ) :(
        <SidebarProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 p-6">{children}</main>
              <Footer />
            </div>
          </div>
        </SidebarProvider>
          )}
        </Providers>
      </body>
    </html>
  );
}
