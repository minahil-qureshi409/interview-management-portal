// app/layout.tsx

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
  
  // A list of routes that will use the simple, full-screen layout
  const simpleLayoutRoutes = ['/auth/signin', '/unauthorized'];
  const isSimpleLayout = simpleLayoutRoutes.includes(pathname);

  return (
    <html lang="en">
      {/* --- THIS IS THE FIX --- */}
      {/* We conditionally set the body's background color. */}
      {/* The sign-in page wants 'bg-gray-50', the main app wants 'bg-white'. */}
      <body className={`antialiased ${isSimpleLayout ? 'bg-gray-50' : 'bg-white'}`}>
         <Providers>
          {isSimpleLayout ? (
            // For simple routes, just render the page content directly.
            children
          ) : (
            // For main app routes, render the full layout with Sidebar, Header, etc.
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Sidebar />
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