import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-8 animate-float">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Grow Your <span className="text-gradient">Wealth?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join over 500,000 investors who trust CryptoVault with their crypto portfolios.
            Start with as little as $100 today.
          </p>

          {/* Email Signup Form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-background border-border/50"
            />
            <Button size="lg" className="h-12 px-8 glow-primary">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Trust Note */}
          <p className="text-sm text-muted-foreground">
            No credit card required • Free account • Cancel anytime
          </p>

          {/* App Store Badges */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 12.5c0-1.58-.79-2.96-2-3.79V4.5a.5.5 0 00-1 0v3.52a4.49 4.49 0 00-5 0V4.5a.5.5 0 00-1 0v4.21a4.5 4.5 0 102.5 8.09V19.5a.5.5 0 001 0v-2.7a4.49 4.49 0 005 0v2.7a.5.5 0 001 0v-2.7c1.21-.83 2-2.21 2-3.79z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] leading-none">Download on the</p>
                <p className="text-sm font-semibold leading-tight">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.635-8.635z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] leading-none">GET IT ON</p>
                <p className="text-sm font-semibold leading-tight">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;