import type { ComponentType, ReactNode } from "react";

declare module "@auth0/nextjs-auth0" {
  export const withPageAuthRequired: any;
  export const withApiAuthRequired: any;
  export const getSession: any;
  export const handleAuth: any;
}

declare module "@auth0/nextjs-auth0/client" {
  export const UserProvider: ComponentType<{ children: ReactNode }>;
  export const useUser: () => { user: any; error: any; isLoading: boolean };
}
