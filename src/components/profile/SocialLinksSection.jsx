import React from "react";
import { TextField, SectionCard } from "./FormFields";
import { Link2 } from "lucide-react";

export default function SocialLinksSection({ form, setField }) {
  return (
    <SectionCard title="Social Links" description="Connect your professional profiles." icon={Link2}>
      <TextField label="LinkedIn" value={form.linkedin_url} onChange={v => setField("linkedin_url", v)} placeholder="https://linkedin.com/in/yourprofile" />
      <TextField label="GitHub" value={form.github_url} onChange={v => setField("github_url", v)} placeholder="https://github.com/yourusername" />
      <TextField label="Portfolio" value={form.portfolio_url} onChange={v => setField("portfolio_url", v)} placeholder="https://yourportfolio.com" />
      <TextField label="Website" value={form.website_url} onChange={v => setField("website_url", v)} placeholder="https://yoursite.com" />
    </SectionCard>
  );
}