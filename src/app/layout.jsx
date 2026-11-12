import { Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MyMovieBox",
  description: "Watch trailers, discover and download movies.",
};

// Sets the theme class before paint to avoid a flash
const themeScript = `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${poppins.variable} font-sans m-0`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
