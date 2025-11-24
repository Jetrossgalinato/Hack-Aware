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
import { useAuth } from "@/lib/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSlidingAlert } from "@/components/ui/SlidingAlert";

export default function RegisterPage() {
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const { showMessage } = useSlidingAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }
    const error = await signUp(email, password);
    if (error) {
      showMessage({ type: "error", text: error });
    } else {
      showMessage({ type: "success", text: "Registration successful!" });
      router.push("/");
    }
  };

  return (
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
            <CardTitle className="text-lg">Register for an account</CardTitle>
            <CardDescription>
              Enter your email below to register for an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
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
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                  </div>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button variant="outline" className="w-full">
              Register with Google
            </Button>
            <CardAction className="flex justify-center w-full">
              <div className="flex items-center gap-1">
                <span className="text-sm font-light">
                  {"Already have an account?"}
                  <Button asChild variant="link" className="text-sm p-1 h-auto">
                    <Link href="/">Login</Link>
                  </Button>
                </span>
              </div>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
