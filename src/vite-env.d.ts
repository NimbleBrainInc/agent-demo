/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AGENT_ID: string;
  readonly VITE_API_KEY: string;
  readonly VITE_AGENT_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
