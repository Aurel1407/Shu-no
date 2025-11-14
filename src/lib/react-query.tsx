import { QueryClient, QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
    mutations: {
      retry: 1,
    },
  },
};

export const createQueryClient = (config?: QueryClientConfig) =>
  new QueryClient({
    ...defaultQueryClientConfig,
    ...config,
    defaultOptions: {
      ...defaultQueryClientConfig.defaultOptions,
      ...config?.defaultOptions,
      queries: {
        ...defaultQueryClientConfig.defaultOptions?.queries,
        ...config?.defaultOptions?.queries,
      },
      mutations: {
        ...defaultQueryClientConfig.defaultOptions?.mutations,
        ...config?.defaultOptions?.mutations,
      },
    },
  });

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
