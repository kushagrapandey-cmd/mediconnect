import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Medi-Connect</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ml-6 text-sm font-medium">
            <Link href="#security" className="transition-colors hover:text-primary text-muted-foreground">
              Security
            </Link>
            <Link href="#features" className="transition-colors hover:text-primary text-muted-foreground">
              Features
            </Link>
            <Link href="#research" className="transition-colors hover:text-primary text-muted-foreground">
              Research
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-primary text-muted-foreground">
              Dashboard
            </Link>
            <Link href="/admin" className="transition-colors hover:text-primary text-muted-foreground">
              Admin
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <ModeToggle />
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-4 h-9 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full px-4 h-9 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
