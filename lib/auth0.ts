import type { NextApiRequest, NextApiResponse } from "next";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Fragment, createElement } from "react";
import type { ReactNode } from "react";

type ClientModule = typeof import("@auth0/nextjs-auth0/client");
type ServerModule = typeof import("@auth0/nextjs-auth0");

const safeRequire = <T,>(modulePath: string): T | null => {
  try {
    // eslint-disable-next-line no-eval
    return eval("require")(modulePath) as T;
  } catch (error) {
    return null;
  }
};

const clientMod = safeRequire<ClientModule>("@auth0/nextjs-auth0/client");
const serverMod = safeRequire<ServerModule>("@auth0/nextjs-auth0");

const bypass =
  process.env.BYPASS_AUTH === "true" || process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

const mockUser = {
  email: process.env.BYPASS_AUTH_EMAIL ?? "developer@lation.com",
  name: process.env.BYPASS_AUTH_NAME ?? "Dev User",
  picture: "https://www.gravatar.com/avatar?d=mp",
  "https://lation.ai/claims/roles": ["Admin", "Recruiter"],
};

export const authBypassed = bypass;

export const UserProvider: ClientModule["UserProvider"] =
  clientMod?.UserProvider && !bypass
    ? clientMod.UserProvider
    : ({ children }: { children: ReactNode }) => createElement(Fragment, null, children);

export const useUser: ClientModule["useUser"] =
  clientMod?.useUser && !bypass
    ? clientMod.useUser
    : () => ({
        user: bypass ? mockUser : null,
        error: null,
        isLoading: false,
      });

type WithPageAuthRequired = ServerModule["withPageAuthRequired"];
type WithApiAuthRequired = ServerModule["withApiAuthRequired"];
type GetSession = ServerModule["getSession"];
type HandleAuth = ServerModule["handleAuth"];

const fallbackPageAuth: WithPageAuthRequired = (options: any) => {
  if (!options) {
    return async () => ({ props: {} });
  }

  if (typeof options === "function") {
    return async (ctx: GetServerSidePropsContext) =>
      ((await options(ctx)) as GetServerSidePropsResult<any>);
  }

  if (typeof options === "object" && typeof options.getServerSideProps === "function") {
    return async (ctx: GetServerSidePropsContext) =>
      ((await options.getServerSideProps(ctx)) as GetServerSidePropsResult<any>);
  }

  return async () => ({ props: {} });
};

const bypassPageAuth: WithPageAuthRequired = (options: any) => {
  const executor = fallbackPageAuth(options);
  return async (ctx: GetServerSidePropsContext) => {
    const result = await executor(ctx);
    if ("props" in result) {
      return {
        ...result,
        props: {
          ...(result.props as Record<string, unknown>),
          mockUser,
        },
      };
    }
    return result;
  };
};

const fallbackApiAuth: WithApiAuthRequired = (handler: any) => handler;

const fallbackGetSession: GetSession = async () =>
  bypass ? ({ user: mockUser } as any) : null;

const fallbackHandleAuth: HandleAuth =
  serverMod?.handleAuth ??
  (() => (req: NextApiRequest, res: NextApiResponse) => {
    if (bypass) {
      res.redirect(302, "/");
      return;
    }

    res
      .status(501)
      .json({ message: "@auth0/nextjs-auth0 is not installed. Auth routes are disabled." });
  });

export const withPageAuthRequired: WithPageAuthRequired = bypass
  ? bypassPageAuth
  : serverMod?.withPageAuthRequired ?? fallbackPageAuth;
export const withApiAuthRequired: WithApiAuthRequired = bypass
  ? (handler: any) => handler
  : serverMod?.withApiAuthRequired ?? fallbackApiAuth;
export const getSession: GetSession = bypass
  ? async () => ({ user: mockUser } as any)
  : serverMod?.getSession ?? fallbackGetSession;
export const handleAuth: HandleAuth = bypass
  ? () => (_req: NextApiRequest, res: NextApiResponse) => {
      res.redirect(302, "/");
    }
  : fallbackHandleAuth;
