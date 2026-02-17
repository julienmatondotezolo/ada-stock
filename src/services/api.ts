// Ada Stock API Service - Auto-detect backend URL
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('📡 Using environment API URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL + '/api/v1';
  }
  
  // Auto-detect based on current hostname
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    console.log('🌐 Detected hostname:', currentHost);
    
    if (currentHost === '192.168.0.188') {
      console.log('📡 Using network backend URL');
      return 'http://192.168.0.188:3055/api/v1';
    }
  }
  
  // Default to localhost
  console.log('📡 Using localhost backend URL');
  return 'http://localhost:3055/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Types matching backend models
export interface Category {
  id: string;
  name: string;
  name_nl?: string;
  name_fr?: string;
  name_en?: string;
  description?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  name_nl?: string;
  name_fr?: string;
  name_en?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  current_quantity: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  cost_price?: number;
  supplier_info?: any;
  storage_location?: string;
  expiry_tracking?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface CreateProductDto {
  category_id: string;
  name: string;
  name_nl?: string;
  name_fr?: string;
  name_en?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  current_quantity: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  cost_price?: number;
  supplier_info?: any;
  storage_location?: string;
  expiry_tracking?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface StockTransaction {
  product_id: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE' | 'TRANSFER';
  quantity_change: number;
  unit_cost?: number;
  reference_number?: string;
  notes?: string;
  performed_by?: string;
  metadata?: any;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data;
  }

  // Categories
  async getCategories(includeInactive = false): Promise<Category[]> {
    return this.request<Category[]>(`/categories?include_inactive=${includeInactive}`);
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Products
  async getProducts(params?: {
    category_id?: string;
    is_active?: boolean;
    low_stock_only?: boolean;
    out_of_stock_only?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Product[]>(endpoint);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: UpdateProductDto): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductQuantity(id: string, quantity: number): Promise<Product> {
    return this.request<Product>(`/products/${id}/quantity`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  async adjustProductQuantity(id: string, quantityChange: number, reason?: string, performedBy?: string): Promise<any> {
    return this.request<any>(`/products/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({
        quantity_change: quantityChange,
        reason,
        performed_by: performedBy,
      }),
    });
  }

  // Stock Transactions
  async recordTransaction(transactionData: StockTransaction): Promise<any> {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async stockIn(productId: string, quantity: number, unitCost?: number, referenceNumber?: string, notes?: string): Promise<any> {
    return this.request<any>('/transactions/stock-in', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
        unit_cost: unitCost,
        reference_number: referenceNumber,
        notes,
        performed_by: 'AdaStock App',
      }),
    });
  }

  async stockOut(productId: string, quantity: number, referenceNumber?: string, notes?: string): Promise<any> {
    return this.request<any>('/transactions/stock-out', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
        reference_number: referenceNumber,
        notes,
        performed_by: 'AdaStock App',
      }),
    });
  }

  // Dashboard
  async getDashboardSummary(): Promise<any> {
    return this.request<any>('/dashboard/summary');
  }

  async getCategorySummaries(): Promise<any[]> {
    return this.request<any[]>('/dashboard/categories');
  }

  async getRecentActivity(limit = 10): Promise<any[]> {
    return this.request<any[]>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getStockStatus(): Promise<any> {
    return this.request<any>('/dashboard/stock-status');
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const url = `${this.baseUrl}/health`;
    const response = await fetch(url);
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;