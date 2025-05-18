// src/lib/api.ts
import { User, Product, CartItem, Purchase, PaginatedProductsResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiErrorResponse {
  msg?: string;
  message?: string;
  error?: string;
}

type ApiResponse<T = any> = T | { error: string; msg?: string } | PaginatedProductsResponse | { products: Product[] } | { cart: CartItem[] } | { item: CartItem, cart: CartItem[] } | { purchaseId: string; purchaseDetails: Purchase } | { message: string } ;


const getToken = (): string | null => localStorage.getItem('accessToken');
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

const setTokens = (accessToken: string, refreshToken?: string): void => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
};

const refreshTokenInternal = async (): Promise<string | null> => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentRefreshToken}` },
    });
    if (!response.ok) throw new Error('Token refresh failed');
    const data = await response.json();
    if (data.access_token) {
      setTokens(data.access_token);
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeTokens();
    window.dispatchEvent(new Event('auth-error'));
    return null;
  }
};

async function request<T = any>(
  endpoint: string,
  method: string = 'GET',
  body: any = null,
  isPublic: boolean = false,
  isFormData: boolean = false
): Promise<ApiResponse<T>> {
  let token = getToken();
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  // Authorization header is added for non-public requests if token exists
  if (!isPublic && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 && !isPublic && !endpoint.includes('/refresh')) {
    const newAccessToken = await refreshTokenInternal();
    if (newAccessToken) {
      // Re-create headers object for the new request
      const newHeaders: HeadersInit = {};
      if (!isFormData) newHeaders['Content-Type'] = 'application/json';
      newHeaders['Authorization'] = `Bearer ${newAccessToken}`;
      config.headers = newHeaders; // Assign the new headers object
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } else {
      return { error: 'Session expired. Please log in again.' };
    }
  }
  
  if (response.status === 401 && (isPublic || endpoint.includes('/refresh'))) {
      removeTokens();
      window.dispatchEvent(new Event('auth-error'));
      try {
        const errorData: ApiErrorResponse = await response.json();
        return { error: errorData.msg || errorData.message || 'Authentication failed.' };
      } catch {
        return { error: 'Authentication failed and error response was not JSON.' };
      }
  }

  if (!response.ok) {
    try {
      const errorData: ApiErrorResponse = await response.json();
      return { error: errorData.msg || errorData.message || `HTTP error! status: ${response.status}` };
    } catch (e) {
      return { error: `HTTP error! status: ${response.status}, response not JSON.` };
    }
  }

  if (response.status === 204) {
    return {} as T; // Or a specific success object like { message: "Success" } if backend sends it
  }

  try {
    const responseData = await response.json();
    return responseData as T; 
  } catch (e) {
    // This can happen if response.ok is true but body is not valid JSON (e.g. unexpected HTML error page)
    console.error("Failed to parse JSON response even though response.ok was true:", e, response);
    return { error: 'Failed to parse JSON response from server.' };
  }
}

export const api = {
  // Auth
  register: (userData: Omit<User, 'id' | 'createdAt'> & {password: string}) =>
    request<{ access_token: string; refresh_token: string; user: User }>('/register', 'POST', userData, true),
  login: (credentials: { email: string; password: string }) =>
    request<{ access_token: string; refresh_token: string; user: User }>('/login', 'POST', credentials, true),
  logout: () => request<any>('/logout', 'POST'),
  getMe: () => request<User>('/me', 'GET'),
  updateProfile: (profileData: Partial<User>) => request<User>('/profile', 'PUT', profileData),

  // Products
  getProducts: (category?: string, query?: string, page?: number, perPage?: number) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append('category', category);
    if (query) params.append('q', query);
    if (page) params.append('page', page.toString());
    if (perPage) params.append('per_page', perPage.toString());
    return request<PaginatedProductsResponse>(`/products?${params.toString()}`, 'GET', null, true);
  },
  getProductById: (id: string) => request<Product>(`/products/${id}`, 'GET', null, true),
  createProduct: (formData: FormData) =>
    request<Product>('/products', 'POST', formData, false, true),
  updateProduct: (id: string, formData: FormData) =>
    request<Product>(`/products/${id}`, 'PUT', formData, false, true),
  deleteProduct: (id: string) => request<{ msg: string }>(`/products/${id}`, 'DELETE'),
  getMyListings: () => request<{ products: Product[] }>('/my-listings', 'GET'),

  // Cart
  getCart: () => request<CartItem[]>('/cart', 'GET'),
  addToCart: (productId: number, quantity: number = 1) => // productId is number
    request<CartItem>('/cart', 'POST', { productId, quantity }),
  updateCartItem: (productId: number, quantity: number) => // productId is number
    request<{item: CartItem, cart: CartItem[]}>(`/cart/item/${productId}`, 'PUT', { quantity }),
  removeFromCart: (productId: number) => // productId is number
    request<{msg: string, cart: CartItem[] }>(`/cart/item/${productId}`, 'DELETE'),
  checkout: () => request<{ purchaseId: number; purchaseDetails: Purchase }>(`/cart/checkout`, 'POST'),

  // Purchases
  getPurchaseHistory: () => request<Purchase[]>('/purchases', 'GET'),

  // Wishlist
  getWishlist: () => request<Product[]>('/wishlist', 'GET'),
  addToWishlist: (productId: number) => request<{ msg: string, productId: number }>(`/wishlist/${productId}`, 'POST'),
  removeFromWishlist: (productId: number) => request<{ msg: string, productId: number }>(`/wishlist/${productId}`, 'DELETE'),

  utils: { setTokens, removeTokens, getToken, getRefreshToken, refreshToken: refreshTokenInternal }
};
