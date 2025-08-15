import supabase from "@/supabase/supabase";
import {
  FetchNewsParams,
  NewsCounters,
  NewsListItem,
  NewsResponse,
} from "../types/newsTypes";

/**
 * Obtiene todas la noticias con paginación y filtrado
 */
export const fetchNews = async ({
  publish_status,
  page,
  pageSize,
  search = "",
}: FetchNewsParams): Promise<NewsResponse> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("Noticias")
    .select("id, title, author, publish_status, start_date, end_date", {
      count: "exact",
    })
    .is("deleted_at", null) // Asegurarse de que no esté eliminado
    .order("created_at", { ascending: false }) // ordenar por fecha más reciente
    .range(from, to);

  // Filtrado por estado de publicación
  if (publish_status !== undefined) {
    query = query.eq("publish_status", publish_status);
  }

  // Búsqueda por título
  if (search.trim() !== "") {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, count, error } = await query;

  console.log("Query result:", { data, count, error });

  if (error) {
    console.error("Error fetching news:", error);
    throw error;
  }

  const results: NewsListItem[] = (data ?? []).map((news) => ({
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
  const { data, error } = await supabase
    .from("Noticias")
    .select("publish_status")
    .is("deleted_at", null); // Asegurarse de que no esté eliminado

  if (error) {
    console.error("Error Calculating conunters:", error);
    throw error;
  }

  return (data ?? []).reduce(
    (acc, item) => {
      acc.total++;
      switch (item.publish_status) {
        case 0:
          acc.draft++;
          break;
        case 1:
          acc.preview++;
          break;
        case 2:
          acc.published++;
          break;
      }
      return acc;
    },
    { total: 0, draft: 0, preview: 0, published: 0 }
  );
};

/**
 * Obtiene información de una noticia específica
 * Equivalente a fetchSingleNews en newsApi.ts
 */
export const fetchSingleNews = async (id: string) => {
  const { data, error } = await supabase
    .from('Noticias')
    .select('*')
    .eq('id', parseInt(id))
    .is('deleted_at', null) // Solo noticias activas
    .single();

  if (error) {
    console.error('Error fetching single news:', error);
    throw error;
  }

  return { data }; // Mantener la misma estructura que el API original
};

export const deleteNews = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("Noticias")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parseInt(id))
    .is("deleted_at", null); // Asegurarse de que no esté ya eliminado

  if (error) {
    //console.error("Error marking news as deleted:", error);
    throw error;
  }
};

/**
 * Actualiza una noticia existente
 * Equivalente a updateNews en newsApi.ts
 */
export const updateNews = async (id: string, payload: any) => {
  const { data, error } = await supabase
    .from('Noticias')
    .update(payload)
    .eq('id', parseInt(id))
    .is('deleted_at', null) // Solo actualizar noticias activas
    .select()
    .single();

  if (error) {
    console.error('Error updating news:', error);
    throw error;
  }

  return data;
};

/**
 * Crea una nueva noticia
 * Equivalente a createNews en newsApi.ts
 */
export const createNews = async (payload: any) => {
  const { data, error } = await supabase
    .from('Noticias')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error creating news:', error);
    throw error;
  }

  return { data }; // Mantener la misma estructura que el API original
};
