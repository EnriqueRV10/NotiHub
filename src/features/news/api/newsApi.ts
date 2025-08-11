import axiosInstance from "@/services/axiosInstance";
import axios from "axios";

// Funcion para obtener todas las noticias
export const fetchNews = async ({
    status = 1,
    publish_status,
    page,
    pageSize,
    search = '',
    subordinates = 'all'
  }: {
    status: number;
    publish_status?: number;  // Parámetro opcional
    page: number;
    pageSize: number;
    search?: string;  // Parámetro opcional
    subordinates?: string;  // Parámetro opcional
  }) => {

    const params: Record<string, any> = {
        status,
        search,
        page,
        page_size: pageSize,
        subordinates,
      };

      if (publish_status !== undefined) {
        params.publish_status = publish_status;
      }
    
      const response = await axiosInstance.get('/api/v2/news/', {
        params
      });

    const filteredNews = response.data.results.map((news: any) => ({
        key: news.id,
        title: news.title,
        author: news.author,
        start: news.start,
        end: news.end,
        status: news.publish_status,
        // Verifica si el campo 'read' existe y es un arreglo
        stats: news.read && Array.isArray(news.read) 
               ? new Set(news.read.map((readEntry: any) => readEntry.actor__code)).size 
               : 0, // Si no existe o no es un arreglo, stats será 0
    }));

    return {
        results: filteredNews, // array de resultados
        total: response.data.count, // Número total de elementos
        currentPage: page,          // Página actual
        pageSize: pageSize,         // Tamaño de página
    };
    
  };


// Funcion para obtener los contadores de las noticias
export const fetchNewsCounters = async ({
  status = 1,
  subordinates = 'all'
}: {
  status?: number;
  subordinates?: string;
}) => {
  const params: Record<string, any> = {
    status,
    subordinates,
  };

  const response = await axiosInstance.get('/api/v2/news_counters/',{
    params
  });

  return response.data;

};

//Funcion para obtener la informacion de una noticia
export const fetchSingleNews = async ({ id, subordinates = 'all' }:{ id : string; subordinates?: string}) => { 
  const params: Record<string, any> = { subordinates };

  const response = await axiosInstance.get(`/api/v2/news/${id}/`,{params});

  return response
};

// Funcion para realizar una prueba de asignacion
export const testAssignment = async (payload: any) => {
  const response = await axiosInstance.post('/api/v1/employees/test_kql/', payload);
  return response.data;
};

// Funcion para actualizar una noticia
export const updateNews = async (id: string, payload: any) => {
  const response = await axiosInstance.put(`/api/v2/news/${id}/`, payload);
  return response.data;
};

// Funcion para eliminar una noticia
export const deleteNews = async (id: string) => {
  const response = await axiosInstance.delete(`/api/v2/news/${id}/`);
  return response;
};

// Funcion para crear noticia
export const createNews = async (payload: any) => {
  const response = await axiosInstance.post(`/api/v2/news/`, payload);
  return response;
}