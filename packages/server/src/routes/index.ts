import express from "express";
const router = express.Router();

import AuthRouter from "./auth";
router.use("/auth", AuthRouter);

export default router;
