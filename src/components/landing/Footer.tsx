import { TrendingUp, Twitter, Linkedin, Github, Youtube, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#plans" },
      { name: "Security", href: "#" },
      { name: "Mobile App", href: "#" },
      { name: "API", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact", href: "#" },
    ],
    Resources: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Market Research", href: "#" },
      { name: "Crypto Academy", href: "#" },
      { name: "Status", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Compliance", href: "#" },
      { name: "Licenses", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "GitHub", icon: Github, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold " style={{ color:"black"}}>
                Blue<span className="text-primary">Vult</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              The most trusted platform for cryptocurrency investment.
              Secure, simple, and built for growth.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 bg-background"
                />
                <Button size="sm" className="h-10 px-4">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2013 BlueVult. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Cryptocurrency investments are subject to market risks. Past performance is not indicative of future results.
            Please invest responsibly and only what you can afford to lose.  BluVult is licensed and regulated.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;