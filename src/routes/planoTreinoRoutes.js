import express from "express";

import planoTreinoController
    from "../controller/planoTreinoController.js";

const router = express.Router();


// ==========================================
// LISTAR TODOS
// ==========================================
router.get(
    "/",
    planoTreinoController.getAll
);


// ==========================================
// BUSCAR POR ID
// ==========================================
router.get(
    "/:id",
    planoTreinoController.getById
);


// ==========================================
// BUSCAR PELO AGENDAMENTO
// ==========================================
router.get(
    "/agendamento/:codigoAgendamento",
    planoTreinoController.getByAgendamento
);


// ==========================================
// BUSCAR PLANOS DO ALUNO
// ==========================================
router.get(
    "/aluno/:codigoAluno",
    planoTreinoController.getByAluno
);


// ==========================================
// CRIAR
// ==========================================
router.post(
    "/",
    planoTreinoController.create
);


// ==========================================
// ATUALIZAR
// ==========================================
router.put(
    "/:id",
    planoTreinoController.update
);


// ==========================================
// EXCLUIR
// ==========================================
router.delete(
    "/:id",
    planoTreinoController.remove
);


export default router;