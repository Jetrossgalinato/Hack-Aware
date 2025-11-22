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

export default function RegisterPage() {
  return (
    <div className="min-h-screen h-full flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="flex justify-center items-center flex-grow">
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
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                  </div>
                  <Input id="confirm-password" type="password" required />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full mb-2">
              Register
            </Button>
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
