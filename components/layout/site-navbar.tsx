"use client";

import { useState } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SiteLogo } from "@/components/ui/site-logo";
import { primaryNavigation } from "@/data/navigation";

const bookingCtaClasses =
  "min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgb(20_112_91/0.18)] transition-colors hover:bg-brand-dark";

export function SiteNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-background/90 backdrop-blur-xl">
      <Container>
        <nav
          className="flex min-h-20 items-center justify-between gap-6"
          aria-label="التنقل الرئيسي"
        >
          <SiteLogo size="sm" />

          <div className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-brand-soft/60 hover:text-brand-dark"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link href="/booking" className={`${bookingCtaClasses} inline-flex`}>
              احجز موعدك
            </Link>
          </div>

          <div className="relative lg:hidden">
            <button
              type="button"
              className="group grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-surface text-brand-dark transition-colors hover:border-brand/30 hover:bg-brand-soft/50"
              aria-label={isMenuOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="relative block h-4 w-5" aria-hidden="true">
                <span
                  className={`absolute start-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                    isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute start-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute start-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                    isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>

            <div
              id="mobile-navigation"
              hidden={!isMenuOpen}
              className="absolute end-0 top-[calc(100%+0.75rem)] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-soft"
            >
              <div className="flex flex-col">
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-brand-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/booking"
                className={`${bookingCtaClasses} mt-3 inline-flex w-full`}
                onClick={() => setIsMenuOpen(false)}
              >
                احجز موعدك
              </Link>
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
