export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  vendorId: string;
  date: string;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}