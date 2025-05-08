import { json, error } from '@sveltejs/kit';

export async function GET() {
  const res = await fetch('https://sos2425-15.onrender.com/api/v1/temperature-stats/');
  if (!res.ok) throw error(res.status, 'No se pudieron obtener stats de temperatura');
  const data = await res.json();
  return json(data);
}