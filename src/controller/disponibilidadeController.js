
import disponibilidadeModel from "../model/disponibilidadeModel.js";

const idValido = (valor) =>
    /^\d+$/.test(String(valor ?? "")) && Number(valor) > 0;

const getAll = async (req, res) => {
    try {
        const disponibilidades = await disponibilidadeModel.getAll();
        return res.status(200).json(disponibilidades);
    } catch (error) {
        console.error("Erro ao buscar disponibilidades:", error);
        return res.status(500).json({
            erro: "Erro ao buscar disponibilidades."
        });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const disponibilidade = await disponibilidadeModel.getById(Number(id));

        if (!disponibilidade) {
            return res.status(404).json({
                erro: "Disponibilidade não encontrada."
            });
        }

        return res.status(200).json(disponibilidade);
    } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
        return res.status(500).json({
            erro: "Erro ao buscar disponibilidade."
        });
    }
};

const getByPersonal = async (req, res) => {
    try {
        const { codigoPersonal } = req.params;

        if (!idValido(codigoPersonal)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
            });
        }

        const disponibilidades =
            await disponibilidadeModel.findByPersonal(Number(codigoPersonal));

        return res.status(200).json(disponibilidades);
    } catch (error) {
        console.error("Erro ao buscar disponibilidades do personal:", error);
        return res.status(500).json({
            erro: "Erro ao buscar disponibilidades do personal."
        });
    }
};

const getAtivasByPersonal = async (req, res) => {
    try {
        const { codigoPersonal } = req.params;

        if (!idValido(codigoPersonal)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
            });
        }

        const disponibilidades =
            await disponibilidadeModel.findAtivasByPersonal(Number(codigoPersonal));

        return res.status(200).json(disponibilidades);
    } catch (error) {
        console.error("Erro ao buscar disponibilidades ativas:", error);
        return res.status(500).json({
            erro: "Erro ao buscar disponibilidades ativas."
        });
    }
};

const validarDados = ({
    codigoPersonal,
    dataDisponibilidade,
    horarioInicio,
    horarioFim
}) => {
    if (
        !idValido(codigoPersonal) ||
        !dataDisponibilidade ||
        !horarioInicio ||
        !horarioFim
    ) {
        return "Personal, data e horários válidos são obrigatórios.";
    }

    if (horarioInicio >= horarioFim) {
        return "O horário inicial deve ser anterior ao horário final.";
    }

    return null;
};

const create = async (req, res) => {
    try {
        const {
            codigoPersonal,
            dataDisponibilidade,
            horarioInicio,
            horarioFim,
            status
        } = req.body;

        const erroValidacao = validarDados({
            codigoPersonal,
            dataDisponibilidade,
            horarioInicio,
            horarioFim
        });

        if (erroValidacao) {
            return res.status(400).json({ erro: erroValidacao });
        }

        if (status !== undefined && typeof status !== "boolean") {
            return res.status(400).json({
                erro: "O status deve ser verdadeiro ou falso."
            });
        }

        const disponibilidade = await disponibilidadeModel.create(
            Number(codigoPersonal),
            dataDisponibilidade,
            horarioInicio,
            horarioFim,
            status ?? true
        );

        return res.status(201).json(disponibilidade);
    } catch (error) {
        console.error("Erro ao criar disponibilidade:", error);
        return res.status(500).json({
            erro: "Erro ao criar disponibilidade."
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const {
            codigoPersonal,
            dataDisponibilidade,
            horarioInicio,
            horarioFim,
            status
        } = req.body;

        const erroValidacao = validarDados({
            codigoPersonal,
            dataDisponibilidade,
            horarioInicio,
            horarioFim
        });

        if (erroValidacao) {
            return res.status(400).json({ erro: erroValidacao });
        }

        if (typeof status !== "boolean") {
            return res.status(400).json({
                erro: "O status deve ser verdadeiro ou falso."
            });
        }

        const existente = await disponibilidadeModel.getById(Number(id));

        if (!existente) {
            return res.status(404).json({
                erro: "Disponibilidade não encontrada."
            });
        }

        const disponibilidade = await disponibilidadeModel.update(
            Number(id),
            Number(codigoPersonal),
            dataDisponibilidade,
            horarioInicio,
            horarioFim,
            status
        );

        return res.status(200).json(disponibilidade);
    } catch (error) {
        console.error("Erro ao atualizar disponibilidade:", error);
        return res.status(500).json({
            erro: "Erro ao atualizar disponibilidade."
        });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({ erro: "ID inválido." });
        }

        const disponibilidade =
            await disponibilidadeModel.remove(Number(id));

        if (!disponibilidade) {
            return res.status(404).json({
                erro: "Disponibilidade não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Disponibilidade removida com sucesso."
        });
    } catch (error) {
        console.error("Erro ao excluir disponibilidade:", error);
        return res.status(500).json({
            erro: "Erro ao excluir disponibilidade."
        });
    }
};

export default {
    getAll,
    getById,
    getByPersonal,
    getAtivasByPersonal,
    create,
    update,
    remove
};
