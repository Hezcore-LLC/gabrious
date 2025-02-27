import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">Gabrious</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transform sermons into comprehensive study notes with AI-powered transcription and analysis.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Features</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/transcription" className="text-sm text-muted-foreground hover:text-foreground">
                Transcription
              </Link>
              <Link href="/study-notes" className="text-sm text-muted-foreground hover:text-foreground">
                Study Notes
              </Link>
              <Link href="/church-automation" className="text-sm text-muted-foreground hover:text-foreground">
                Church Automation
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Company</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Gabrious. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}