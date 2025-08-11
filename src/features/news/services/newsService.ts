import supabase from '@/supabase/supabase';

export const fetchNews = async ({
  publish_status,
  page,
  pageSize,
  search = '',
}: {
  publish_status?: number;
  page: number;
  pageSize: number;
  search?: string;
}) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('Noticias')
    .select('*', { count: 'exact' })
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

  const filteredNews = (data ?? []).map((news) => ({
    key: news.id,
    title: news.title,
    author: news.author,
    start: news.start_date,
    end: news.end_date,
    status: news.publish_status,
    stats: news.read && Array.isArray(news.read)
      ? new Set(news.read.map((r: any) => r.actor__code)).size
      : 0,
  }));

  return {
    results: filteredNews,
    total: count ?? 0,
    currentPage: page,
    pageSize,
  };
};
