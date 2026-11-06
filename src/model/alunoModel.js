import pool from "../config/db.js";

// LISTAR TODOS OS ALUNOS
const getAll = async () => {
    const result = await pool.query(`
        SELECT
            a.codigoaluno,
            u.codigousuario,
            u.nome,
            u.email,
            u.telefone,
            u.datanascimentousuario,
            u.sexousuario,
            a.datacadastro
        FROM public.aluno a
        INNER JOIN public.usuario u
            ON u.codigousuario = a.codigousuario
        ORDER BY a.codigoaluno
    `);

    return result.rows;
};

// BUSCAR ALUNO PELO E-MAIL
const findByEmail = async (email) => {
    const result = await pool.query(`
        SELECT
            a.codigoaluno,
            u.codigousuario,
            u.nome,
            u.email,
            u.telefone,
            u.datanascimentousuario,
            u.sexousuario,
            a.datacadastro
        FROM public.aluno a
        INNER JOIN public.usuario u
            ON u.codigousuario = a.codigousuario
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
    `, [email]);

    return result.rows[0] ?? null;
};

// REALIZAR LOGIN DO ALUNO
const login = async (email, senha) => {
    const result = await pool.query(`
        SELECT
            a.codigoaluno,
            u.codigousuario,
            u.nome,
            u.email,
            u.telefone,
            u.senhausuario
        FROM public.aluno a
        INNER JOIN public.usuario u
            ON u.codigousuario = a.codigousuario
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
          AND u.senhausuario = $2
    `, [email, senha]);

    if (result.rows.length === 0) {
        return null;
    }

    const aluno = result.rows[0];

    delete aluno.senhausuario;

    return aluno;
};

// CADASTRAR ALUNO E USUÁRIO
const create = async (
    nome,
    email,
    telefone,
    dataNascimento,
    sexo,
    senha
) => {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query("BEGIN");
        transacaoIniciada = true;

        const usuarioResult = await client.query(`
            INSERT INTO public.usuario (
                nome,
                email,
                telefone,
                datanascimentousuario,
                sexousuario,
                senhausuario
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING codigousuario
        `, [
            nome.trim(),
            email.trim().toLowerCase(),
            telefone || null,
            dataNascimento || null,
            sexo || null,
            senha
        ]);

        const codigoUsuario =
            usuarioResult.rows[0].codigousuario;

        const alunoResult = await client.query(`
            INSERT INTO public.aluno (
                codigousuario,
                datacadastro
            )
            VALUES ($1, CURRENT_DATE)
            RETURNING codigoaluno, codigousuario, datacadastro
        `, [codigoUsuario]);

        await client.query("COMMIT");
        transacaoIniciada = false;

        return {
            ...alunoResult.rows[0],
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            telefone: telefone || null,
            dataNascimento: dataNascimento || null,
            sexo: sexo || null
        };
    } catch (error) {
        if (transacaoIniciada) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Erro ao desfazer cadastro do aluno:",
                    rollbackError.message
                );
            }
        }

        throw error;
    } finally {
        client.release();
    }
};

// ATUALIZAR ALUNO
const update = async (
    id,
    nome,
    email,
    telefone,
    dataNascimento,
    sexo
) => {
    const result = await pool.query(`
        UPDATE public.usuario
        SET
            nome = $1,
            email = $2,
            telefone = $3,
            datanascimentousuario = $4,
            sexousuario = $5
        WHERE codigousuario = (
            SELECT codigousuario
            FROM public.aluno
            WHERE codigoaluno = $6
        )
        RETURNING
            codigousuario,
            nome,
            email,
            telefone,
            datanascimentousuario,
            sexousuario
    `, [
        nome.trim(),
        email.trim().toLowerCase(),
        telefone || null,
        dataNascimento || null,
        sexo || null,
        id
    ]);

    return result.rows[0] ?? null;
};

// EXCLUIR ALUNO
const remove = async (id) => {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query("BEGIN");
        transacaoIniciada = true;

        const alunoResult = await client.query(`
            DELETE FROM public.aluno
            WHERE codigoaluno = $1
            RETURNING codigoaluno
        `, [id]);

        if (alunoResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transacaoIniciada = false;
            return null;
        }

        await client.query("COMMIT");
        transacaoIniciada = false;

        return alunoResult.rows[0];
    } catch (error) {
        if (transacaoIniciada) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Erro ao desfazer exclusão do aluno:",
                    rollbackError.message
                );
            }
        }

        throw error;
    } finally {
        client.release();
    }
};

export default {
    getAll,
    findByEmail,
    login,
    create,
    update,
    remove
};