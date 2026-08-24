/**
 * Cloudflare Worker entry point
 * Serves the SPA static assets bundled in ./dist
 */
interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
