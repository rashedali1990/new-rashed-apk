import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // M3U Proxy endpoint
  m3u: router({
    // Fetch M3U playlist from external URL via proxy
    fetch: publicProcedure
      .input(z.object({
        url: z.string().url(),
        username: z.string().optional(),
        password: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          };

          // Add basic auth if credentials provided
          if (input.username && input.password) {
            const credentials = Buffer.from(`${input.username}:${input.password}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }

          const response = await axios.get(input.url, {
            headers,
            timeout: 30000,
            maxRedirects: 5,
          });

          return {
            success: true,
            content: response.data,
            contentType: response.headers['content-type'] || 'text/plain',
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[M3U Proxy] Error fetching:', errorMessage);
          throw new Error(`Failed to fetch M3U playlist: ${errorMessage}`);
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
