"use client";
import { Bell, Search, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();

  // Map route paths to page titles
  const titles: Record<string, string> = {
    "/hr/dashboard": "Dashboard",
    "/hr/jobs": "Jobs",
    "/hr/interviews": "Interviews",
    "/hr/candidates": "Candidates",
    "/hr/recruiters": "Recruiters",
    "/hr/chat": "Chat",
    "/hr/questions": "Questions Bank",
    "/hr/calendar": "Calendar",
  };

  // Default title if route not in list
  const pageTitle = titles[pathname] || "Projects";

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#19183B] border-b border-[#A1C2BD]">
      {/* Dynamic Title */}
      <h1 className="text-lg font-bold uppercase text-[#A1C2BD] tracking-wide">
        {pageTitle}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Bell className="w-6 h-5 text-[#A1C2BD] cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
            8
          </span>
        </div>

        {/* Logout Icon */}
        <LogOut
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="w-6 h-5 text-[#708993] cursor-pointer hover:text-[#19183B]"
        />

        {/* <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-12 border rounded-full p-1"
          style={{
            backgroundColor: "#A1C2BD",
            color: "#19183B",
          }}
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button> */}

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#A1C2BD] flex items-center justify-center text-[#19183B] font-semibold cursor-pointer">
          U
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white border border-[#A1C2BD] rounded-full px-2 py-2 pl-9 text-sm text-[#19183B] placeholder-[#708993] focus:outline-none focus:ring-2 focus:ring-[#A1C2BD] transition"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#708993]" />
        </div>
      </div>
    </header>
  );
}
