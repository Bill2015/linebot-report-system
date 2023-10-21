declare global {
    namespace NodeJS {
        interface ProcessEnv {
            STORAGE_TYPE: 'local'|'firebase'
            CHANNEL_ACCESS_TOKEN: string;
            CHANNEL_SECRET: string;
            PORT: string;
            ADMIN_UUID: string;
            TARGET_GROUP_UUID: string;

            // firebase
            FIREBASE_API_KEY: string;
            FIREBASE_AUTH_DOMAIN: string;
            FIREBASE_PROJECT_ID: string;
            FIREBASE_STORAGE_BUCKET: string;
            FIREBASE_MESSAGE_SENDER_ID: string;
            FIREBASE_APP_ID: string;
            FIREBASE_MEASUREMENT_ID: string;
        }
    }
}

export { };
