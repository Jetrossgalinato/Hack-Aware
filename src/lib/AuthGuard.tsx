"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Unauthenticated: send to "/"
    if (!user && pathname !== "/") {
      router.push("/");
      return;
    }

    // Authenticated: send to "/home"
    if (user && pathname !== "/home") {
      router.push("/home");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button disabled size="sm">
          <Spinner />
          Checking authentication...
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
