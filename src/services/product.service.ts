import { Product, ProductUpdateData } from '@/types/product';

class ProductService {
  private baseUrl = '/api/products';

  async getProducts(): Promise<Product[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }

  async updateProduct(data: ProductUpdateData): Promise<Product> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const result = await response.json();
    return result.product;
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  async createProduct(data: {
    nom: string;
    prix: number;
    image?: string;
    description?: string;
    stock?: number;
  }): Promise<Product> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    const result = await response.json();
    return result.product;
  }
}

export const productService = new ProductService();