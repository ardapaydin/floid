import express from "express";
const router = express.Router();
import idRouter from "./id";

router.use(idRouter);

export default router;
