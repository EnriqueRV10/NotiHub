import axios from 'axios';
import { useTenantStore } from '@/store/tenantStore';

const createAxiosInstance = () => {
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });
 };

const axiosInstance = createAxiosInstance();

export default axiosInstance;
