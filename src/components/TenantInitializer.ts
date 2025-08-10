'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTenantStore } from '@/store/tenantStore';

export function TenantInitializer() {
  const searchParams = useSearchParams();
  const { setTenantConfig, tenant: currentTenant, md5: currentMd5, isDefault } = useTenantStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const tenant = searchParams.get('tenant');
    const md5 = searchParams.get('md5');
    const user = searchParams.get('user');

    if (tenant && md5) {
      setTenantConfig(tenant, md5, user || null);
      console.log('Tenant configuration set from URL parameters');
    } else if (isDefault) {
      console.warn('Using default tenant configuration');
      setTenantConfig('delivery', process.env.NEXT_PUBLIC_KEY || 'defaultmd5', null);
    }

    hasInitialized.current = true;
  },);

  return null;
}