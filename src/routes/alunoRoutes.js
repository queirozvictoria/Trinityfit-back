
import express from "express";
import alunoController from "../controller/alunoController.js";

const router = express.Router();

router.get("/", alunoController.getAll);
router.post("/login", alunoController.login);
router.post("/", alunoController.create);
router.put("/:id", alunoController.update);
router.delete("/:id", alunoController.remove);

export default router;
