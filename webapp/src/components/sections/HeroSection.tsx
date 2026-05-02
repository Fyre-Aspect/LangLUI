"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";

export function HeroSection() {
  const scrollToDemo = () => {
    const demoSection = document.getElementById("demo");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto text-center w-full">
        {/* Badge */}
        <FadeUp delay={0}>
          <div className="mb-6 flex justify-center">
            <Badge>Chrome Extension</Badge>
          </div>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.1}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900">
            <span>Learn by</span>
            <br />
            <span>Living the</span>
            <br />
            <span className="text-primary-DEFAULT">Web</span>
          </h1>
        </FadeUp>

        {/* Tagline */}
        <FadeUp delay={0.2}>
          <p className="text-lg text-slate-700 mb-8 max-w-xl mx-auto leading-relaxed">
            Words on any webpage become your language classroom. Hover to see
            translations, quiz yourself, and build vocabulary naturally.
          </p>
        </FadeUp>

        {/* CTA Buttons */}
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Coming to Chrome Soon
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={scrollToDemo}
              className="flex items-center justify-center gap-2"
            >
              See Demo
            </Button>
          </div>
        </FadeUp>

        {/* Video Placeholder */}
        <FadeUp delay={0.5}>
          <div className="bg-slate-50 rounded-2xl aspect-video w-full max-w-2xl mx-auto flex items-center justify-center border border-slate-300 hover:border-slate-400 transition">
            <div className="text-center">
              <div className="text-5xl mb-3 text-slate-400">PLAY</div>
              <p className="text-slate-600 text-sm font-medium">
                Demo video coming soon
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
