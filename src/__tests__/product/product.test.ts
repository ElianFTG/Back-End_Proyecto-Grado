import { CreateProduct } from '../../application/product/CreateProduct';
import { UpdateProduct } from '../../application/product/UpdateProduct';
import { FindByIdProduct } from '../../application/product/FindByIdProduct';
import { GetAllProducts } from '../../application/product/GetAllProducts';
import { UpdateStateProduct } from '../../application/product/UpdateStateProduct';
import { Product, ProductPrice } from '../../domain/product/Product';
import { ProductRepository, PaginatedProductsResult } from '../../domain/product/ProductRepository';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const makeRepo = (overrides: Partial<ProductRepository> = {}): ProductRepository => ({
  getAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
  create: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  updateState: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makePrices = (): ProductPrice[] => [
  { priceTypeId: 1, price: 10.5 },
  { priceTypeId: 2, price: 9.0 },
];

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  new Product(
    'Producto Test',
    makePrices(),
    1,
    1,
    10,
    'BARCODE001',
    'INT001',
    1,
    1,
    true,
    1,
    undefined,
    undefined,
    'Categoria A',
    'Marca X',
    'Caja',
    'Rojo',
    null,
  );

const makePaginatedResult = (products: Product[] = []): PaginatedProductsResult => ({
  data: products,
  total: products.length,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(products.length / 10),
});

// ─── Product domain model ─────────────────────────────────────────────────────

describe('Product domain model', () => {
  it('crea un producto con todos los campos', () => {
    const product = makeProduct();
    expect(product.name).toBe('Producto Test');
    expect(product.prices).toHaveLength(2);
    expect(product.state).toBe(true);
    expect(product.categoryId).toBe(1);
    expect(product.brandId).toBe(1);
  });

  it('crea producto con valores por defecto', () => {
    const product = new Product('Agua', makePrices(), 2, 3, null);
    expect(product.barcode).toBeNull();
    expect(product.internalCode).toBeNull();
    expect(product.presentationId).toBeNull();
    expect(product.colorId).toBeNull();
    expect(product.state).toBe(true);
    expect(product.id).toBeUndefined();
  });

  it('ProductPrice tiene priceTypeId y price', () => {
    const price: ProductPrice = { priceTypeId: 1, price: 15.0, priceTypeName: 'Mayorista' };
    expect(price.priceTypeId).toBe(1);
    expect(price.price).toBe(15.0);
    expect(price.priceTypeName).toBe('Mayorista');
  });
});

// ─── CreateProduct ────────────────────────────────────────────────────────────

describe('CreateProduct', () => {
  it('crea un producto correctamente', async () => {
    const product = makeProduct();
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(product) });
    const uc = new CreateProduct(repo);
    const result = await uc.run('Producto Test', makePrices(), 1, 1, 10, 'BARCODE001', 'INT001', 1, 1);
    expect(result).toEqual(product);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it('crea producto sin campos opcionales (barcode, internalCode, etc.)', async () => {
    const product = new Product('Agua', makePrices(), 2, 3, 5);
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(product) });
    const uc = new CreateProduct(repo);
    const result = await uc.run('Agua', makePrices(), 2, 3, 5);
    expect(result).toEqual(product);
    // Verifica que los nulos se pasen correctamente
    const call = (repo.create as jest.Mock).mock.calls[0][0] as Product;
    expect(call.barcode).toBeNull();
    expect(call.internalCode).toBeNull();
    expect(call.presentationId).toBeNull();
    expect(call.colorId).toBeNull();
  });

  it('retorna null si el repo falla', async () => {
    const repo = makeRepo({ create: jest.fn().mockResolvedValue(null) });
    const uc = new CreateProduct(repo);
    expect(await uc.run('X', makePrices(), 1, 1, 1)).toBeNull();
  });

  it('construye Product con los datos correctos', async () => {
    const repo = makeRepo({ create: jest.fn().mockImplementation(p => Promise.resolve(p)) });
    const uc = new CreateProduct(repo);
    await uc.run('Jugo', makePrices(), 3, 4, 7, 'BC123', 'IC456', 2, 3);
    const created = (repo.create as jest.Mock).mock.calls[0][0] as Product;
    expect(created.name).toBe('Jugo');
    expect(created.categoryId).toBe(3);
    expect(created.brandId).toBe(4);
    expect(created.barcode).toBe('BC123');
    expect(created.presentationId).toBe(2);
    expect(created.colorId).toBe(3);
  });
});

// ─── UpdateProduct ────────────────────────────────────────────────────────────

describe('UpdateProduct', () => {
  it('actualiza un producto correctamente', async () => {
    const updated = makeProduct();
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateProduct(repo);
    const result = await uc.run(1, { name: 'Nuevo Nombre' }, 5);
    expect(result).toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Nuevo Nombre' }, 5);
  });

  it('retorna null si el producto no existe', async () => {
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(null) });
    const uc = new UpdateProduct(repo);
    expect(await uc.run(999, { name: 'X' }, 1)).toBeNull();
  });

  it('puede actualizar solo precios', async () => {
    const updated = makeProduct();
    const repo = makeRepo({ update: jest.fn().mockResolvedValue(updated) });
    const uc = new UpdateProduct(repo);
    await uc.run(1, { prices: [{ priceTypeId: 1, price: 20 }] }, 1);
    expect(repo.update).toHaveBeenCalledWith(1, { prices: [{ priceTypeId: 1, price: 20 }] }, 1);
  });
});

// ─── FindByIdProduct ──────────────────────────────────────────────────────────

describe('FindByIdProduct', () => {
  it('retorna el producto si existe', async () => {
    const product = makeProduct();
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(product) });
    const uc = new FindByIdProduct(repo);
    expect(await uc.run(1)).toEqual(product);
  });

  it('retorna null si no existe el producto', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) });
    const uc = new FindByIdProduct(repo);
    expect(await uc.run(999)).toBeNull();
  });
});

// ─── GetAllProducts ───────────────────────────────────────────────────────────

describe('GetAllProducts', () => {
  it('retorna productos paginados sin filtros', async () => {
    const paginatedResult = makePaginatedResult([makeProduct()]);
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(paginatedResult) });
    const uc = new GetAllProducts(repo);
    const result = await uc.run({});
    expect(result).toEqual(paginatedResult);
    expect(result.total).toBe(1);
  });

  it('filtra por categoría', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetAllProducts(repo);
    await uc.run({ categoryId: 2 });
    expect(repo.getAll).toHaveBeenCalledWith({ categoryId: 2 });
  });

  it('filtra por marca', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetAllProducts(repo);
    await uc.run({ brandId: 3 });
    expect(repo.getAll).toHaveBeenCalledWith({ brandId: 3 });
  });

  it('filtra por estado activo', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetAllProducts(repo);
    await uc.run({ state: true });
    expect(repo.getAll).toHaveBeenCalledWith({ state: true });
  });

  it('aplica paginación', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetAllProducts(repo);
    await uc.run({ page: 2, limit: 5 });
    expect(repo.getAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });

  it('filtra por búsqueda textual', async () => {
    const repo = makeRepo({ getAll: jest.fn().mockResolvedValue(makePaginatedResult()) });
    const uc = new GetAllProducts(repo);
    await uc.run({ search: 'Agua' });
    expect(repo.getAll).toHaveBeenCalledWith({ search: 'Agua' });
  });
});

// ─── UpdateStateProduct ───────────────────────────────────────────────────────

describe('UpdateStateProduct', () => {
  it('actualiza el estado del producto', async () => {
    const repo = makeRepo({ updateState: jest.fn().mockResolvedValue(undefined) });
    const uc = new UpdateStateProduct(repo);
    await uc.run(1, 5);
    expect(repo.updateState).toHaveBeenCalledWith(1, 5);
  });

  it('llama al repo con los ids correctos', async () => {
    const repo = makeRepo({ updateState: jest.fn().mockResolvedValue(undefined) });
    const uc = new UpdateStateProduct(repo);
    await uc.run(42, 99);
    expect(repo.updateState).toHaveBeenCalledWith(42, 99);
  });
});
