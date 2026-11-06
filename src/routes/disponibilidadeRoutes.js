import express from "express";

import disponibilidadeController
from "../controller/disponibilidadeController.js";

const router = express.Router();

// ==========================================
// LISTAR TODAS AS DISPONIBILIDADES
// ==========================================
router.get(
"/",
disponibilidadeController.getAll
);

// ==========================================
// BUSCAR DISPONIBILIDADES DO PERSONAL
// ==========================================
router.get(
"/personal/:codigoPersonal",
disponibilidadeController.getByPersonal
);

// ==========================================
// BUSCAR DISPONIBILIDADES ATIVAS DO PERSONAL
// ==========================================
router.get(
"/personal/:codigoPersonal/ativas",
disponibilidadeController.getAtivasByPersonal
);

// ==========================================
// BUSCAR DISPONIBILIDADE POR ID
// ==========================================
router.get(
"/:id",
disponibilidadeController.getById
);

// ==========================================
// CRIAR DISPONIBILIDADE
// ==========================================
router.post(
"/",
disponibilidadeController.create
);

// ==========================================
// ATUALIZAR DISPONIBILIDADE
// ==========================================
router.put(
"/:id",
disponibilidadeController.update
);

// ==========================================
// EXCLUIR DISPONIBILIDADE
// ==========================================
router.delete(
"/:id",
disponibilidadeController.remove
);

export default router;
