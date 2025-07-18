export interface ICartItem {
  id: number;
  productId: number;
  productName?: string; // اختياري
  productImageUrl?: string; // اختياري
  productSizeId: number;
  productSizeName?: string; // اختياري
  quantity: number;
  unitPrice: number;
  totalPriceForOneItemType: number;
}
