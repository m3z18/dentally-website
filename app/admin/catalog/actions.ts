"use server";

import { revalidatePath } from "next/cache";
import { requireContentManager } from "@/lib/auth/admin";
import { serviceImageMaximumBytes, serviceImageMimeTypes, serviceImagesBucket } from "@/lib/service-images";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/admin";
import type { AdminActionState } from "@/types/admin";

type CatalogTable = "services" | "specialties" | "branches";
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const optional = (data: FormData, key: string) => value(data, key) || null;
const order = (data: FormData) => Number(value(data, "displayOrder"));
const failure = "تعذر تنفيذ العملية. تحقق من البيانات ومن تطبيق ملف Migration المطلوب.";
const okOrder = (number: number) => Number.isSafeInteger(number) && number >= 0;
const okSlug = (slug: string) => slug.length >= 2 && slug.length <= 80 && slugPattern.test(slug);
const https = (url: string | null) => { if (!url) return true; try { return new URL(url).protocol === "https:"; } catch { return false; } };

function refresh(...paths: string[]) { for (const path of paths) revalidatePath(path); }
function bytesMatch(bytes: Uint8Array, expected: number[], offset = 0) { return expected.every((item,index)=>bytes[offset+index]===item); }
async function prepareImage(data: FormData) {
  const file=data.get("image"); if(!(file instanceof File)||!file.size)return null;
  if(file.size>serviceImageMaximumBytes||!(serviceImageMimeTypes as readonly string[]).includes(file.type))return "invalid" as const;
  const bytes=await file.arrayBuffer(); const signature=new Uint8Array(bytes.slice(0,12));
  const jpeg=file.type==="image/jpeg"&&bytesMatch(signature,[0xff,0xd8,0xff]);
  const png=file.type==="image/png"&&bytesMatch(signature,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  const webp=file.type==="image/webp"&&bytesMatch(signature,[0x52,0x49,0x46,0x46])&&bytesMatch(signature,[0x57,0x45,0x42,0x50],8);
  if(!jpeg&&!png&&!webp)return "invalid" as const;
  return {bytes,type:file.type,extension:jpeg?"jpg":png?"png":"webp"};
}

export async function saveSpecialtyAction(_state:AdminActionState,data:FormData):Promise<AdminActionState>{
  await requireContentManager(); const id=value(data,"id"),slug=value(data,"slug").toLowerCase(),nameAr=value(data,"nameAr"),displayOrder=order(data);
  if((id&&!isUuid(id))||!okSlug(slug)||nameAr.length<2||nameAr.length>160||!okOrder(displayOrder))return{status:"error",message:"تحقق من اسم التخصص والرابط والترتيب."};
  const payload={slug,name_ar:nameAr,name_en:optional(data,"nameEn"),description_ar:optional(data,"descriptionAr"),description_en:optional(data,"descriptionEn"),display_order:displayOrder,is_active:id?data.get("isActive")==="on":false};
  const supabase=await createClient(); const result=id?await supabase.from("specialties").update(payload).eq("id",id):await supabase.from("specialties").insert(payload);
  if(result.error)return{status:"error",message:failure}; refresh("/admin/specialties","/services","/doctors"); return{status:"success",message:id?"تم حفظ التخصص.":"أضيف التخصص مخفيًا."};
}

export async function saveBranchAction(_state:AdminActionState,data:FormData):Promise<AdminActionState>{
  await requireContentManager(); const id=value(data,"id"),slug=value(data,"slug").toLowerCase(),nameAr=value(data,"nameAr"),displayOrder=order(data),maps=optional(data,"mapsUrl"),email=optional(data,"email");
  if((id&&!isUuid(id))||!okSlug(slug)||nameAr.length<2||nameAr.length>160||!okOrder(displayOrder)||!https(maps)||(email&&!/^\S+@\S+\.\S+$/.test(email)))return{status:"error",message:"تحقق من بيانات الفرع."};
  const number=(key:string,min:number,max:number)=>{const raw=optional(data,key);if(raw===null)return null;const parsed=Number(raw);return Number.isFinite(parsed)&&parsed>=min&&parsed<=max?parsed:NaN;}; const latitude=number("latitude",-90,90),longitude=number("longitude",-180,180); if(Number.isNaN(latitude)||Number.isNaN(longitude))return{status:"error",message:"إحداثيات الفرع غير صالحة."};
  const payload={slug,name_ar:nameAr,name_en:optional(data,"nameEn"),address_ar:optional(data,"addressAr"),address_en:optional(data,"addressEn"),phone:optional(data,"phone"),whatsapp:optional(data,"whatsapp"),email,maps_url:maps,latitude,longitude,working_hours_ar:optional(data,"workingHoursAr"),working_hours_en:optional(data,"workingHoursEn"),display_order:displayOrder,is_active:id?data.get("isActive")==="on":false};
  const supabase=await createClient();const result=id?await supabase.from("branches").update(payload).eq("id",id):await supabase.from("branches").insert(payload);if(result.error)return{status:"error",message:failure};refresh("/branches","/admin/branches");return{status:"success",message:id?"تم حفظ الفرع.":"أضيف الفرع مخفيًا."};
}

export async function saveServiceAction(_state:AdminActionState,data:FormData):Promise<AdminActionState>{
  await requireContentManager();const id=value(data,"id"),slug=value(data,"slug").toLowerCase(),nameAr=value(data,"nameAr"),displayOrder=order(data),specialty=optional(data,"specialtyId");
  if((id&&!isUuid(id))||!okSlug(slug)||nameAr.length<2||nameAr.length>120||!okOrder(displayOrder)||(specialty&&!isUuid(specialty)))return{status:"error",message:"تحقق من بيانات الخدمة."};
  const submitted=await prepareImage(data);if(submitted==="invalid")return{status:"error",message:"الصورة يجب أن تكون JPG أو PNG أو WebP صالحة وبحد أقصى 5MB."};
  const supabase=await createClient();const serviceId=id||crypto.randomUUID();let currentPath:string|null=null;if(id){const{data:current}=await supabase.from("services").select("slug,image_path,deleted_at").eq("id",id).maybeSingle();if(!current||current.deleted_at)return{status:"error",message:"الخدمة غير موجودة أو محذوفة."};if(current.slug!==slug)return{status:"error",message:"لا يمكن تغيير رابط خدمة مستخدمة في الحجز."};currentPath=current.image_path;}
  let uploaded:string|null=null;if(submitted){uploaded=`${serviceId}/${crypto.randomUUID()}.${submitted.extension}`;const{error}=await supabase.storage.from(serviceImagesBucket).upload(uploaded,submitted.bytes,{contentType:submitted.type,cacheControl:"3600",upsert:false});if(error)return{status:"error",message:"تعذر رفع صورة الخدمة."};}
  const nextPath=uploaded??(data.has("removeImage")?null:currentPath);const payload={name_ar:nameAr,name_en:optional(data,"nameEn"),description_ar:optional(data,"descriptionAr"),description_en:optional(data,"descriptionEn"),content_ar:optional(data,"contentAr"),content_en:optional(data,"contentEn"),image_path:nextPath,image_alt_ar:optional(data,"imageAltAr"),image_alt_en:optional(data,"imageAltEn"),specialty_id:specialty,display_order:displayOrder,seo_title_ar:optional(data,"seoTitleAr"),seo_title_en:optional(data,"seoTitleEn"),seo_description_ar:optional(data,"seoDescriptionAr"),seo_description_en:optional(data,"seoDescriptionEn"),is_public:id?data.get("isPublic")==="on":false};
  const result=id?await supabase.from("services").update(payload).eq("id",id):await supabase.from("services").insert({...payload,id:serviceId,slug});if(result.error){if(uploaded)await supabase.storage.from(serviceImagesBucket).remove([uploaded]);return{status:"error",message:failure};}if(currentPath&&currentPath!==nextPath)await supabase.storage.from(serviceImagesBucket).remove([currentPath]);refresh("/","/services",`/services/${slug}`,"/admin/services");return{status:"success",message:id?"تم حفظ الخدمة.":"أضيفت الخدمة مخفية."};
}

export async function toggleCatalogDeletionAction(_state:AdminActionState,data:FormData):Promise<AdminActionState>{
  const candidateTable=value(data,"table"),candidateId=value(data,"id");
  if(candidateTable==="services"){
    await requireContentManager();if(!isUuid(candidateId))return{status:"error",message:failure};const restore=data.get("restore")==="yes";const supabase=await createClient();const{error}=await supabase.from("services").update({deleted_at:restore?null:new Date().toISOString(),is_public:false}).eq("id",candidateId);if(error)return{status:"error",message:failure};refresh("/services","/admin/services");return{status:"success",message:restore?"استعيد السجل مخفيًا.":"نقل السجل إلى المحذوفات."};
  }
  await requireContentManager();const id=value(data,"id"),table=value(data,"table") as CatalogTable;if(!isUuid(id)||!["services","specialties","branches"].includes(table))return{status:"error",message:failure};const restore=data.get("restore")==="yes";const supabase=await createClient();const{error}=await supabase.from(table).update({deleted_at:restore?null:new Date().toISOString(),is_active:false}).eq("id",id);if(error)return{status:"error",message:failure};const paths={services:["/services","/admin/services"],specialties:["/services","/admin/specialties"],branches:["/branches","/admin/branches"]};refresh(...paths[table]);return{status:"success",message:restore?"استعيد السجل مخفيًا.":"نقل السجل إلى المحذوفات."};
}
