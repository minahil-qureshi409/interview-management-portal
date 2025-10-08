"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  UserCircle,
  MessageCircle,
  Folder,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState<boolean | null>(null); // null until loaded

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-open");
    setOpen(stored === null ? true : stored === "true"); // default: open
  }, []);

  // Save whenever state changes
  useEffect(() => {
    if (open !== null) {
      localStorage.setItem("sidebar-open", String(open));
    }
  }, [open]);

  if (open === null) return null; // prevent flicker

 const menus = [
  { name: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/hr/jobs", icon: Briefcase },
  { name: "Interviews", href: "/hr/interviews", icon: CalendarCheck },
  { name: "Applications", href: "/hr/applications", icon: FileText },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Recruiters", href: "/hr/recruiters", icon: UserCircle },
  // { name: "Chat", href: "/hr/chat", icon: MessageCircle },
  // { name: "Questions Bank", href: "/hr/questions", icon: Folder },
  // { name: "Calendar", href: "/hr/calendar", icon: Calendar },
];


  return (
    <div className="relative flex">
      {/* Sidebar */}
      <aside
        className={`vh-100 transition-all duration-50 border border-[#708993]  ${open ? "w-72" : "w-16"
          }`}
        style={{ backgroundColor: "#19183B" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-5 border-[#708993]">
          {open ? (
            <>
              <span className="text-[#A1C2BD] font-bold text-xl">IM</span>
              <span className="ml-2 text-[#E7F2EF] text-lg">Portal</span>
            </>
          ) : (
            <span className="text-[#A1C2BD] font-bold text-xl">IMP</span>
          )}
        </div>


        {/* Menu */}
        <nav className="mt-5">
          {menus.map((menu, idx) => (
            <Link
              key={idx}
              href={menu.href}
              className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors"
              style={{
                color: "#A1C2BD",
              }}
            >
              <menu.icon size={20} />
              {open && <span>{menu.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-12 border rounded-full p-1"
        style={{
          backgroundColor: "#A1C2BD",
          color: "#19183B",
        }}
      >
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
}
