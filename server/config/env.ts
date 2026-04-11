import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
    const value = process.env[key];

    if (!value && required) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value as string;
}

export const env = {
    PORT: Number(getEnv("PORT")),
    MONGO_URI: getEnv("MONGO_URI"),
    NODE_ENV: getEnv("NODE_ENV", false) || "development",
};