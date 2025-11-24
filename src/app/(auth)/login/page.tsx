"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggler";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useState } from "react";
import { useSlidingAlert } from "@/components/ui/SlidingAlert";
import AuthGuard from "@/lib/AuthGuard";

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const { showMessage } = useSlidingAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = await signIn(email, password);
    if (error) {
      showMessage({ type: "error", text: error });
    } else {
      showMessage({ type: "success", text: "Login successful!" });
      router.push("/home");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen h-full flex flex-col bg-background">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="flex flex-col items-center flex-grow justify-center">
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-primary">
            Hack Aware
          </h1>
          <Card
            className="w-full max-w-sm bg-card text-card-foreground"
            style={{ boxShadow: "var(--shadow-l)" }}
          >
            <CardHeader>
              <CardTitle className="text-lg">Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button variant="outline" className="w-full">
                Login with Google
              </Button>
              <CardAction className="flex justify-center w-full">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-light">
                    {"Don't have an account?"}
                    <Button
                      asChild
                      variant="link"
                      className="text-sm p-1 h-auto"
                    >
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </span>
                </div>
              </CardAction>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
