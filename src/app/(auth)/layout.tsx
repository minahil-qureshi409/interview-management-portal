// app/(auth)/layout.tsx

import { ReactNode } from "react";

// This layout is for authentication pages.
// It does NOT render <html> or <body>. It just provides a wrapper.
export default function AuthLayout({ children }: { children: ReactNode }) {
  // We return the children directly, without adding any extra structure.
  // The background color will be handled by the page itself.
  return <>{children}</>;
}