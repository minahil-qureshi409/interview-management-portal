"use client";
import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-900 text-white h-screen transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="p-2 w-full bg-gray-800 hover:bg-gray-700"
      >
        {open ? "" : "☰"}
      </button>

      <nav className="mt-4 space-y-2 px-2">
        <Link href="/hr/applicants" className="block py-2 px-3 rounded hover:bg-gray-700">
          Applicants
        </Link>
        <Link href="/hr/interviews" className="block py-2 px-3 rounded hover:bg-gray-700">
          Interviews
        </Link>
        <Link href="/hr/reports" className="block py-2 px-3 rounded hover:bg-gray-700">
          Reports
        </Link>
      </nav>
    </aside>
  );
}
