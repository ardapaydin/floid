import "dotenv/config";
import express from "express";
const app = express();

console.log("[SERVER] Starting");
if (!process.env.PORT) throw new Error("PORT is not defined in .env");

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

app.use(
  express.json({
    limit: "20mb",
  })
);
app.use(express.urlencoded({ extended: true }));

app.disable("x-powered-by");

import router from "./src/routes";
app.use("/", router);
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) return next(err);
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  });
});

app.listen(process.env.PORT, () => {
  console.log("[SERVER] Running");
});
