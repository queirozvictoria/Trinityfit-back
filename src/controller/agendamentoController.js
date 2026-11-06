import agendamentoModel from "../model/agendamentoModel.js";

const idValido = (id) =>
    typeof id === "string" && /^\d+$/.test(id) && Number(id) > 0;

const getAll = async (req, res) => {
    try {
        const agendamentos = await agendamentoModel.getAll();
        return res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return res.status(500).json({
            erro: "Erro ao buscar agendamentos."
        });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const agendamento = await agendamentoModel.getById(id);

        if (!agendamento) {
            return res.status(404).json({
                erro: "Agendamento não encontrado."
            });
        }

        return res.status(200).json(agendamento);
    } catch (error) {
        console.error("Erro ao buscar agendamento:", error);
        return res.status(500).json({
            erro: "Erro ao buscar agendamento."
        });
    }
};

const getByAluno = async (req, res) => {
    try {
        const { codigoAluno } = req.params;

        if (!idValido(codigoAluno)) {
            return res.status(400).json({ erro: "Código do aluno inválido." });
        }

        const agendamentos =
            await agendamentoModel.findByAluno(codigoAluno);

        return res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro ao buscar agendamentos do aluno:", error);
        return res.status(500).json({
            erro: "Erro ao buscar agendamentos do aluno."
        });
    }
};

const getByPersonal = async (req, res) => {
    try {
        const { codigoPersonal } = req.params;

        if (!idValido(codigoPersonal)) {
            return res.status(400).json({ erro: "Código do personal inválido." });
        }

        const agendamentos =
            await agendamentoModel.findByPersonal(codigoPersonal);

        return res.status(200).json(agendamentos);
    } catch (error) {
        console.error("Erro ao buscar agendamentos do personal:", error);
        return res.status(500).json({
            erro: "Erro ao buscar agendamentos do personal."
        });
    }
};

const create = async (req, res) => {
    try {
        const {
            codigoAluno,
            codigoPersonal,
            dataAgendamento,
            horarioAgendamento,
            statusAgendamento
        } = req.body;

        if (
            !idValido(String(codigoAluno ?? "")) ||
            !idValido(String(codigoPersonal ?? "")) ||
            !dataAgendamento ||
            !horarioAgendamento
        ) {
            return res.status(400).json({
                erro: "Aluno, personal, data e horário válidos são obrigatórios."
            });
        }

        const agendamento = await agendamentoModel.create(
            Number(codigoAluno),
            Number(codigoPersonal),
            dataAgendamento,
            horarioAgendamento,
            statusAgendamento || "PENDENTE"
        );

        return res.status(201).json(agendamento);
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);

        if (error.code === "HORARIO_INDISPONIVEL") {
            return res.status(409).json({
                erro: "Este horário não está mais disponível."
            });
        }

        return res.status(500).json({
            erro: "Erro ao criar agendamento."
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID do agendamento inválido." });
        }

        const {
            codigoAluno,
            codigoPersonal,
            dataAgendamento,
            horarioAgendamento,
            statusAgendamento
        } = req.body;

        if (
            !idValido(String(codigoAluno ?? "")) ||
            !idValido(String(codigoPersonal ?? "")) ||
            !dataAgendamento ||
            !horarioAgendamento ||
            !statusAgendamento
        ) {
            return res.status(400).json({
                erro: "Aluno, personal, data, horário e status são obrigatórios."
            });
        }

        const existente = await agendamentoModel.getById(id);

        if (!existente) {
            return res.status(404).json({
                erro: "Agendamento não encontrado."
            });
        }

        const agendamento = await agendamentoModel.update(
            Number(id),
            Number(codigoAluno),
            Number(codigoPersonal),
            dataAgendamento,
            horarioAgendamento,
            statusAgendamento
        );

        return res.status(200).json(agendamento);
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar agendamento."
        });
    }
};

// ATUALIZAR SOMENTE O STATUS (ex.: CANCELADO)
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = String(req.body?.statusAgendamento ?? "").trim();

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID do agendamento inválido." });
        }

        if (!status || status.length > 50) {
            return res.status(400).json({
                erro: "Informe um status válido (até 50 caracteres)."
            });
        }

        const agendamento = await agendamentoModel.updateStatus(
            Number(id),
            status.toUpperCase()
        );

        if (!agendamento) {
            return res.status(404).json({
                erro: "Agendamento não encontrado."
            });
        }

        return res.status(200).json(agendamento);
    } catch (error) {
        console.error("Erro ao atualizar status do agendamento:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar status do agendamento."
        });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID do agendamento inválido." });
        }

        const agendamento = await agendamentoModel.remove(id);

        if (!agendamento) {
            return res.status(404).json({
                erro: "Agendamento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Agendamento removido com sucesso."
        });
    } catch (error) {
        console.error("Erro ao excluir agendamento:", error);

        if (error.code === "23503") {
            return res.status(409).json({
                erro: "Este agendamento possui plano de treino. Cancele-o em vez de excluir."
            });
        }

        return res.status(500).json({
            erro: "Erro ao excluir agendamento."
        });
    }
};

export default {
    getAll,
    getById,
    getByAluno,
    getByPersonal,
    create,
    update,
    updateStatus,
    remove
};