# Dentally Dental

موقع **مجمع دينتالي لطب الأسنان** مبني بـNext.js App Router وTypeScript وTailwind CSS، مع RTL وخط Alexandria. يتضمن الموقع العام، نظام الخدمات، حجز المواعيد عبر Supabase، ولوحة إدارة محمية.

## المتطلبات

- Node.js بإصدار متوافق مع Next.js 16.
- مشروع Supabase.
- قاعدة PostgreSQL الخاصة بمشروع Supabase.

## إنشاء مشروع Supabase

1. أنشئ Project جديدًا من لوحة Supabase.
2. من صفحة **Connect** أو **Project Settings → API** انسخ Project URL وAnon key وService role key.
3. انسخ `.env.example` إلى ملف جديد باسم `.env.local`.
4. أضف القيم إلى `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

لا تضع `SUPABASE_SERVICE_ROLE_KEY` في متغير يبدأ بـ`NEXT_PUBLIC_`، ولا ترفع `.env.local` إلى مستودع الكود.

## تشغيل Migration

المخطط الكامل موجود في:

```text
supabase/migrations/202608250001_initial_booking_and_admin.sql
```

يمكن تشغيله عبر **SQL Editor** في Supabase، أو بربط Supabase CLI بالمشروع ثم تشغيل:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

ينشئ الـmigration الجداول وRLS ووظائف الحجز الآمنة وقيد منع الحجز المزدوج.

## تشغيل Seed

بعد الـmigration، شغّل محتوى `supabase/seed.sql` عبر **SQL Editor**.

يضيف الملف:

- الخدمات العامة الإحدى عشرة.
- خيارًا داخليًا باسم «كشف واستشارة عامة» لرحلة الحجز.
- ساعات مؤقتة من السبت إلى الخميس، من 2:00 م إلى 10:00 م، بمدة 30 دقيقة.

هذه الساعات مؤقتة ويجب تعديلها من `/admin/availability` بعد اعتماد ساعات العمل الرسمية. لا يضيف الـSeed دوامًا ليوم الجمعة.

## إنشاء أول Admin

لا يحتوي المشروع على مستخدم إدارة أو كلمة مرور ثابتة.

1. افتح **Authentication → Users** في Supabase.
2. أنشئ مستخدمًا جديدًا ببريد إلكتروني وكلمة مرور تختارها أنت.
3. انسخ `User ID` الخاص بالمستخدم.
4. شغّل الاستعلام التالي من **SQL Editor** بعد استبدال القيم:

```sql
insert into public.profiles (id, full_name, role, is_active)
values ('AUTH_USER_UUID', 'اسم المسؤول', 'admin', true)
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  is_active = excluded.is_active;
```

5. افتح `/admin/login` وسجّل الدخول بالبريد وكلمة المرور اللذين أنشأتهما في Supabase Auth.

## التشغيل المحلي

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

## التحقق

```bash
npm run lint
npm run build
```

## الأمان

- الحجز العام يمر عبر Route Handler على السيرفر ولا يستخدم المفتاح الخاص في المتصفح.
- RLS مفعّل على جميع الجداول العامة.
- الزائر لا يستطيع قراءة المواعيد أو أرقام الجوال أو تعديل السجلات.
- صلاحيات لوحة الإدارة تُفحص في Proxy وصفحات السيرفر وكل Server Action.
- الإلغاء يغيّر الحالة إلى `cancelled` ولا يحذف السجل.
- فهرس جزئي فريد في PostgreSQL يمنع وجود حجزين غير ملغيين في التاريخ والوقت نفسيهما.

## البنية المهمة

- `app/api/`: نقاط التوفر وإنشاء الحجز.
- `app/admin/`: تسجيل الدخول ولوحة الإدارة.
- `components/booking/`: رحلة الحجز.
- `components/admin/`: مكونات لوحة الإدارة.
- `lib/supabase/`: عملاء Supabase للمتصفح والسيرفر والعمليات الخاصة.
- `lib/auth/`: التحقق من صلاحية الإدارة.
- `supabase/migrations/`: مخطط قاعدة البيانات والسياسات والوظائف.
- `supabase/seed.sql`: الخدمات وساعات العمل المؤقتة.
