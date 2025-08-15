/**
 * Representa la estructura completa de la tabla Noticias en la Base de Datos
 */
export interface DataBaseNews {
  id: number;
  title: string;
  author: string;
  content: string;
  publish_status: number;
  start_date: Date;
  end_date: Date;
  created_at: string;
  deleted_at: string | null;
}

/**
 * Representa la data para las Noticias para listado
 */
export interface NewsListItem {
  key: number;
  title: string;
  author: string;
  status: number;
  start: Date;
  end: Date;
}

export interface NewsCounters {
  total: number;
  published: number;
  preview: number;
  draft: number;
}

export interface FetchNewsParams {
  publish_status?: number;
  page: number;
  pageSize: number;
  search?:string;
}

export interface NewsResponse {
  results: NewsListItem[];
  total: number;
  currentPage: number;
  pageSize: number;
}

