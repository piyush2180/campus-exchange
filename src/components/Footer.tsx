import { Footprints } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="container-page py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Footprints className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold tracking-tight">Campus Exchange</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Turn your daily movement into a portfolio. A playful take on investing, built for the
              next generation.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="mb-3 font-medium">Product</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Market</li>
                <li>Portfolio</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium">Company</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium">Legal</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Campus Exchange. All rights reserved.</p>
          <p>Simulated assets. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
