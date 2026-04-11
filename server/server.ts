import app from "./app.js"
import { env } from "./config/env.js"
import { dbConnection } from "./config/db.js";

async function startServer() {
    try {
        //DB connection
        await dbConnection();

        // Start Server
        console.log("ENV CHECK:", process.env.PORT);
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });

        process.on("uncaughtException", (err) => {
            console.error("UNCAUGHT EXCEPTION:", err);
        });

        process.on("unhandledRejection", (err) => {
            console.error("UNHANDLED REJECTION:", err);
        });


    } catch (error) {
        console.error("Startup error:", error);

        process.exit(1);
    }
}

startServer();