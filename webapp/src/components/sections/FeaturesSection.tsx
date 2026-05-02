import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { FadeUp } from "@/components/ui/FadeUp";

const FEATURES = [
  {
    number: "01",
    title: "Adaptive Learning",
    description:
      "The system reads your level and adjusts how many words to replace. Always in your growth zone.",
    badge: "Flagship",
    accentBorder: true,
  },
  {
    number: "02",
    title: "Save Words",
    description:
      "Bookmark any word you want to master. Review them later in spaced repetition sessions.",
  },
  {
    number: "03",
    title: "Try Out Mode",
    description:
      "Words stay in English with a dashed underline. You guess the translation before revealing it.",
  },
  {
    number: "04",
    title: "Streaks and Credits",
    description:
      "Earn credits for correct guesses. Maintain daily streaks. Language learning becomes a game.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeUp delay={0}>
          <SectionLabel>Features</SectionLabel>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">
            Everything You Need to Learn While You Browse
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, idx) => (
            <FadeUp key={idx} delay={0.15 + idx * 0.05}>
              <div
                className={`bg-white border rounded-3xl shadow-card p-6 group hover:shadow-lg hover:border-slate-300 transition-all ${
                  feature.accentBorder
                    ? "border-blue-200"
                    : "border-slate-200"
                }`}
              >
                <div className="text-sm font-bold text-primary-DEFAULT mb-3">
                  {feature.number}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-700 text-xs leading-relaxed mb-3">
                  {feature.description}
                </p>
                {feature.badge && (
                  <Badge variant={feature.accentBorder ? "blue" : "slate"}>
                    {feature.badge}
                  </Badge>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
