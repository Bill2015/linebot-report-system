declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CHANNEL_ACCESS_TOKEN: string;
            CHANNEL_SECRET: string;
            PORT: string;
            ADMIN_UUID: string;
            TARGET_GROUP_UUID: string;
        }
    }
}

export { };
