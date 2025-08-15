import supabase from '@/supabase/supabase';
import { FetchNewsParams, NewsCounters, NewsListItem, NewsResponse } from '../types/newsTypes';

export const fetchNews = async ({
  publish_status,
  page,
  pageSize,
  search = '',
}: FetchNewsParams ): Promise<NewsResponse> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('Noticias')
    .select('id, title, author, publish_status, start_date, end_date', { count: 'exact' })
    .order('created_at', { ascending: false }) // ordenar por fecha más reciente
    .range(from, to);

  // Filtrado por estado de publicación
  if (publish_status !== undefined) {
    query = query.eq('publish_status', publish_status);
  }

  // Búsqueda por título
  if (search.trim() !== '') {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, count, error } = await query;

  console.log('Query result:', { data, count, error });

  if (error) {
    console.error('Error fetching news:', error);
    throw error;
  }

  const results : NewsListItem[] = (data ?? []).map((news) => ({
    key: news.id,
    title: news.title,
    author: news.author,
    start: news.start_date,
    end: news.end_date,
    status: news.publish_status,
  }));

  return {
    results,
    total: count ?? 0,
    currentPage: page,
    pageSize,
  };
};

export const fetchNewsCounters = async (): Promise<NewsCounters> => {
  const {data, error} = await supabase
    .from('Noticias')
    .select('publish_status');
  
  if (error) {
    console.error('Error Calculating conunters:', error);
    throw error;
  }

  return (data ?? []).reduce(
    (acc, item) => {
      acc.total++;
      switch(item.publish_status) {
        case 0: acc.draft++; break;
        case 1: acc.preview++; break;
        case 2: acc.published++; break;
      }
      return acc;
    },
    { total: 0, draft: 0, preview: 0, published: 0}
  )
}

export const deleteNews = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("Noticias")
      .update({ elim: true })
      .eq("id", parseInt(id))
      // Solo permitir eliminación si no está ya eliminado
      .or("alumno_eliminado.is.null,alumno_eliminado.eq.false");

    if (error) {
      //console.error("Error marking news as deleted:", error);
      throw error;
    }

  } catch (error) {
    //console.error("Service error in deleteNews:", error);
    throw error;
  }
};
