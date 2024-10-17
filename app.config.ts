import { defineConfig } from '@tanstack/start/config';
import TsConfigPathsPlugin from 'vite-tsconfig-paths';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  vite: {
    plugins: () => [
      TsConfigPathsPlugin(),
      EnvironmentPlugin([
        "COMBINED_ORAMA_ENDPOINT",
        "COMBINED_ORAMA_API_KEY",
      ]),
    ],
  },
  deployment: {
    preset: "bun"
  },
});