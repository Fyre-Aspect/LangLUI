import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";

const PHASES = [
  {
    title: "MVP",
    badge: "Current",
    badgeVariant: "blue" as const,
    items: [
      "Word replacement on any page",
      "10 languages supported",
      "Hover tooltips with translation",
      "Quiz and Try Out mode",
      "Credits and streak gamification",
    ],
  },
  {
    title: "V1",
    badge: "Coming Soon",
    badgeVariant: "slate" as const,
    items: [
      "Saved vocabulary list",
      "Spaced repetition sessions",
      "Proficiency assessment quiz",
      "Dashboard with learning stats",
    ],
  },
  {
    title: "V2",
    badge: "Future",
    badgeVariant: "slate" as const,
    items: [
      "AI conversation practice",
      "Pronunciation feedback",
      "Social and friends streaks",
      "Mobile app companion",
    ],
  },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeUp delay={0}>
          <SectionLabel>Roadmap</SectionLabel>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">
            Where We are Headed
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-slate-200 -translate-y-1/2" />

          {PHASES.map((phase, idx) => (
            <FadeUp key={idx} delay={0.15 + idx * 0.1}>
              <div
                className={`relative bg-white border rounded-3xl shadow-card p-6 transition-all ${
                  phase.badgeVariant === "blue"
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-slate-200 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {phase.title}
                  </h3>
                  <Badge variant={phase.badgeVariant}>{phase.badge}</Badge>
                </div>

                {/* Items List */}
                <ul className="space-y-3">
                  {phase.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 font-bold ${
                          idx === 0
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        {idx === 0 ? "+" : "-"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
