import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

//Middlewares
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("API is running 🚀");
})

// plug all routes at once
app.use("/api", routes);

export default app;