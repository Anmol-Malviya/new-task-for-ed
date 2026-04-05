export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType:| 'per_hour' | 'per_day';
  images: string[];
  rating: number;
  reviewCount: number;
  vendorId: string;
  location: string;
  isAvailable: boolean;
}