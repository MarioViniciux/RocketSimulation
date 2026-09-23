import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera `.next/standalone` (servidor `server.js` + só as dependências
  // necessárias), usado pela imagem Docker de produção — ver `DEPLOY.md`.
  output: "standalone",
};

export default nextConfig;
