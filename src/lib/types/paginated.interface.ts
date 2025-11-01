export interface Paginated<T> {
    first: number, next: number | null, last: number, prev: number | null, pages: number, items: number, data: T[]
}
