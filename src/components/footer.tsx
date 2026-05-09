import Link from "next/link";
import { Activity, Code2, MessageCircle, Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">Medi-Connect</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Securing India's Digital Health Future with a unified, interoperable, and privacy-first healthcare interface.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com/kushagrapandey-cmd/mediconnect" target="_blank" className="text-muted-foreground hover:text-foreground">
                <Code2 className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Briefcase className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#security" className="hover:text-foreground">Security & Privacy</Link></li>
              <li><Link href="#architecture" className="hover:text-foreground">Architecture</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Patient Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="https://uhi.abdm.gov.in/" target="_blank" className="hover:text-foreground">ABDM Documentation</Link></li>
              <li><Link href="https://nha.gov.in/" target="_blank" className="hover:text-foreground">NHA Guidelines</Link></li>
              <li><Link href="/api-docs" className="hover:text-foreground">API Reference</Link></li>
              <li><Link href="/research" className="hover:text-foreground">Research Paper</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/consent" className="hover:text-foreground">Consent Framework</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Medi-Connect. Open Source under MIT.</p>
        </div>
      </div>
    </footer>
  );
}
