export interface iPreviousOrderItem {
  orderItemId: number; // [BindNever]
  productId: number; // [Required]
  quantity: number; // [Required]
  imagePath: string; // default: ''
  size: string; // [Required]
  width: number;
  height: number;
  refundStatus: string | null; // [Required], nullable
  totalPrice: number; // [Required], should be positive
}
