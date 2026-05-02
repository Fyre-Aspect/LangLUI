"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-sm bg-white/80 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="#" className="flex items-center gap-1">
          <span className="font-bold tracking-tight text-lg">
            <span className="text-slate-900">Lang</span>
            <span className="text-primary-DEFAULT">Lua</span>
          </span>
        </Link>

        {/* Nav Links + CTA */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#how-it-works"
              className="text-slate-700 hover:text-slate-900 transition font-medium"
            >
              How It Works
            </a>
            <a
              href="#demo"
              className="text-slate-700 hover:text-slate-900 transition font-medium"
            >
              Demo
            </a>
            <a
              href="#features"
              className="text-slate-700 hover:text-slate-900 transition font-medium"
            >
              Features
            </a>
          </div>

          <Button variant="primary" size="sm">
            Coming to Chrome Soon
          </Button>
        </div>
      </div>
    </nav>
  );
}
