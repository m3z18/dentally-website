-- الخدمات العامة الإحدى عشرة المعتمدة للموقع.
insert into public.services (slug, name_ar, is_active, is_public) values
  ('dental-implants', 'زراعة الأسنان', true, true),
  ('orthodontics', 'تقويم الأسنان', true, true),
  ('cosmetic-dentistry', 'تجميل الأسنان', true, true),
  ('teeth-whitening', 'تبييض الأسنان', true, true),
  ('root-canal', 'علاج الجذور', true, true),
  ('dental-fillings', 'الحشوات', true, true),
  ('prosthodontics', 'التركيبات', true, true),
  ('periodontics', 'علاج اللثة', true, true),
  ('oral-surgery', 'جراحة الفم والأسنان', true, true),
  ('pediatric-dentistry', 'أسنان الأطفال', true, true),
  ('preventive-care', 'الوقاية والتنظيف والعناية', true, true)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  is_active = excluded.is_active,
  is_public = excluded.is_public;

-- خيار داخلي لرحلة الحجز عندما لا يعرف المراجع الخدمة المناسبة.
insert into public.services (slug, name_ar, is_active, is_public) values
  ('general-consultation', 'كشف واستشارة عامة', true, false)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  is_active = excluded.is_active,
  is_public = excluded.is_public;

-- ساعات مؤقتة للاختبار فقط. يجب تحديثها بعد اعتماد ساعات العمل الرسمية.
-- PostgreSQL: الأحد = 0، الجمعة = 5، السبت = 6.
insert into public.availability (
  day_of_week,
  start_time,
  end_time,
  slot_duration_minutes,
  is_active
) values
  (0, '14:00', '22:00', 30, true),
  (1, '14:00', '22:00', 30, true),
  (2, '14:00', '22:00', 30, true),
  (3, '14:00', '22:00', 30, true),
  (4, '14:00', '22:00', 30, true),
  (6, '14:00', '22:00', 30, true)
on conflict (day_of_week) do update set
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  slot_duration_minutes = excluded.slot_duration_minutes,
  is_active = excluded.is_active;
