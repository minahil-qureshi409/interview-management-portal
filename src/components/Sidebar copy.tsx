// components/Sidebar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  UserCircle,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader,
  LucideIcon,
} from "lucide-react";
import { usePathname } from 'next/navigation';

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon; // Use the specific type for Lucide icons
}

export default function Sidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const pathname = usePathname();

  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-open");
    setOpen(stored === null ? true : stored === "true");
  }, []);

  useEffect(() => {
    if (open !== null) {
      localStorage.setItem("sidebar-open", String(open));
    }
  }, [open]);

  // Define menus for each role

 const hrMenus = [
  { name: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
  // { name: "Jobs", href: "/hr/jobs", icon: Briefcase },
  { name: "Interviews", href: "/hr/interviews", icon: CalendarCheck },
  { name: "Applications", href: "/hr/applications", icon: FileText },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Recruiters", href: "/hr/recruiters", icon: UserCircle },
  // { name: "Chat", href: "/hr/chat", icon: MessageCircle },
  // { name: "Questions Bank", href: "/hr/questions", icon: Folder },
  // { name: "Calendar", href: "/hr/calendar", icon: Calendar },
];


  const interviewerMenus = [
    { name: "My Interviews", href: "/interviewer/dashboard", icon: CalendarCheck },
  ];

  const candidateMenus = [
    { name: "My Application", href: "/candidate/status", icon: Users },
  ];
  
let menus: MenuItem[] = [];
  if (userRole === 'HR_MANAGER') {
    menus = hrMenus;
  } else if (userRole === 'INTERVIEWER') {
    menus = interviewerMenus;
  } else if (userRole === 'CANDIDATE') {
    menus = candidateMenus;
  }

  // Handle loading state
  if (status === "loading" || open === null) {
    return (
        <aside className={`transition-all duration-500 vh-100 border-r border-[#708993] flex items-center justify-center w-72`} style={{ backgroundColor: "#19183B" }}>
            <Loader className="animate-spin text-[#A1C2BD]" />
        </aside>
    );
  }

  // Handle unauthenticated state (e.g., on the sign-in page)
  if (status === "unauthenticated") {
    return null; // Don't show the sidebar if the user is not logged in
  }

  return (
    <div className="relative flex">
      <aside
        className={`vh-100 transition-all duration-300 border-r border-[#708993] flex flex-col ${open ? "w-72" : "w-20"}`}
        style={{ backgroundColor: "#19183B" }}
      >
        <div className="flex items-center justify-center py-5 border-b border-[#708993] h-20">
          {open ? (
            <Link href="/" className="flex items-baseline">
              <span className="text-[#A1C2BD] font-bold text-2xl">IM</span>
              <span className="ml-2 text-[#E7F2EF] text-xl">Portal</span>
            </Link>
          ) : (
            <Link href="/">
              <span className="text-[#A1C2BD] font-bold text-2xl">IM</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 mt-6">
          {menus.map((menu, idx) => (
            <Link key={idx} href={menu.href}
              className={`flex items-center gap-x-4 p-3 m-2 rounded-lg text-lg transition-colors duration-200 ${
                pathname === menu.href
                  ? "bg-[#A1C2BD] text-[#19183B]"
                  : "text-[#A1C2BD] hover:bg-[#2c2a5a]"
              }`}
            >
              <div className="min-w-[40px] flex justify-center">
                 <menu.icon size={24} />
              </div>
              {open && <span className="font-medium">{menu.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-[#708993]">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center gap-x-4 p-3 w-full rounded-lg text-[#A1C2BD] hover:bg-[#c93c3c] hover:text-white transition-colors duration-200"
          >
            <div className="min-w-[40px] flex justify-center">
                <LogOut size={24} />
            </div>
            {open && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-20 z-10 border rounded-full p-1.5 transition-transform duration-300 hover:scale-110"
        style={{ backgroundColor: "#A1C2BD", color: "#19183B" }}
      >
        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </div>
  );
}