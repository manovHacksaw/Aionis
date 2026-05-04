"use client";
import React from "react";
import {
  Mail,
  MessageCircle,
  Globe,
  Send,
} from "lucide-react";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.69.92.69 1.85V21c0 .27.16.58.67.48A10.014 10.014 0 0022 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import {
  FooterBackgroundGradient,
  TextHoverEffect,
} from "@/components/ui/hover-footer";

export function SiteFooter() {
  const footerLinks = [
    {
      title: "Protocol",
      links: [
        { label: "How it works", href: "#" },
        { label: "Solana stack", href: "#" },
        { label: "x402 payments", href: "#" },
        { label: "Whitepaper", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "GitHub", href: "#" },
        {
          label: "Status · Live",
          href: "#",
          pulse: true,
        },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Mail size={18} className="text-violet-400" />,
      text: "hello@autofi.xyz",
      href: "mailto:hello@autofi.xyz",
    },
    {
      icon: <MessageCircle size={18} className="text-violet-400" />,
      text: "discord.gg/autofi",
      href: "#",
    },
    {
      icon: <Globe size={18} className="text-violet-400" />,
      text: "autofi.xyz",
    },
  ];

  const socialLinks = [
    { icon: <XIcon size={20} />, label: "X (Twitter)", href: "#" },
    { icon: <GithubIcon size={20} />, label: "GitHub", href: "#" },
    { icon: <MessageCircle size={20} />, label: "Discord", href: "#" },
    { icon: <Send size={20} />, label: "Telegram", href: "#" },
    { icon: <Globe size={20} />, label: "Website", href: "#" },
  ];

  return (
    <footer className="relative m-8 h-fit overflow-hidden rounded-3xl bg-[#0F0F11]/95 text-zinc-400">
      <div className="relative z-40 mx-auto max-w-7xl p-14">
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-16">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-white">Aionis</span>
              <span className="text-xl text-violet-400">✦</span>
            </div>
            <p className="text-sm leading-relaxed">
              Autonomous economic agents on Solana. Agents that earn, spend, and grow capital 24/7.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-6 text-lg font-semibold text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="transition-colors hover:text-violet-400"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="absolute right-[-10px] top-0 h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-violet-400"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="transition-colors hover:text-violet-400">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-8 border-t border-white/10" />

        {/* Footer bottom */}
        <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
          {/* Social icons */}
          <div className="flex space-x-6 text-zinc-500">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition-colors hover:text-violet-400"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Aionis. Autonomous capital, on Solana.
          </p>
        </div>
      </div>

      {/* Giant hover-effect wordmark */}
      <div className="-mb-36 -mt-52 hidden h-[30rem] lg:flex">
        <TextHoverEffect text="Aionis" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default SiteFooter;
