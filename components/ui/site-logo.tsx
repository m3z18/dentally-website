import Image from "next/image";
import Link from "next/link";
import dentallyLogoDark from "@/public/brand/dentally-logo-dark.png";
import type { Locale } from "@/lib/locale";

type SiteLogoProps = {
  size?: "sm" | "md" | "lg";
  locale?: Locale;
  priority?: boolean;
};

const sizeClasses = {
  sm: "h-14 w-[8.25rem]",
  md: "h-16 w-36",
  lg: "h-20 w-44",
};

const imageSizes = {
  sm: "132px",
  md: "144px",
  lg: "176px",
};

export function SiteLogo({ size = "md", locale = "ar", priority = false }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`group relative inline-block shrink-0 overflow-hidden rounded-sm ${sizeClasses[size]}`}
      aria-label={locale === "en" ? "Dentally Dental home" : "Dentally Dental - الرئيسية"}
    >
      <Image
        src="/brand/dentally-logo-transparent.png"
        alt={locale === "en" ? "Dentally Dental logo" : "شعار Dentally Dental"}
        fill
        sizes={imageSizes[size]}
        loading={priority ? "eager" : undefined}
        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.015] dark:hidden"
      />
      <Image
        src={dentallyLogoDark}
        alt={locale === "en" ? "Dentally Dental logo" : "شعار Dentally Dental"}
        fill
        sizes={imageSizes[size]}
        loading={priority ? "eager" : undefined}
        className="hidden object-cover object-center transition-transform duration-300 group-hover:scale-[1.015] dark:block"
      />
    </Link>
  );
}
