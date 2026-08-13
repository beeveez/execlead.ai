import { FileText, CheckCircle2, Send, RotateCcw, ShieldAlert } from 'lucide-react';
export default function ContentOverview({ items }) {
  const cards = [
    [FileText, 'Generated', items.length],
    [CheckCircle2, 'Approved', items.filter((item) => item.approval_status === 'approved').length],
    [Send, 'Published', items.filter((item) => item.status === 'published').length],
    [RotateCcw, 'Regenerations', items.reduce((sum, item) => sum + (item.regeneration_count || 0), 0)],
    [ShieldAlert, 'Flagged', items.filter((item) => item.truthfulness_status !== 'passed').length],
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([Icon,label,value])=><div key={label} className="rounded-2xl border border-border bg-card p-4"><Icon className="h-4 w-4 text-accent-orange"/><p className="mt-4 text-2xl font-bold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div>;
}