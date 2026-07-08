import { Instagram, Facebook, Linkedin, MessageCircle, ArrowUp } from "lucide-react";
import { Flogo } from "./Flogo";
import { Link } from "@tanstack/react-router";
import { useCmsPages, useSiteSettings } from "@/hooks/usePublicContent";
import type { ApiCmsPage } from "@/api/types/public";

const CMS_LEGAL_ROUTES: Record<string, string> = {
  "privacy-policy": "/privacy",
  "terms-conditions": "/terms",
};

const LEGAL_SLUGS = ["privacy-policy", "terms-conditions", "refund-policy"];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: cmsPages } = useCmsPages();

  const pages = [
    { label: "Home", to: "/" },
    { label: "Pricing", to: "/#pricing" },
    { label: "Contact", to: "/#contact" },
    { label: "Login", to: "/login" },
  ];

  const legalPages: ApiCmsPage[] =
    cmsPages?.filter((p) => LEGAL_SLUGS.includes(p.slug)) ?? [];

  const fallbackLegal = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  const siteName = settings?.website_name || "Zoventro";
  const tagline =
    settings?.tagline ||
    "Corporate & Event Engagement\nGaming Platform";
  const phone = settings?.contact_number || "+91 9112340092";
  const email = settings?.support_email || "support@zoventro.com";

  const socialLinks = [
    { url: settings?.instagram_url, Icon: Instagram, label: "Instagram" },
    {
      url: settings?.whatsapp_number
        ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`
        : undefined,
      Icon: MessageCircle,
      label: "WhatsApp",
    },
    { url: settings?.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: settings?.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
  ].filter((item) => item.url);

  return (
    <footer id="contact" className="bg-card mt-16">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Flogo />
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-primary mb-3">PAGES</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              {pages.map((item) => (
                <li key={item.label}>
                  {item.to.startsWith("/") && !item.to.includes("#") ? (
                    <Link to={item.to as "/"} className="hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.to} className="hover:text-primary transition-colors">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-primary mb-3">LEGAL</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              {(legalPages.length > 0 ? legalPages : null)?.map((item) => {
                const route = CMS_LEGAL_ROUTES[item.slug];
                return (
                  <li key={item.slug}>
                    {route ? (
                      <Link to={route as "/privacy" | "/terms"} className="hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="text-foreground/80">{item.title}</span>
                    )}
                  </li>
                );
              }) ??
                fallbackLegal.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to as "/privacy" | "/terms"} className="hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-primary mb-3">CONTACT</h4>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>{phone}</li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-primary mb-3">FOLLOW US</h4>
            <div className="flex gap-2">
              {socialLinks.length > 0 ? (
                socialLinks.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))
              ) : (
                [Instagram, MessageCircle, Facebook, Linkedin].map((Icon, i) => (
                  <span
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/40"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {siteName}. All Rights Reserved
          </span>
          <span className="max-w-md text-center">
            {siteName} is a digital team engagement platform. All activities are organized and
            managed by the designated HR contact or event organizer of the respective organization.
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
