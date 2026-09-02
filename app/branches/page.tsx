import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getPublicBranches } from "@/lib/catalog";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "الفروع | Dentally", description: "بيانات فروع Dentally المنشورة." };

export default async function BranchesPage() {
  const [locale, branches] = await Promise.all([getLocale(), getPublicBranches()]);
  const en = locale === "en";
  return <Container className="py-16 sm:py-20"><h1 className="text-4xl font-bold">{en ? "Our branches" : "فروعنا"}</h1><p className="mt-4 text-muted">{en ? "Contact and location information for published branches." : "بيانات التواصل والموقع للفروع المنشورة."}</p>{branches.length ? <div className="mt-10 grid gap-5 md:grid-cols-2">{branches.map((branch) => { const name=en?(branch.name_en||branch.name_ar):branch.name_ar; const address=en?(branch.address_en||branch.address_ar):branch.address_ar; const hours=en?(branch.working_hours_en||branch.working_hours_ar):branch.working_hours_ar; return <article key={branch.id} className="rounded-card border border-line bg-surface p-6"><h2 className="text-xl font-bold">{name}</h2>{address&&<p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{address}</p>}<dl className="mt-5 grid gap-2 text-sm">{branch.phone&&<div><dt className="sr-only">{en?"Phone":"الهاتف"}</dt><dd><a className="text-brand" dir="ltr" href={`tel:${branch.phone}`}>{branch.phone}</a></dd></div>}{branch.email&&<div><dt className="sr-only">{en?"Email":"البريد"}</dt><dd><a className="text-brand" href={`mailto:${branch.email}`}>{branch.email}</a></dd></div>}{hours&&<div><dt className="font-bold">{en?"Working hours":"ساعات العمل"}</dt><dd className="mt-1 whitespace-pre-line text-muted">{hours}</dd></div>}</dl>{branch.maps_url&&<Link className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white" href={branch.maps_url} target="_blank" rel="noreferrer">{en?"Open map":"فتح الخريطة"}</Link>}</article>; })}</div>:<div className="mt-10 rounded-card border border-dashed border-line p-8 text-center text-muted">{en?"No branches are published yet.":"لا توجد فروع منشورة حاليًا."}</div>}</Container>;
}
