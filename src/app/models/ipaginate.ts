import { IProduct } from "./iproduct";

export interface IPaginate<T> {
    items: T[],
    totalCount: number,
    pageIndex: number,
    pageSize: number,
    totalPages: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean
}
