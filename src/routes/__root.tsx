import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Campus Exchange — Turn Your Steps Into Investments" },
      {
        name: "description",
        content:
          "Walk. Earn. Invest. Campus Exchange converts your daily steps into coins you can invest in a simulated market.",
      },
      { property: "og:title", content: "Campus Exchange — Turn Your Steps Into Investments" },
      {
        property: "og:description",
        content: "Walk. Earn. Invest. Build a portfolio with every step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Campus Exchange — Turn Your Steps Into Investments" },
      { name: "description", content: "Turn your steps into investments with Coin Walk, a modern web app for earning virtual coins and trading them in a simulated stock market." },
      { property: "og:description", content: "Turn your steps into investments with Coin Walk, a modern web app for earning virtual coins and trading them in a simulated stock market." },
      { name: "twitter:description", content: "Turn your steps into investments with Coin Walk, a modern web app for earning virtual coins and trading them in a simulated stock market." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6b936d7f-9cf4-444c-9ec3-7ef16fb3a424/id-preview-f97bf261--431ab2f2-83bf-4a86-b967-61f628eb9183.lovable.app-1776624378586.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6b936d7f-9cf4-444c-9ec3-7ef16fb3a424/id-preview-f97bf261--431ab2f2-83bf-4a86-b967-61f628eb9183.lovable.app-1776624378586.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}
