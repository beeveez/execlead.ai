import React, { useState, useEffect } from 'react';
import { ShieldCheck, BadgeCheck, Mail, Phone, Building2, GraduationCap, FileText, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

const VERIFICATIONS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'organization', label: 'Organization', icon: Building2 },
  { key: 'certification', label: 'Certification', icon: BadgeCheck },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'employment', label: 'Employment', icon: FileText },
  { key: 'identity', label: 'Identity', icon: ShieldCheck },
  { key: 'background', label: 'Background', icon: Lock },
];

export default function ExecutiveTrust({ data }) {
  const [verifications, setVerifications] = useState([]);

  useEffect(() => {
    base44.entities.IdentityVerification.filter({}, '-created_date', 20)
      .then(res => setVerifications(res || []))
      .catch(() => setVerifications([]));
  }, []);

  const verifiedTypes = new Set(verifications.filter(v => v.status === 'verified' || v.verified).map(v => v.verification_type || v.type));
  const verifiedCount = VERIFICATIONS.filter(v => verifiedTypes.has(v.key)).length;

  return (
    <PortfolioSection id="trust" title="Executive Trust™" icon={ShieldCheck} color="#3b82f6">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl font-bold text-blue-400">{verifiedCount}/{VERIFICATIONS.length}</div>
        <div className="text-[10px] text-white/30">Verifications Complete</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VERIFICATIONS.map((v) => {
          const isVerified = verifiedTypes.has(v.key);
          const Icon = v.icon;
          return (
            <div key={v.key} className={`rounded-lg p-2.5 border text-center ${isVerified ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/[0.02] border-white/5'}`}>
              <Icon size={16} className={`mx-auto mb-1 ${isVerified ? 'text-blue-400' : 'text-white/20'}`} />
              <div className={`text-[9px] ${isVerified ? 'text-blue-400' : 'text-white/30'}`}>{v.label}</div>
              {isVerified && <BadgeCheck size={10} className="text-blue-400 mx-auto mt-0.5" />}
            </div>
          );
        })}
      </div>
    </PortfolioSection>
  );
}