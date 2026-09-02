export type Locale = "ar" | "en";
export const localeCookieName = "dentally-locale";

export function localized<T>(locale: Locale, arabic: T, english: T | null | undefined) {
  return locale === "en" && english ? english : arabic;
}

export const ui = {
  ar: { skip: "تجاوز إلى المحتوى", nav: "التنقل الرئيسي", home: "الرئيسية", services: "الخدمات", doctors: "الأطباء", articles: "المركز التوعوي", about: "عن دينتالي", faq: "الأسئلة الشائعة", contact: "تواصل معنا", booking: "احجز موعدك", openMenu: "فتح قائمة التنقل", closeMenu: "إغلاق قائمة التنقل", language: "English", appearance: "المظهر", light: "فاتح", dark: "داكن", system: "النظام", links: "روابط الموقع", contactInfo: "معلومات التواصل", rights: "جميع الحقوق محفوظة", clinic: "مجمع دينتالي لطب الأسنان", tagline: "رعاية متكاملة لصحة وجمال ابتسامتك في مجمع دينتالي لطب الأسنان.", phone: "الهاتف", email: "البريد الإلكتروني", location: "الموقع" },
  en: { skip: "Skip to content", nav: "Primary navigation", home: "Home", services: "Services", doctors: "Doctors", articles: "Patient Education", about: "About", faq: "FAQ", contact: "Contact", booking: "Book an appointment", openMenu: "Open navigation menu", closeMenu: "Close navigation menu", language: "العربية", appearance: "Appearance", light: "Light", dark: "Dark", system: "System", links: "Site links", contactInfo: "Contact information", rights: "All rights reserved", clinic: "Dentally Dental Complex", tagline: "Comprehensive dental care for a healthy, confident smile.", phone: "Phone", email: "Email", location: "Location" },
} as const;

export function publicNavigation(locale: Locale) { const t = ui[locale]; return [{ label: t.home, href: "/" }, { label: t.services, href: "/services" }, { label: t.doctors, href: "/doctors" }, { label: t.articles, href: "/articles" }, { label: t.about, href: "/about" }, { label: t.contact, href: "/contact" }]; }
