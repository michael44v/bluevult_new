import {
  Shield,
  Wallet,
  HeadphonesIcon,
  Zap,
  Brain,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Bank-Grade Security",
    description:
      "Multi-layered security with cold storage, 2FA, biometric authentication, and $100M insurance coverage.",
  },
  {
    icon: <Wallet className="w-8 h-8" />,
    title: "Low Trading Fees",
    description:
      "Industry-leading 0.1% trading fees. Volume discounts available for high-frequency traders.",
  },
  {
    icon: <HeadphonesIcon className="w-8 h-8" />,
    title: "24/7 Expert Support",
    description:
      "Round-the-clock support from crypto experts via live chat, email, and phone.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Instant Withdrawals",
    description:
      "Withdraw your funds instantly. No waiting periods, no hidden fees, no hassle.",
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-Powered Insights",
    description:
      "Machine learning algorithms analyze market trends to provide actionable investment signals.",
  },
  {
    icon: <BadgeCheck className="w-8 h-8" />,
    title: "Fully Regulated",
    description:
      "Licensed and regulated in multiple jurisdictions. Full compliance with AML/KYC requirements.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Serious Investors</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine institutional-grade infrastructure with user-friendly design
            to give you the best crypto investing experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card/50 backdrop-blur group hover:shadow-lg hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Trust Badges */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading security auditors and compliance bodies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["SOC 2 Certified", "ISO 27001", "GDPR Compliant", "PCI DSS", "FCA Regulated"].map(
              (badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm font-medium"
                >
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {badge}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;