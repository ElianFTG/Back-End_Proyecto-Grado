
export interface ProductPrice {
    priceTypeId: number;
    priceTypeName?: string;
    price: number;
}

export class Product {
    id?: number | undefined;
    name: string;
    barcode: string | null;
    internalCode: string | null;
    presentationId: number | null;
    colorId: number | null;
    prices: ProductPrice[];
    state: boolean;
    categoryId: number;
    brandId: number;
    userId: number | null;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    categoryName?: string | undefined;
    brandName?: string | undefined;
    presentationName?: string | undefined;
    colorName?: string | undefined;
    pathImage?: string | null | undefined;

    constructor(
        name: string,
        prices: ProductPrice[],
        categoryId: number,
        brandId: number,
        userId: number | null,
        barcode: string | null = null,
        internalCode: string | null = null,
        presentationId: number | null = null,
        colorId: number | null = null,
        state: boolean = true,
        id?: number,
        createdAt?: Date,
        updatedAt?: Date,
        categoryName?: string,
        brandName?: string,
        presentationName?: string,
        colorName?: string,
        pathImage?: string | null
    ) {
        this.id = id;
        this.name = name;
        this.barcode = barcode;
        this.internalCode = internalCode;
        this.presentationId = presentationId;
        this.colorId = colorId;
        this.prices = prices;
        this.state = state;
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.categoryName = categoryName;
        this.brandName = brandName;
        this.presentationName = presentationName;
        this.colorName = colorName;
        this.pathImage = pathImage ?? undefined;
    }
}
