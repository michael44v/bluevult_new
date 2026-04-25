import { Check, Star, Zap, Crown, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PricingPlan {
  name: string;
  icon: React.ReactNode;
  minInvestment: string;
  expectedROI: string;
  lockPeriod: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    icon: <Zap className="w-6 h-6" />,
    minInvestment: "$100",
    expectedROI: "8-12%",
    lockPeriod: "30 days",
    features: [
      "Access to top 10 cryptos",
      "Basic portfolio analytics",
      "Email support",
      "Weekly market reports",
      "Mobile app access",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Growth",
    icon: <Star className="w-6 h-6" />,
    minInvestment: "$1,000",
    expectedROI: "12-18%",
    lockPeriod: "90 days",
    features: [
      "Access to 50+ cryptos",
      "Advanced analytics dashboard",
      "Priority support",
      "Daily market insights",
      "Auto-rebalancing",
      "Tax reporting tools",
    ],
    popular: true,
    buttonText: "Start Growing",
  },
  {
    name: "Premium",
    icon: <Crown className="w-6 h-6" />,
    minInvestment: "$10,000",
    expectedROI: "18-24%",
    lockPeriod: "180 days",
    features: [
      "Access to 100+ cryptos",
      "AI-powered recommendations",
      "24/7 dedicated support",
      "Real-time alerts",
      "DeFi yield farming",
      "NFT portfolio tracking",
      "Exclusive research reports",
    ],
    buttonText: "Go Premium",
  },
  {
    name: "Enterprise",
    icon: <Building2 className="w-6 h-6" />,
    minInvestment: "$100,000+",
    expectedROI: "Custom",
    lockPeriod: "Flexible",
    features: [
      "Unlimited crypto access",
      "Dedicated account manager",
      "Custom investment strategies",
      "API access",
      "White-glove onboarding",
      "Institutional custody",
      "Custom reporting",
      "SLA guarantees",
    ],
    buttonText: "Contact Sales",
  },
];

const PricingSection = () => {
  return (
    <section id="plans" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Investment Plans</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="text-gradient">Investment Path</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From beginners to institutions, we have a plan that fits your investment goals.
            All plans include our core security features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary shadow-lg glow-primary ring-2 ring-primary/20"
                  : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div
                  className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>Starting from</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.minInvestment}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Expected ROI</p>
                    <p className="font-semibold text-chart-up">{plan.expectedROI}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Lock Period</p>
                    <p className="font-semibold">{plan.lockPeriod}</p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${plan.popular ? "glow-primary" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include bank-grade security, 2FA authentication, and insurance coverage.
          <a href="#" className="text-primary hover:underline ml-1">
            Compare all features →
          </a>
        </p>
      </div>
    </section>
  );
};

export default PricingSection;