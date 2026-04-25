import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  quote: string;
  rating: number;
  profit: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Michael Chen",
    role: "Software Engineer",
    location: "San Francisco, USA",
    avatar: "",
    quote:
      "CryptoVault completely changed my approach to investing. The AI insights helped me identify opportunities I would have missed. My portfolio is up 156% in 8 months.",
    rating: 5,
    profit: "+156%",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Financial Analyst",
    location: "London, UK",
    avatar: "",
    quote:
      "As someone who works in finance, I'm impressed by the security measures and compliance standards. The institutional-grade infrastructure gives me confidence in my investments.",
    rating: 5,
    profit: "+89%",
  },
  {
    id: 3,
    name: "David Park",
    role: "Entrepreneur",
    location: "Seoul, South Korea",
    avatar: "",
    quote:
      "The Growth plan's auto-rebalancing feature is a game-changer. I set my strategy and let the platform optimize my holdings. Customer support is excellent too.",
    rating: 5,
    profit: "+234%",
  },
  {
    id: 4,
    name: "Emma Williams",
    role: "Marketing Director",
    location: "Sydney, Australia",
    avatar: "",
    quote:
      "Started with the Starter plan to learn, now I'm on Premium. The educational resources and market insights helped me go from beginner to confident investor.",
    rating: 5,
    profit: "+67%",
  },
  {
    id: 5,
    name: "Carlos Rodriguez",
    role: "Business Owner",
    location: "Miami, USA",
    avatar: "",
    quote:
      "Instant withdrawals and low fees mean more of my profits stay in my pocket. I've tried other platforms, but CryptoVault is by far the most user-friendly.",
    rating: 5,
    profit: "+112%",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  const nextTestimonials = () => {
    setCurrentIndex((prev) =>
      prev + testimonialsPerPage >= testimonials.length ? 0 : prev + testimonialsPerPage
    );
  };

  const prevTestimonials = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, testimonials.length - testimonialsPerPage)
        : Math.max(0, prev - testimonialsPerPage)
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + testimonialsPerPage
  );

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="text-gradient">500,000+ Investors</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied investors who have grown their wealth with CryptoVault.
            Read their success stories.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className="border-border/50 bg-card/50 backdrop-blur animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-primary/20 mb-4" />

                  {/* Quote Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-gold text-gold"
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-chart-up">
                        {testimonial.profit}
                      </p>
                      <p className="text-xs text-muted-foreground">Returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonials}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {Array.from({
                length: Math.ceil(testimonials.length / testimonialsPerPage),
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * testimonialsPerPage)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / testimonialsPerPage) === i
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonials}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 p-8 rounded-2xl bg-muted/30 border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">4.9/5</p>
              <p className="text-sm text-muted-foreground">App Store Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">15min</p>
              <p className="text-sm text-muted-foreground">Avg. Support Response</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">$0</p>
              <p className="text-sm text-muted-foreground">Hidden Fees</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;