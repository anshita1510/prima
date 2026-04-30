import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import FloatingThemeToggle from "@/components/ui/FloatingThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PRIMA - Task & Project Management",
  description: "Comprehensive task and project management system with role-based access control",
  keywords: ["task management", "project management", "team collaboration", "productivity"],
  icons: {
    icon: '/prima-logo.svg',
    shortcut: '/prima-logo.svg',
  },
};

/**
 * Inline script injected into <head> — runs synchronously before any paint.
 * Reads localStorage and applies [data-theme] immediately, preventing flash.
 */
const noFlashScript = `
(function() {
  try {
    var saved = localStorage.getItem('PRIMA-theme');
    var theme = saved === 'light' || saved === 'dark'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* No-flash: must be first script in <head>, before any CSS paint */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
