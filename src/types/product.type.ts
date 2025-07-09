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

/** 상품 데이터 (price, review 등 전체 데이터 포함) */
export interface ProductMockData {
  id: string;
  category: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  seller: string;
  reviewCount: number;
  shippingInfo: string;
  badges: { text: string; color: string }[];
}

/** 즐겨찾기 데이터 */
export interface FavoriteMockData {
  productId: string;
  name: string;
  registeredAt: string;
}

/** 알림 데이터 */
export interface NotificationMockData {
  productId: string;
  productName: string;
  threshold: number;
}
