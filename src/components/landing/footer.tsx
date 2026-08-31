import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const footerLinks = {
  platform: [
    { name: "How it works", href: "#como-funciona" },
    { name: "Browse advisors", href: "/services" },
    { name: "FAQ", href: "/faq" },
  ],
  advisors: [
    { name: "Become an advisor", href: "/register" },
    { name: "Resources for advisors", href: "/resources" },
    { name: "Success stories", href: "/stories" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Terms of service", href: "/terms" },
    { name: "Privacy policy", href: "/privacy" },
    { name: "Cookie policy", href: "/cookies" },
    { name: "Cancellations and refunds", href: "/refunds" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--secondary)] text-white">
      <div className="container-meti py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-white/70 text-sm mb-4">
              Connect with expert professional advisors via video call.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>edwaramayadiaz@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Advisors</h4>
            <ul className="space-y-2">
              {footerLinks.advisors.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Meti. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/meti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link
              href="https://linkedin.com/company/meti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
