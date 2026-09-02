"use client";

import { useActionState } from "react";
import { duplicateArticleAction, restoreArticleAction, softDeleteArticleAction } from "@/app/admin/articles/actions";
import type { AdminActionState } from "@/types/admin";

const initial: AdminActionState = { status: "idle", message: "" };

export function ArticleRecordActions({ articleId, deleted }: { articleId: string; deleted: boolean }) {
  const [deleteState, deleteAction, deletePending] = useActionState(softDeleteArticleAction, initial);
  const [restoreState, restoreAction, restorePending] = useActionState(restoreArticleAction, initial);
  const [copyState, copyAction, copyPending] = useActionState(duplicateArticleAction, initial);
  if (deleted) return <form action={restoreAction} className="mt-8 rounded-card border border-amber-200 bg-amber-50 p-5"><input type="hidden" name="articleId" value={articleId} /><p className="text-sm text-amber-900">المقال في المحذوفات. الاستعادة تعيده مخفيًا.</p><button disabled={restorePending} className="mt-4 rounded-full bg-brand px-5 py-3 text-xs font-bold text-white">استعادة المقال</button>{restoreState.message && <p className="mt-3 text-xs">{restoreState.message}</p>}</form>;
  return <div className="mt-8 grid gap-4 md:grid-cols-2"><form action={copyAction} className="rounded-card border border-line bg-surface p-5"><input type="hidden" name="articleId" value={articleId} /><p className="text-sm text-muted">إنشاء نسخة مخفية مستقلة دون نسخ الصورة.</p><button disabled={copyPending} className="mt-4 rounded-full border border-brand px-5 py-3 text-xs font-bold text-brand">تكرار المقال</button>{copyState.message && <p className="mt-3 text-xs">{copyState.message}</p>}</form><form action={deleteAction} className="rounded-card border border-red-200 bg-red-50 p-5"><input type="hidden" name="articleId" value={articleId} /><label className="flex gap-3 text-sm text-red-900"><input type="checkbox" name="confirmDeletion" value="yes" required /> تأكيد النقل إلى المحذوفات</label><button disabled={deletePending} className="mt-4 rounded-full bg-red-700 px-5 py-3 text-xs font-bold text-white">حذف منطقي</button>{deleteState.message && <p className="mt-3 text-xs">{deleteState.message}</p>}</form></div>;
}
