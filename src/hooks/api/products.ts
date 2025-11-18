import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { apiCall } from "@/lib/api-utils";
import { API_URLS } from "@/config/api";
import { Product } from "@/types/product";

type ProductsQueryData = Product[];

type ProductsQueryOptions<TData = ProductsQueryData> = UseQueryOptions<
  ProductsQueryData,
  Error,
  TData,
  QueryKey
>;

type ProductQueryOptions<TData = Product> = UseQueryOptions<Product | null, Error, TData, QueryKey>;

const normalizeProductsResponse = (response: unknown): Product[] => {
  if (!response) {
    return [];
  }

  const responseObj = response as { data?: unknown };
  if (Array.isArray(responseObj.data)) {
    return responseObj.data as Product[];
  }

  if (Array.isArray(response)) {
    return response as Product[];
  }

  return [];
};

const normalizeProductResponse = (response: unknown): Product | null => {
  if (!response) {
    return null;
  }

  const responseObj = response as { data?: unknown };
  if (responseObj.data) {
    return (responseObj.data as Product) ?? null;
  }

  return response as Product;
};

export const productKeys = {
  all: ["products"] as const,
  list: (filters?: Record<string, unknown>) => ["products", "list", filters] as const,
  detail: (id: number | string | undefined) => ["products", "detail", id] as const,
  adminList: () => ["products", "admin"] as const,
};

export const useProductsQuery = <TData = ProductsQueryData>(
  options?: ProductsQueryOptions<TData>
) => {
  return useQuery<ProductsQueryData, Error, TData>({
    queryKey: options?.queryKey ?? productKeys.list(),
    queryFn: async () => {
      const response = await apiCall(API_URLS.PRODUCTS, {
        showErrorToast: false,
        context: "Produits (public)",
      });

      return normalizeProductsResponse(response);
    },
    ...options,
  });
};

export const useProductDetailQuery = <TData = Product | null>(
  id: number | string | undefined,
  options?: ProductQueryOptions<TData>
) => {
  return useQuery<Product | null, Error, TData>({
    enabled: Boolean(id) && (options?.enabled ?? true),
    queryKey: options?.queryKey ?? productKeys.detail(id),
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const response = await apiCall(`${API_URLS.PRODUCTS}/${id}`, {
        showErrorToast: false,
        context: `Produit ${id}`,
      });

      return normalizeProductResponse(response);
    },
    ...options,
  });
};
