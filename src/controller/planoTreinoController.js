import planoTreinoModel from "../model/planoTreinoModel.js";
import agendamentoModel from "../model/agendamentoModel.js";

const idValido = (valor) =>
    valor !== undefined &&
    valor !== null &&
    String(valor).trim() !== "" &&
    Number.isInteger(Number(valor)) &&
    Number(valor) > 0;

const informado = (valor) =>
    valor !== undefined && valor !== null && String(valor).trim() !== "";

// Trata erros do banco comuns ao criar e atualizar
const responderErroBanco = (error, res, mensagemPadrao) => {
    if (error.code === "22001") {
        return res.status(400).json({
            erro: "A descrição do plano é grande demais para a coluna do banco. Altere descricaoPlanoTreino para TEXT ou reduza o texto."
        });
    }

    if (error.code === "23503") {
        return res.status(400).json({
            erro: "O aluno, o personal ou o agendamento informado não existe."
        });
    }

    if (error.code === "23505") {
        return res.status(409).json({
            erro: "Já existe um plano de treino para este agendamento."
        });
    }

    return res.status(500).json({ erro: mensagemPadrao });
};

// Valida os dados recebidos e devolve { erro } ou { dados }
const validarCorpo = async (body, codigoPlanoAtual = null) => {
    const { codigoAluno, codigoPersonal, codigoAgendamento, descricaoPlanoTreino } =
        body;

    if (!idValido(codigoAluno)) {
        return { erro: "Informe um código de aluno válido." };
    }

    if (!idValido(codigoPersonal)) {
        return { erro: "Informe um código de personal válido." };
    }

    let agendamentoNumero = null;

    // O agendamento é opcional
    if (informado(codigoAgendamento)) {
        if (!idValido(codigoAgendamento)) {
            return { erro: "Código do agendamento inválido." };
        }

        agendamentoNumero = Number(codigoAgendamento);

        const agendamento = await agendamentoModel.getById(agendamentoNumero);

        if (!agendamento) {
            return { erro: "O agendamento informado não existe." };
        }

        if (Number(agendamento.codigoAluno) !== Number(codigoAluno)) {
            return { erro: "O agendamento informado não pertence a este aluno." };
        }

        const outroPlano =
            await planoTreinoModel.findByAgendamento(agendamentoNumero);

        if (
            outroPlano &&
            Number(outroPlano.codigoPlanoTreino) !== Number(codigoPlanoAtual)
        ) {
            return {
                erro: "Já existe um plano de treino para este agendamento.",
                status: 409
            };
        }
    }

    return {
        dados: {
            codigoAluno: Number(codigoAluno),
            codigoPersonal: Number(codigoPersonal),
            codigoAgendamento: agendamentoNumero,
            descricao: descricaoPlanoTreino?.trim() || null
        }
    };
};

// LISTAR TODOS OS PLANOS
const getAll = async (req, res) => {
    try {
        const planos = await planoTreinoModel.getAll();
        return res.status(200).json(planos);
    } catch (error) {
        console.error("Erro ao buscar planos de treino:", error);
        return res.status(500).json({
            erro: "Erro ao buscar planos de treino."
        });
    }
};

// BUSCAR PLANO POR ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do plano de treino inválido."
            });
        }

        const plano = await planoTreinoModel.getById(Number(id));

        if (!plano) {
            return res.status(404).json({
                erro: "Plano de treino não encontrado."
            });
        }

        return res.status(200).json(plano);
    } catch (error) {
        console.error("Erro ao buscar plano de treino:", error);
        return res.status(500).json({
            erro: "Erro ao buscar plano de treino."
        });
    }
};

// BUSCAR PLANO PELO AGENDAMENTO
const getByAgendamento = async (req, res) => {
    try {
        const { codigoAgendamento } = req.params;

        if (!idValido(codigoAgendamento)) {
            return res.status(400).json({
                erro: "Código do agendamento inválido."
            });
        }

        const plano = await planoTreinoModel.findByAgendamento(
            Number(codigoAgendamento)
        );

        if (!plano) {
            return res.status(404).json({
                erro: "Nenhum plano de treino encontrado para este agendamento."
            });
        }

        return res.status(200).json(plano);
    } catch (error) {
        console.error("Erro ao buscar plano pelo agendamento:", error);
        return res.status(500).json({
            erro: "Erro ao buscar plano de treino."
        });
    }
};

// BUSCAR PLANOS DO ALUNO
const getByAluno = async (req, res) => {
    try {
        const { codigoAluno } = req.params;

        if (!idValido(codigoAluno)) {
            return res.status(400).json({
                erro: "Código do aluno inválido."
            });
        }

        const planos = await planoTreinoModel.findByAluno(
            Number(codigoAluno)
        );

        return res.status(200).json(planos);
    } catch (error) {
        console.error("Erro ao buscar planos do aluno:", error);
        return res.status(500).json({
            erro: "Erro ao buscar planos de treino do aluno."
        });
    }
};

// BUSCAR PLANOS DO PERSONAL
const getByPersonal = async (req, res) => {
    try {
        const { codigoPersonal } = req.params;

        if (!idValido(codigoPersonal)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
            });
        }

        const planos = await planoTreinoModel.findByPersonal(
            Number(codigoPersonal)
        );

        return res.status(200).json(planos);
    } catch (error) {
        console.error("Erro ao buscar planos do personal:", error);
        return res.status(500).json({
            erro: "Erro ao buscar planos de treino do personal."
        });
    }
};

// CRIAR PLANO DE TREINO
const create = async (req, res) => {
    try {
        const validacao = await validarCorpo(req.body);

        if (validacao.erro) {
            return res
                .status(validacao.status ?? 400)
                .json({ erro: validacao.erro });
        }

        const { codigoAluno, codigoPersonal, codigoAgendamento, descricao } =
            validacao.dados;

        const plano = await planoTreinoModel.create(
            codigoAluno,
            codigoPersonal,
            codigoAgendamento,
            descricao
        );

        return res.status(201).json(plano);
    } catch (error) {
        console.error("Erro ao criar plano de treino:", error);
        return responderErroBanco(error, res, "Erro ao criar plano de treino.");
    }
};

// ATUALIZAR PLANO DE TREINO
const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do plano de treino inválido."
            });
        }

        const codigoPlano = Number(id);

        const planoExistente = await planoTreinoModel.getById(codigoPlano);

        if (!planoExistente) {
            return res.status(404).json({
                erro: "Plano de treino não encontrado."
            });
        }

        const validacao = await validarCorpo(req.body, codigoPlano);

        if (validacao.erro) {
            return res
                .status(validacao.status ?? 400)
                .json({ erro: validacao.erro });
        }

        const { codigoAluno, codigoPersonal, codigoAgendamento, descricao } =
            validacao.dados;

        const plano = await planoTreinoModel.update(
            codigoPlano,
            codigoAluno,
            codigoPersonal,
            codigoAgendamento,
            descricao
        );

        if (!plano) {
            return res.status(404).json({
                erro: "Não foi possível atualizar o plano de treino."
            });
        }

        return res.status(200).json(plano);
    } catch (error) {
        console.error("Erro ao atualizar plano de treino:", error);
        return responderErroBanco(
            error,
            res,
            "Erro ao atualizar plano de treino."
        );
    }
};

// EXCLUIR PLANO DE TREINO
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do plano de treino inválido."
            });
        }

        const plano = await planoTreinoModel.remove(Number(id));

        if (!plano) {
            return res.status(404).json({
                erro: "Plano de treino não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Plano de treino removido com sucesso."
        });
    } catch (error) {
        console.error("Erro ao excluir plano de treino:", error);
        return res.status(500).json({
            erro: "Erro ao excluir plano de treino."
        });
    }
};

export default {
    getAll,
    getById,
    getByAgendamento,
    getByAluno,
    getByPersonal,
    create,
    update,
    remove
};