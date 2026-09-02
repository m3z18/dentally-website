import type { NextConfig } from "next";

const supabaseImageRemotePatterns: Array<{
  protocol: "https";
  hostname: string;
  port: string;
  pathname: string;
  search: string;
}> = [];

try {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (supabaseUrl.protocol === "https:") {
    supabaseImageRemotePatterns.push({
      protocol: "https",
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: "/storage/v1/object/public/doctor-images/**",
      search: "",
    });
    supabaseImageRemotePatterns.push({ protocol: "https", hostname: supabaseUrl.hostname, port: supabaseUrl.port, pathname: "/storage/v1/object/public/service-images/**", search: "" });
    supabaseImageRemotePatterns.push({ protocol: "https", hostname: supabaseUrl.hostname, port: supabaseUrl.port, pathname: "/storage/v1/object/public/site-content-images/**", search: "" });
    supabaseImageRemotePatterns.push({
      protocol: "https",
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: "/storage/v1/object/public/article-images/**",
      search: "",
    });
  }
} catch {
  // Builds without Supabase configuration simply have no remote content image origin.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageRemotePatterns,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
