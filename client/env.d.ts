/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_ENABLE_FEATURE: boolean;
    readonly VITE_PORT: number;
}
