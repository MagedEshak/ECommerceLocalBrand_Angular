export interface ICartItem {
  id?: number;
  cartId?: number;
  productId: number;
  productSizeId: number;
  quantity: number;
  unitPrice: number;
  totalPriceForOneItemType: number;
  productName?: string;
  productImageUrl?: string;
  productSizeName?: string;
}
