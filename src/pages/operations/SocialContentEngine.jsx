import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs,TabsContent,TabsList,TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import useSocialContent from '@/hooks/useSocialContent';
import SocialContentHero from '@/components/social-content/SocialContentHero';
import ContentOverview from '@/components/social-content/ContentOverview';
import CreatePostForm from '@/components/social-content/CreatePostForm';
import ContentTable from '@/components/social-content/ContentTable';
import DraftWorkspace from '@/components/social-content/DraftWorkspace';
import ContentCalendar from '@/components/social-content/ContentCalendar';
import ContentAnalytics from '@/components/social-content/ContentAnalytics';
import BrandGovernance from '@/components/social-content/BrandGovernance';
import PublishConfirmDialog from '@/components/social-content/PublishConfirmDialog';

const TABS=[['overview','Content Overview'],['create','Create Post'],['calendar','Content Calendar'],['drafts','Drafts'],['approval','Approval Queue'],['published','Published'],['analytics','Analytics'],['pillars','Content Pillars'],['voice','Brand Voice'],['settings','Settings']];
export default function SocialContentEngine(){
  const {items,loading,generate,update,reload}=useSocialContent(); const {toast}=useToast();
  const [tab,setTab]=useState('overview'); const [selectedId,setSelectedId]=useState(null); const [busy,setBusy]=useState(false); const [publishOpen,setPublishOpen]=useState(false);
  const selected=useMemo(()=>items.find(item=>item.id===selectedId)||items.find(item=>!['published','archived'].includes(item.status)),[items,selectedId]);
  const select=(item)=>{setSelectedId(item.id);setTab('drafts');};
  const run=async(form,action,existing)=>{setBusy(true);try{const id=await generate(form,action,existing);await reload();setSelectedId(id);setTab('drafts');toast({title:'Governed draft generated',description:'Quality checks complete. Human approval is required.'});}catch(error){toast({title:'Draft generation failed',description:error.message,variant:'destructive'});}finally{setBusy(false);}};
  const patch=async(data)=>{const user=data.approval_status==='approved'?await base44.auth.me():null;await update(selected.id,{...data,...(user?{approved_by:user.full_name||user.email}: {})});await reload();};
  const regenerate=(action)=>run({platform:selected.platform,pillar:selected.content_pillar,contentType:selected.content_type,sourceType:selected.source_type,topic:selected.topic,instruction:'',voice:selected.voice},action,selected);
  const platformVersion=(platform)=>run({platform,pillar:selected.content_pillar,contentType:selected.content_type,sourceType:selected.source_type,topic:selected.topic,instruction:'Adapt this approved concept for the selected platform.',voice:selected.voice,existingDraft:selected.draft},'Create Platform Version');
  const publish=async()=>{await patch({status:'published',published_date:new Date().toISOString()});setPublishOpen(false);toast({title:'Content marked published',description:'The explicit publishing decision was recorded.'});};
  if(loading)return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground"/></div>;
  return <div className="space-y-6"><SocialContentHero/><Tabs value={tab} onValueChange={setTab}><TabsList className="h-auto w-full justify-start overflow-x-auto bg-transparent p-0">{TABS.map(([value,label])=><TabsTrigger key={value} value={value} className="border-b-2 border-transparent px-3 py-2 data-[state=active]:border-accent-orange data-[state=active]:shadow-none">{label}</TabsTrigger>)}</TabsList><TabsContent value="overview" className="space-y-5"><ContentOverview items={items}/><ContentTable items={items.slice(0,8)} onSelect={select}/></TabsContent><TabsContent value="create"><CreatePostForm onGenerate={form=>run(form)} busy={busy}/></TabsContent><TabsContent value="calendar"><ContentCalendar items={items} onSelect={select}/></TabsContent><TabsContent value="drafts"><DraftWorkspace item={selected} onUpdate={patch} onRegenerate={regenerate} onPlatformVersion={platformVersion} busy={busy} onPublish={()=>setPublishOpen(true)}/></TabsContent><TabsContent value="approval"><ContentTable items={items.filter(i=>i.approval_status==='needs_review')} onSelect={select} empty="No drafts need review."/></TabsContent><TabsContent value="published"><ContentTable items={items.filter(i=>i.status==='published')} onSelect={select} empty="No content has been published."/></TabsContent><TabsContent value="analytics"><ContentAnalytics items={items}/></TabsContent><TabsContent value="pillars"><BrandGovernance mode="pillars"/></TabsContent><TabsContent value="voice"><BrandGovernance mode="voice"/></TabsContent><TabsContent value="settings"><BrandGovernance mode="settings"/></TabsContent></Tabs><PublishConfirmDialog item={selected} open={publishOpen} onOpenChange={setPublishOpen} onConfirm={publish}/></div>;
}