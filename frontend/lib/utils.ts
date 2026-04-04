const isProd = process.env.NODE_ENV === 'production';

export function setAuthCookie(token: string): void {
  document.cookie = [
    `ed_token=${token}`,
    'path=/',
    'max-age=604800',
    isProd ? 'Secure' : '',
    'SameSite=Lax',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearAuthCookie(): void {
  document.cookie = 'ed_token=; path=/; max-age=0; SameSite=Lax';
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}