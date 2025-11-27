import { redirect } from 'next/navigation';

// Redirect /services to home page since content is now on home
export default function ServicesPage() {
  redirect('/');
}
