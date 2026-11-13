import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ProfileProvider from "@/components/ProfileProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Maintenance from "@/components/Maintenance";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

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
