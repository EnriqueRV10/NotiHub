import {create} from 'zustand';

interface TenantState {
  tenant: string;
  md5: string;
  user: string | null;
  isDefault: boolean;
  setTenantConfig: (tenant: string, md5: string, user: string | null) => void;
}

const DEFAULT_TENANT = 'delivery';
const DEFAULT_MD5 = process.env.NEXT_PUBLIC_KEY || 'defaultmd5';

export const useTenantStore = create<TenantState>((set) => ({
  tenant: DEFAULT_TENANT,
  md5: DEFAULT_MD5,
  user: null,
  isDefault: true,
  setTenantConfig: (tenant, md5, user) => set({ 
    tenant, 
    md5, 
    user, 
    isDefault: tenant === DEFAULT_TENANT && md5 === DEFAULT_MD5 
  }),
}));