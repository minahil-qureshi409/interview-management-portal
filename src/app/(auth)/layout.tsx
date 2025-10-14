// app/(auth)/layout.tsx

import { ReactNode } from "react";

// This is a minimal layout for authentication pages.
// It has no sidebar, header, or extra padding.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}