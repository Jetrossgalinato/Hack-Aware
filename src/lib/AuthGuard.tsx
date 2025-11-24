"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/"); // Redirect to login page if not authenticated
      } else if (pathname.startsWith("/auth")) {
        router.push("/home"); // Redirect authenticated users away from auth pages
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return <>{children}</>;
}
