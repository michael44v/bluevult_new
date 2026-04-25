import { useEffect, useState, useRef } from "react";
import { Users, DollarSign, Globe, Clock } from "lucide-react";

interface Stat {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const stats: Stat[] = [
  {
    icon: <Users className="w-6 h-6" />,
    value: 527000,
    suffix: "+",
    label: "Active Investors",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    value: 4.8,
    suffix: "B+",
    prefix: "$",
    label: "Assets Under Management",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    value: 156,
    suffix: "",
    label: "Countries Supported",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    value: 7,
    suffix: "",
    label: "Years in Market",
  },
];

const AnimatedCounter = ({
  value,
  suffix,
  prefix = "",
  duration = 2000,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toFixed(num % 1 === 0 ? 0 : 1);
  };

  return (
    <span ref={ref}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;