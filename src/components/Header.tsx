import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">
        Interview Management Portal
      </h1>
      <nav className="flex space-x-4">
        <Link href="/" className="text-gray-600 hover:text-blue-600">
          Jobs
        </Link>
        <Link href="/hr" className="text-gray-600 hover:text-blue-600">
          HR Dashboard
        </Link>
      </nav>
    </header>
  );
}
