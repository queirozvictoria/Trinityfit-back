import personalModel from "../model/personalModel.js";

const idValido = (id) =>
    typeof id === "string" && /^\d+$/.test(id) && Number(id) > 0;

// LISTAR TODOS OS PERSONAIS
const getAll = async (req, res) => {
    try {
        const personais = await personalModel.getAll();
        return res.status(200).json(personais);
    } catch (error) {
        console.error("Erro ao buscar personais:", error);
        return res.status(500).json({
            erro: "Erro ao buscar personais."
        });
    }
};

// BUSCAR PERSONAL PELO ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
            });
        }

        const personal = await personalModel.getById(Number(id));

        if (!personal) {
            return res.status(404).json({
                erro: "Personal não encontrado."
            });
        }

        return res.status(200).json(personal);
    } catch (error) {
        console.error("Erro ao buscar personal:", error);
        return res.status(500).json({
            erro: "Erro ao buscar personal."
        });
    }
};

// REALIZAR LOGIN DO PERSONAL
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

        const personal = await personalModel.login(
            email.trim().toLowerCase(),
            senha
        );

        if (!personal) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        return res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            usuario: {
                codigoUsuario: personal.codigoUsuario,
                codigoPersonal: personal.codigoPersonal,
                nome: personal.nome,
                email: personal.email,
                telefone: personal.telefone
            }
        });
    } catch (error) {
        console.error("Erro ao realizar login do personal:", error);

        return res.status(500).json({
            erro: "Não foi possível realizar o login."
        });
    }
};

// CADASTRAR PERSONAL
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
            !telefone ||
            !dataNascimento ||
            !sexo ||
            typeof senha !== "string" || !senha
        ) {
            return res.status(400).json({
                erro: "Todos os campos são obrigatórios."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const personalExistente =
            await personalModel.findByEmail(emailNormalizado);

        if (personalExistente) {
            return res.status(409).json({
                erro: "Este e-mail já está cadastrado."
            });
        }

        const personal = await personalModel.create(
            nome.trim(),
            emailNormalizado,
            telefone,
            dataNascimento,
            sexo,
            senha
        );

        return res.status(201).json({
            mensagem: "Personal cadastrado com sucesso.",
            personal
        });
    } catch (error) {
        console.error("Erro ao criar personal:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                erro: "Este e-mail já está cadastrado."
            });
        }

        return res.status(500).json({
            erro: "Não foi possível cadastrar o personal."
        });
    }
};

// ATUALIZAR PERSONAL
const update = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
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
            typeof email !== "string" || !email.trim() ||
            !telefone ||
            !dataNascimento ||
            !sexo
        ) {
            return res.status(400).json({
                erro: "Todos os campos são obrigatórios."
            });
        }

        const personal = await personalModel.update(
            Number(id),
            nome.trim(),
            email.trim().toLowerCase(),
            telefone,
            dataNascimento,
            sexo
        );

        if (!personal) {
            return res.status(404).json({
                erro: "Personal não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Personal atualizado com sucesso.",
            personal
        });
    } catch (error) {
        console.error("Erro ao atualizar personal:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                erro: "Este e-mail já está sendo utilizado."
            });
        }

        return res.status(500).json({
            erro: "Não foi possível atualizar o personal."
        });
    }
};

// EXCLUIR PERSONAL
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!idValido(id)) {
            return res.status(400).json({
                erro: "Código do personal inválido."
            });
        }

        const personal = await personalModel.remove(Number(id));

        if (!personal) {
            return res.status(404).json({
                erro: "Personal não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Personal removido com sucesso."
        });
    } catch (error) {
        console.error("Erro ao excluir personal:", error);
        return res.status(500).json({
            erro: "Não foi possível excluir o personal."
        });
    }
};

export default {
    getAll,
    getById,
    login,
    create,
    update,
    remove
};