import express from "express";
import personalController from "../controller/personalController.js";

const router = express.Router();

router.get("/", personalController.getAll);
router.get("/:id", personalController.getById);

router.post("/login", personalController.login);
router.post("/", personalController.create);

router.put("/:id", personalController.update);
router.delete("/:id", personalController.remove);

export default router;