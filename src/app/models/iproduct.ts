import { INewArrivals } from './inew-arrivals';
import { IProductImagesPaths } from "./iproduct-images-paths";
import { IProductSizes } from "./iproduct-sizes";

export interface IProduct {
    id: number,
    name: string,
    description: string,
    price: number,
    discountPercentage: number,
    categoryId: number,
    isDeleted: boolean,
    productSizes?: IProductSizes[]; // optional
    productImagesPaths: IProductImagesPaths[]; // required
    NewArrival: INewArrivals
}
