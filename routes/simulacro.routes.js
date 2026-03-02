import { Router } from "express";
import { migration } from "../services/migrationServices.js";

const router = Router();

router.post("/migrate", async (req, res) => {
  try {
    const result = await migration();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Migration failed",
      error: error.message,
    });
  }
});

export default router;