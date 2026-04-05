export type UserRole = 'user' | 'vendor' | 'admin';

export interface User {
  user_id?: number;
  vendor_id?: number;
  name: string;
  email: string;
  number?: string;
  phone?: string;
  address?: string;
  city?: string;
  vendor_type?: string;
  business_name?: string;
  role: UserRole;
}
