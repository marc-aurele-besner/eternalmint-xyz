/** @type {import('next').NextConfig} */
const nextConfig = {
  // wagmi's baseAccount connector pulls @coinbase/cdp-sdk, which lazily
  // imports optional @x402/* peers. Turbopack resolves those statically and
  // fails the build unless the SDK is left external.
  serverExternalPackages: ["@coinbase/cdp-sdk", "@base-org/account"],
  images: {
    dangerouslyAllowSVG: true, //@dev note this is to allow svg to display
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.autonomys.xyz",
        port: "",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default nextConfig;
