import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Activity className="mr-2 h-6 w-6" />
          Medi-Connect
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "The registration process seamlessly integrates with the ABDM framework, allowing secure digital identity creation in minutes."
            </p>
            <footer className="text-sm">National Health Authority Review</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 w-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
          </div>
          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardContent className="pt-6">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">Sign in</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
