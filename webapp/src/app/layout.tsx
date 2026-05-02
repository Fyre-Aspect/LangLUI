import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LangLua — Learn by Living the Web",
  description:
    "The Chrome extension that turns any webpage into a language lesson. Words become translations as you browse. Hover to quiz yourself.",
  openGraph: {
    title: "LangLua — Learn by Living the Web",
    description:
      "The Chrome extension that turns any webpage into a language lesson.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
