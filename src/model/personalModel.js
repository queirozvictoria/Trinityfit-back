import pool from "../config/db.js";

// LISTAR TODOS OS PERSONAIS
const getAll = async () => {
    const result = await pool.query(`
        SELECT
            p.codigopersonal AS "codigoPersonal",
            p.datacadastro AS "dataCadastro",
            u.codigousuario AS "codigoUsuario",
            u.nome AS "nome",
            u.email AS "email",
            u.telefone AS "telefone",
            u.datanascimentousuario AS "dataNascimentoUsuario",
            u.sexousuario AS "sexoUsuario"
        FROM public.personal p
        INNER JOIN public.usuario u
            ON p.codigousuario = u.codigousuario
        ORDER BY p.codigopersonal
    `);

    return result.rows;
};

// BUSCAR PERSONAL PELO ID
const getById = async (id) => {
    const result = await pool.query(`
        SELECT
            p.codigopersonal AS "codigoPersonal",
            p.datacadastro AS "dataCadastro",
            u.codigousuario AS "codigoUsuario",
            u.nome AS "nome",
            u.email AS "email",
            u.telefone AS "telefone",
            u.datanascimentousuario AS "dataNascimentoUsuario",
            u.sexousuario AS "sexoUsuario"
        FROM public.personal p
        INNER JOIN public.usuario u
            ON p.codigousuario = u.codigousuario
        WHERE p.codigopersonal = $1
    `, [id]);

    return result.rows[0] ?? null;
};

// BUSCAR PERSONAL PELO E-MAIL
const findByEmail = async (email) => {
    const result = await pool.query(`
        SELECT
            p.codigopersonal AS "codigoPersonal",
            p.datacadastro AS "dataCadastro",
            u.codigousuario AS "codigoUsuario",
            u.nome AS "nome",
            u.email AS "email",
            u.telefone AS "telefone",
            u.datanascimentousuario AS "dataNascimentoUsuario",
            u.sexousuario AS "sexoUsuario"
        FROM public.personal p
        INNER JOIN public.usuario u
            ON p.codigousuario = u.codigousuario
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
    `, [email]);

    return result.rows[0] ?? null;
};

// REALIZAR LOGIN DO PERSONAL
const login = async (email, senha) => {
    const result = await pool.query(`
        SELECT
            p.codigopersonal AS "codigoPersonal",
            u.codigousuario AS "codigoUsuario",
            u.nome AS "nome",
            u.email AS "email",
            u.telefone AS "telefone"
        FROM public.personal p
        INNER JOIN public.usuario u
            ON p.codigousuario = u.codigousuario
        WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
          AND u.senhausuario = $2
    `, [email, senha]);

    return result.rows[0] ?? null;
};

// CADASTRAR PERSONAL E USUÁRIO
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
            senha
        ]);

        const usuario = usuarioResult.rows[0];

        const personalResult = await client.query(`
            INSERT INTO public.personal (
                codigousuario,
                datacadastro
            )
            VALUES ($1, CURRENT_DATE)
            RETURNING
                codigopersonal,
                codigousuario,
                datacadastro
        `, [usuario.codigousuario]);

        await client.query("COMMIT");
        transacaoIniciada = false;

        return {
            codigoPersonal: personalResult.rows[0].codigopersonal,
            codigoUsuario: usuario.codigousuario,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            dataNascimentoUsuario: usuario.datanascimentousuario,
            sexoUsuario: usuario.sexousuario,
            dataCadastro: personalResult.rows[0].datacadastro
        };
    } catch (error) {
        if (transacaoIniciada) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Erro ao desfazer cadastro do personal:",
                    rollbackError.message
                );
            }
        }

        throw error;
    } finally {
        client.release();
    }
};

// ATUALIZAR PERSONAL
const update = async (
    codigoPersonal,
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
            FROM public.personal
            WHERE codigopersonal = $6
        )
        RETURNING
            codigousuario AS "codigoUsuario",
            nome AS "nome",
            email AS "email",
            telefone AS "telefone",
            datanascimentousuario AS "dataNascimentoUsuario",
            sexousuario AS "sexoUsuario"
    `, [
        nome.trim(),
        email.trim().toLowerCase(),
        telefone || null,
        dataNascimento || null,
        sexo || null,
        codigoPersonal
    ]);

    return result.rows[0] ?? null;
};

// REMOVER PERSONAL
const remove = async (codigoPersonal) => {
    const client = await pool.connect();
    let transacaoIniciada = false;

    try {
        await client.query("BEGIN");
        transacaoIniciada = true;

        const personalResult = await client.query(`
            DELETE FROM public.personal
            WHERE codigopersonal = $1
            RETURNING codigopersonal, codigousuario
        `, [codigoPersonal]);

        if (personalResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transacaoIniciada = false;
            return null;
        }

        await client.query("COMMIT");
        transacaoIniciada = false;

        return {
            codigoPersonal: personalResult.rows[0].codigopersonal,
            codigoUsuario: personalResult.rows[0].codigousuario
        };
    } catch (error) {
        if (transacaoIniciada) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Erro ao desfazer exclusão do personal:",
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
    getById,
    findByEmail,
    login,
    create,
    update,
    remove
};