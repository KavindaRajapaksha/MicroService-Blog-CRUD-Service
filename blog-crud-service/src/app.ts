import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import postsRouter from "./routes/posts.routes";
import { notFoundHandler, errorHandler } from "./middleware/error";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/v1/posts", postsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;