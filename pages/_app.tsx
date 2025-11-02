import type { AppProps } from "next/app";
import { UserProvider } from "../lib/auth0";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const { user, ...rest } = pageProps as typeof pageProps & { user?: unknown };

  return (
    <UserProvider user={user}>
      <Component {...(rest as typeof pageProps)} />
    </UserProvider>
  );
}
