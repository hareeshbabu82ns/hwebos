interface ImportMetaEnv {
  readonly VITE_ENABLE_RAPTOR_MINI?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
