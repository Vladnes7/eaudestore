import { getSearchIndex } from '@/lib/catalog';

export async function GET() {
  const data = await getSearchIndex();
  return Response.json(data, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}
