import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});
