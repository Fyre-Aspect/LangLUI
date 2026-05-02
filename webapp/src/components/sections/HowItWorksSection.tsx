import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp } from "@/components/ui/FadeUp";

const STEPS = [
  {
    number: "01",
    title: "Install Extension",
    description: "Add LangLua to Chrome in just one click.",
  },
  {
    number: "02",
    title: "Browse Normally",
    description: "Visit any article, news site, or social feed.",
  },
  {
    number: "03",
    title: "Words Become Your Classroom",
    description:
      "Highlighted words are now in your target language. Hover to translate and quiz yourself.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeUp delay={0}>
          <SectionLabel>How It Works</SectionLabel>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">
            Three Steps to Speaking the Web
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, idx) => (
            <FadeUp key={idx} delay={0.15 + idx * 0.05}>
              <div className="relative bg-white border border-slate-200 rounded-card shadow-card p-8 group hover:shadow-lg hover:border-slate-300 transition-all">
                {/* Decorative number background */}
                <div className="absolute top-6 right-6 text-5xl font-bold text-slate-100 opacity-50 group-hover:opacity-60 transition">
                  {step.number}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-4xl mb-4 font-bold text-primary-DEFAULT">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
