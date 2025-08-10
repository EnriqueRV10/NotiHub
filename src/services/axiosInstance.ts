import axios from 'axios';
import { useTenantStore } from '@/store/tenantStore';

const createAxiosInstance = () => {
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const { tenant, md5, user, isDefault } = useTenantStore.getState();

      if (md5 === 'defaultmd5') {
        console.warn('Ensure NEXT_PUBLIC_KEY is set.');
      }

      config.baseURL = `https://${tenant}.kimetrics.com`;

      if (user) {
        config.params = { ...config.params, user };
      }

      config.headers.Authorization = `Basic ${md5}`;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;