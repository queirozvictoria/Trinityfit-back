
import alunoModel from "../model/alunoModel.js";

const idValido = (id) =>
    typeof id === "string" && /^\d+$/.test(id) && Number(id) > 0;

// LISTAR TODOS OS ALUNOS
const getAll = async (req, res) => {
    try {
        const alunos = await alunoModel.getAll();

        return res.status(200).json(alunos);
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);

        return res.status(500).json({
            erro: "Erro ao buscar alunos."
        });
    }
};

// REALIZAR LOGIN DO ALUNO
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof senha !== "string" ||
            !senha
        ) {
            return res.status(400).json({
                erro: "E-mail e senha são obrigatórios."
            });
        }

        const aluno = await alunoModel.login(
            email.trim().toLowerCase(),
            senha
        );

        if (!aluno) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        return res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            usuario: {
                codigoUsuario: aluno.codigousuario,
                codigoAluno: aluno.codigoaluno,
                nome: aluno.nome,
                email: aluno.email,
                telefone: aluno.telefone
            }
        });

    } catch (error) {
        console.error("Erro ao realizar login:", error);

        return res.status(500).json({
            erro: "Não foi possível realizar o login."
        });
    }
};

// CADASTRAR ALUNO
const create = async (req, res) => {
    try {
        const {
            nome,
            email,
            telefone,
            dataNascimento,
            sexo,
            senha
        } = req.body;

        if (
            typeof nome !== "string" || !nome.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof senha !== "string" || !senha
        ) {
            return res.status(400).json({
                erro: "Nome, e-mail e senha são obrigatórios."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const alunoExistente =
            await alunoModel.findByEmail(emailNormalizado);

        if (alunoExistente) {
            return res.status(409).json({
                erro: "Já existe um aluno cadastrado com este e-mail."
            });
        }

        const aluno = await alunoModel.create(
            nome.trim(),
            emailNormalizado,
            telefone || null,
            dataNascimento || null,
            sexo || null,
            senha
        );

        return res.status(201).json({
            mensagem: "Aluno cadastrado com sucesso.",
            aluno
        });

    } catch (error) {
        console.error("Erro ao cadastrar aluno:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                erro: "Já existe um cadastro com esses dados."
            });
        }

        return res.status(500).json({
            erro: "Não foi possível cadastrar o aluno."
        });
    }
};

// ATUALIZAR ALUNO
const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "ID do aluno inválido."
            });
        }

        const {
            nome,
            email,
            telefone,
            dataNascimento,
            sexo
        } = req.body;

        if (
            typeof nome !== "string" || !nome.trim() ||
            typeof email !== "string" || !email.trim()
        ) {
            return res.status(400).json({
                erro: "Nome e e-mail são obrigatórios."
            });
        }

        const alunoAtualizado = await alunoModel.update(
            Number(id),
            nome.trim(),
            email.trim().toLowerCase(),
            telefone || null,
            dataNascimento || null,
            sexo || null
        );

        if (!alunoAtualizado) {
            return res.status(404).json({
                erro: "Aluno não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Aluno atualizado com sucesso.",
            aluno: alunoAtualizado
        });

    } catch (error) {
        console.error("Erro ao atualizar aluno:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                erro: "Este e-mail já está sendo utilizado."
            });
        }

        return res.status(500).json({
            erro: "Não foi possível atualizar o aluno."
        });
    }
};

// EXCLUIR ALUNO
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "ID do aluno inválido."
            });
        }

        const alunoRemovido = await alunoModel.remove(Number(id));

        if (!alunoRemovido) {
            return res.status(404).json({
                erro: "Aluno não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Aluno removido com sucesso."
        });

    } catch (error) {
        console.error("Erro ao excluir aluno:", error);

        return res.status(500).json({
            erro: "Não foi possível excluir o aluno."
        });
    }
};

export default {
    getAll,
    login,
    create,
    update,
    remove
};
