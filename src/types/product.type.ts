export interface ProductData {
  id: string;
  name: string;
  imageUrl: string;
  price?: number;
  originalPrice?: number;
  seller?: string;
  reviewCount?: number;
  shippingInfo?: string;
}
