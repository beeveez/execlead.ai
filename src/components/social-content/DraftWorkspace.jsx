import PostEditor from '@/components/social-content/PostEditor';
import QualityPanel from '@/components/social-content/QualityPanel';
import ReviewActions from '@/components/social-content/ReviewActions';
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/socialContentConfig';
export default function DraftWorkspace({ item, onUpdate, onRegenerate, onPlatformVersion, busy, onPublish }) {
  if(!item)return <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Select a draft to review.</div>;
  return <div className="space-y-4"><div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-xl font-bold text-foreground">{item.title}</h2><span className="rounded-full bg-muted px-3 py-1 text-xs">{PLATFORM_LABELS[item.platform]}</span><span className="rounded-full bg-muted px-3 py-1 text-xs">{STATUS_LABELS[item.status]}</span>{item.approval_status==='approved'&&<button onClick={onPublish} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Confirm Publish</button>}</div><div className="grid gap-4 xl:grid-cols-[1fr_320px]"><PostEditor key={item.id+item.updated_date} item={item} onSave={onUpdate}/><QualityPanel item={item}/></div><ReviewActions item={item} onUpdate={onUpdate} onRegenerate={onRegenerate} onPlatformVersion={onPlatformVersion} busy={busy}/></div>;
}