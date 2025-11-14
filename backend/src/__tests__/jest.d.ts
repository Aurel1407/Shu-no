// Jest type declarations for module path mapping
declare module '@/config/database' {
  export { AppDataSource } from '../../config/database';
}

declare module '@/entities/Product' {
  export { Product } from '../../entities/Product';
}

declare module '@/entities/User' {
  export { User } from '../../entities/User';
}

declare module '@/app' {
  import { Express } from 'express';
  const app: Express;
  export default app;
}

declare module '@/utils/auth' {
  export { generateToken } from '../../utils/auth';
}
