import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // Avoids re-entering the "build" npm script (which itself runs this
  // OpenNext build) — see build:next in package.json.
  buildCommand: "npm run build:next",
};
