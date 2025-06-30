export interface ProductData {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  imageUrl: string;
  seller?: string;
  reviewCount?: number;
  shippingInfo?: string;
  badges?: { text: string; color: string }[];
}
