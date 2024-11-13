import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = 3000;

const allowedOrigins = ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Cache-Control"],
  })
);

app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "Everything runs fine!" });
});

app.use((req: Request, res: Response) => {
  res.status(404).send("<h1>Not Found</h1>");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
