import { redirect } from 'next/navigation';

// /services redirects to /shop — the main service browsing page
export default function ServicesPage() {
  redirect('/shop');
}
