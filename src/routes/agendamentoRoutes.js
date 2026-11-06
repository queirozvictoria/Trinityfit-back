import express from "express";
import agendamentoController from "../controller/agendamentoController.js";

const router = express.Router();

// LISTAR TODOS OS AGENDAMENTOS
router.get("/", agendamentoController.getAll);

// BUSCAR AGENDAMENTOS DO ALUNO
router.get("/aluno/:codigoAluno", agendamentoController.getByAluno);

// BUSCAR AGENDAMENTOS DO PERSONAL
router.get("/personal/:codigoPersonal", agendamentoController.getByPersonal);

// BUSCAR AGENDAMENTO POR ID
router.get("/:id", agendamentoController.getById);

// CRIAR AGENDAMENTO
router.post("/", agendamentoController.create);

// ATUALIZAR AGENDAMENTO
router.put("/:id", agendamentoController.update);

// ATUALIZAR SOMENTE O STATUS (ex.: cancelar)
router.patch("/:id/status", agendamentoController.updateStatus);

// EXCLUIR AGENDAMENTO
router.delete("/:id", agendamentoController.remove);

export default router;