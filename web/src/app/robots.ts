import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/create", "/browse", "/nft/"],
        disallow: ["/api/", "/my-nfts"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}