import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ProfileProvider from "@/components/ProfileProvider";
import Nav from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="page flex flex-col gap-4 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg font-bold text-brand">nufy</p>
        <p className="max-w-xl">
          Full-length films come from the Internet Archive&apos;s public-domain collections. Metadata and trailers by{" "}
          <a className="underline" href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>; streaming availability by JustWatch.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <Link href="/free" className="font-medium text-ink underline">Free library</Link>
      </div>
    </footer>
  );
}

function Maintenance() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-extrabold">Back in a moment</h1>
        <p className="mt-3 text-muted">Nufy is being updated. Everything will be back shortly, and your list and progress are safe.</p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-muted underline">Staff sign in</Link>
      </div>
    </main>
  );
}

export const metadata = {
  title: { default: "Nufy Movies", template: "%s · Nufy Movies" },
  description: "Watch free full-length films, download them, and never miss a trailer. Picked for your age.",
};

// Sets the theme class before paint to avoid a flash
const themeScript = `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}`;

export default async function RootLayout({ children }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const path = headers().get("x-pathname") || "/";
  const inAdmin = path.startsWith("/admin");
  const blocked = settings.maintenance && !user?.isAdmin && path !== "/signin";
  const incomplete = user && !user.isAdmin && !user.profileComplete && path !== "/account";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} min-h-screen`}>
        <ThemeProvider>
          <ProfileProvider signedIn={Boolean(user)}>
            <Nav user={user ? { username: user.username, isAdmin: user.isAdmin } : null} />
            {!inAdmin && settings.announcement && !blocked && (
              <div className="bg-brand text-brand-ink px-4 py-2 pt-[4.6rem] text-center text-sm font-medium md:pt-[4.6rem]">{settings.announcement}</div>
            )}
            {incomplete && !blocked && (
              <div className="border-b border-line bg-surface2 px-4 py-2 pt-[4.6rem] text-center text-sm">
                Add your username and age to finish setting up.{" "}
                <Link href="/account" className="font-semibold text-brand underline">Complete profile</Link>
              </div>
            )}
            {blocked ? <Maintenance /> : children}
            {!inAdmin && !blocked && <Footer />}
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
