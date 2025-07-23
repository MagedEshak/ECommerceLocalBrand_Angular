import { INewArrivals } from './inew-arrivals';
import { IProductImagesPaths } from './iproduct-images-paths';
import { IProductSizes } from './iproduct-sizes';

// export interface IProduct {
//     id: number,
//     name: string,
//     description: string,
//     price: number,
//     discountPercentage: number,
//     categoryId: number,
//     isDeleted: boolean,
//     productSizes?: IProductSizes[]; // optional
//     productImagesPaths: IProductImagesPaths[]; // required
//     NewArrival: INewArrivals
// }

export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  priceAfterDiscount: number; // 👈 ممكن تضيفه لو محتاجه
  averageRating?: number;
  categoryId: number;
  isDeleted: boolean;
  productSizes?: IProductSizes[];
  productImagesPaths: IProductImagesPaths[];
  NewArrival: INewArrivals;
  details?: string;
  care?: string;
  fit?: string;
  PublishAt: Date;
  IsPublished: boolean;
}
