import React from 'react';
import DomainHub from '@/components/shared/DomainHub';
import { ENTERPRISE_DOMAINS } from '@/lib/enterpriseDomains';

export default function EnterpriseDomain({ domain }) {
  const config = ENTERPRISE_DOMAINS[domain];
  if (!config) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-white/40 text-sm">Domain not found.</p>
      </div>
    );
  }
  return <DomainHub {...config} />;
}