export interface ICartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productSizeId: number;
  productSizeName: string;
  quantity: number;
  unitPrice: number;
  totalPriceForOneItemType: number;
}
