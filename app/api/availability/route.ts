import { NextResponse, type NextRequest } from "next/server";

import { formatArabicTime, getRiyadhDateValue } from "@/lib/date";
import {
  hasSupabaseServerEnv,
  supabaseConfigurationMessage,
} from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const today = getRiyadhDateValue();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) {
    return NextResponse.json(
      { message: "اختر تاريخًا صحيحًا وغير سابق.", slots: [] },
      { status: 400 },
    );
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.json(
      { message: supabaseConfigurationMessage, slots: [] },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_available_slots", { p_date: date });

  if (error) {
    return NextResponse.json(
      { message: "تعذر تحميل المواعيد المتاحة الآن. حاول مرة أخرى.", slots: [] },
      { status: 500 },
    );
  }

  const slots = (data ?? []).map(({ slot_time }) => {
    const value = slot_time.slice(0, 5);
    return { value, label: formatArabicTime(value), status: "available" as const };
  });

  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "no-store" } },
  );
}
