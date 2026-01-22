import { OfflineProduct, OfflineProductCreateData, Product } from '@/types/product';

class OfflineProductService {
  private baseUrl = '/api/offline-products';

  async getOfflineProducts(): Promise<OfflineProduct[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch offline products');
    }
    return response.json();
  }

  async createOfflineProduct(data: OfflineProductCreateData): Promise<OfflineProduct> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to create offline product');
    }

    const result = await response.json();
    return result.product;
  }

  async updateOfflineProduct(id: number, data: Partial<OfflineProductCreateData & { status: string }>): Promise<OfflineProduct> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });

    if (!response.ok) {
      throw new Error('Failed to update offline product');
    }

    const result = await response.json();
    return result.product;
  }

  async deleteOfflineProduct(id: number): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      throw new Error('Failed to delete offline product');
    }
  }

  async approveOfflineProduct(id: number): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      throw new Error('Failed to approve offline product');
    }

    const result = await response.json();
    return result.product;
  }
}

export const offlineProductService = new OfflineProductService();