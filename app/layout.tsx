import type { Metadata, Viewport } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { getLocale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/seo";

import "./globals.css";

export async function generateMetadata():Promise<Metadata>{const[locale,settings]=await Promise.all([getLocale(),getSiteSettings()]);const en=locale==="en";const title=en?(settings?.default_seo_title_en||settings?.organization_name_en||settings?.organization_name_ar||"Dentally Dental"):(settings?.default_seo_title_ar||settings?.organization_name_ar||"مجمع دينتالي لطب الأسنان");const description=en?(settings?.default_seo_description_en||settings?.default_seo_description_ar||undefined):(settings?.default_seo_description_ar||undefined);return{metadataBase:getSiteUrl(),title:{default:title,template:`%s | ${en?"Dentally Dental":"دينتالي"}`},description,openGraph:{type:"website",locale:en?"en_US":"ar_SA",siteName:en?"Dentally Dental":"دينتالي",title,description},twitter:{card:"summary_large_image",title,description}};}

export const viewport: Viewport = {
  themeColor: "#f8f7f2",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSettings()]);
  const organizationSchema = { "@context":"https://schema.org", "@type":"Dentist", name: locale === "en" ? settings?.organization_name_en || settings?.organization_name_ar || "Dentally Dental" : settings?.organization_name_ar || "Dentally Dental", url:getSiteUrl().toString(), ...(settings?.phone?{telephone:settings.phone}:{}), ...(settings?.email?{email:settings.email}:{}), ...(settings?.address_ar?{address:{"@type":"PostalAddress",streetAddress:locale==="en"?settings.address_en||settings.address_ar:settings.address_ar}}:{}), ...(settings?.latitude!==null&&settings?.latitude!==undefined&&settings?.longitude!==null&&settings?.longitude!==undefined?{geo:{"@type":"GeoCoordinates",latitude:settings.latitude,longitude:settings.longitude}}:{}) };
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('dentally-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.dataset.theme=t}catch(e){}})()` }} /></head>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteShell locale={locale} whatsapp={settings?.whatsapp ?? null} contact={{ phone: settings?.phone ?? null, email: settings?.email ?? null, addressAr: settings?.address_ar ?? null, addressEn: settings?.address_en ?? null }}>{children}</SiteShell>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationSchema).replace(/</g,"\\u003c")}} />
      </body>
    </html>
  );
}
