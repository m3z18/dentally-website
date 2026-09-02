import { Container } from "@/components/ui/container";
import { getLocale } from "@/lib/i18n";

export async function LegalPage({titleAr,titleEn,summaryAr,summaryEn}:{titleAr:string;titleEn:string;summaryAr:string;summaryEn:string}){const en=(await getLocale())==="en";return <Container className="py-16 sm:py-20"><article className="mx-auto max-w-3xl"><p className="text-sm font-bold text-brand">{en?"Legal information":"معلومات تنظيمية"}</p><h1 className="mt-4 text-4xl font-bold sm:text-5xl">{en?titleEn:titleAr}</h1><p className="mt-8 whitespace-pre-line text-base leading-9 text-muted">{en?summaryEn:summaryAr}</p></article></Container>}
