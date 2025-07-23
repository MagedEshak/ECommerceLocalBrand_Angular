import { iPreviousOrderItem } from './iPreviousOrderItem';

export interface IPreviousOrder {
  orderId: number; // [BindNever]
  orderNumber?: string; // max 20 chars
  createdAt: Date; // [Required], [BindNever]
  deliveredAt?: Date;
  shippingCost?: number; // decimal(18,2)
  discountValue: number; // decimal(18,2)
  totalOrderPrice: number; // [Required], decimal(18,2)
  paymentMethod: string; // [Required]
  orderStatus: string; // [Required]
  shippingStatus: string; // [Required]
  refundStatuses: (string | null)[]; // [Required], nullable strings inside
  orderItems: iPreviousOrderItem[]; // [Required], assumed to be another interface
  orderAddressInfo: string; // [Required]
}

//  [BindNever]
//  public int OrderId { get; set; }

//  [StringLength(20, ErrorMessage = "OrderNumber can't exceed 20 characters")]
//  public string? OrderNumber { get; set; }//

//  [BindNever]
//  [Required]
//  public DateTime CreatedAt { get; set; }//

//  public DateTime? DeliveredAt { get; set; }//

//  [Column(TypeName = "decimal(18,2)")]
//  public decimal? ShippingCost { get; set; }

//  [Column(TypeName = "decimal(18,2)")]
//  public decimal DiscountValue { get; set; }

//  [Required]
//  [Column(TypeName = "decimal(18,2)")]
//  public decimal TotalOrderPrice { get; set; }

//  [Required]
//  public string paymentMethod { get; set; }

//  [Required]
//  public string OrderStatus { get; set; }

//  [Required]
//  public string ShippingStatus { get; set; }

//  [Required]
//  public List<string?> RefundStatuses { get; set; }

//  [Required]
//  public ICollection<PreviousOrderItemDto> OrderItems { get; set; }

//  [Required]
//  public string OrderAddressInfo { get; set; }
