import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  hasSupabaseServerEnv,
  supabaseConfigurationMessage,
} from "@/lib/supabase/config";
import { validateBookingPayload } from "@/lib/validation/booking";

const slotConflictCodes = ["SLOT_TAKEN", "BLOCKED_SLOT", "DAY_CLOSED", "OUTSIDE_AVAILABILITY", "PAST_SLOT"];

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json(
      { code: "CONFIGURATION", message: supabaseConfigurationMessage },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "تعذر قراءة بيانات الحجز." }, { status: 400 });
  }

  const validation = validateBookingPayload(body);
  if (!validation.success) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const booking = validation.data;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("create_appointment", {
    p_service_slug: booking.serviceSlug,
    p_date: booking.date,
    p_time: booking.time,
    p_patient_name: booking.patientName,
    p_patient_phone: booking.phone,
    p_notes: booking.notes || null,
  });

  if (error) {
    const isSlotConflict = slotConflictCodes.some((code) => error.message.includes(code));
    if (isSlotConflict) {
      return NextResponse.json(
        {
          code: "SLOT_UNAVAILABLE",
          message: "عذرًا، تم حجز هذا الموعد للتو أو لم يعد متاحًا. اختر وقتًا آخر.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { code: "DATABASE_ERROR", message: "تعذر إتمام الحجز الآن. حاول مرة أخرى." },
      { status: 500 },
    );
  }

  const appointment = data?.[0];
  if (!appointment) {
    return NextResponse.json(
      { code: "DATABASE_ERROR", message: "تعذر إتمام الحجز الآن. حاول مرة أخرى." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      bookingReference: appointment.booking_reference,
      status: appointment.status,
    },
    { status: 201 },
  );
}
