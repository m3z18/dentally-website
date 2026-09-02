import "server-only";
import { createClient } from "@/lib/supabase/server";

export type MediaItem={bucket:string;path:string;name:string;size:number|null;createdAt:string|null;url:string};
const buckets=["doctor-images","article-images","service-images","site-content-images"] as const;

export async function listContentMedia():Promise<{items:MediaItem[];truncated:boolean;error:boolean}>{
  const supabase=await createClient();const items:MediaItem[]=[];let error=false,truncated=false;
  async function walk(bucket:string,path:string,depth:number){if(items.length>=400){truncated=true;return;}const{data,error:listError}=await supabase.storage.from(bucket).list(path,{limit:100,sortBy:{column:"created_at",order:"desc"}});if(listError){error=true;return;}if((data?.length??0)===100)truncated=true;for(const entry of data??[]){const next=path?`${path}/${entry.name}`:entry.name;if(entry.metadata){const{data:url}=supabase.storage.from(bucket).getPublicUrl(next);items.push({bucket,path:next,name:entry.name,size:typeof entry.metadata.size==="number"?entry.metadata.size:null,createdAt:entry.created_at??null,url:url.publicUrl});}else if(depth<2)await walk(bucket,next,depth+1);}}
  for(const bucket of buckets)await walk(bucket,"",0);return{items,truncated,error};
}
