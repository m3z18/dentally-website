import type { NextConfig } from "next";

const doctorImageRemotePatterns: Array<{
  protocol: "https";
  hostname: string;
  port: string;
  pathname: string;
  search: string;
}> = [];

try {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (supabaseUrl.protocol === "https:") {
    doctorImageRemotePatterns.push({
      protocol: "https",
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: "/storage/v1/object/public/doctor-images/**",
      search: "",
    });
  }
} catch {
  // Builds without Supabase configuration simply have no remote doctor image origin.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: doctorImageRemotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
