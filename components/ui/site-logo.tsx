import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = {
  size?: "sm" | "md" | "lg";
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

export function SiteLogo({ size = "md" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`group relative inline-block shrink-0 overflow-hidden rounded-sm ${sizeClasses[size]}`}
      aria-label="Dentally Dental - الرئيسية"
    >
      <Image
        src="/brand/dentally-logo-transparent.png"
        alt="شعار Dentally Dental"
        fill
        sizes={imageSizes[size]}
        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.015]"
      />
    </Link>
  );
}
