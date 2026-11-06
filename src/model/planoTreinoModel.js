import pool from "../config/db.js";

const COLUNAS = `
    pt.codigoPlanoTreino AS "codigoPlanoTreino",
    pt.codigoAluno AS "codigoAluno",
    pt.codigoPersonal AS "codigoPersonal",
    pt.codigoAgendamento AS "codigoAgendamento",
    pt.descricaoPlanoTreino AS "descricaoPlanoTreino",
    a.dataAgendamento AS "dataAgendamento",
    a.horarioAgendamento AS "horarioAgendamento",
    a.statusAgendamento AS "statusAgendamento"`;

const ORIGEM = `
    FROM PlanoTreino pt
    LEFT JOIN Agendamento a
        ON a.codigoAgendamento = pt.codigoAgendamento`;

// LISTAR TODOS OS PLANOS
const getAll = async () => {
    const result = await pool.query(`
        SELECT ${COLUNAS} ${ORIGEM}
        ORDER BY pt.codigoPlanoTreino DESC
    `);

    return result.rows;
};

// BUSCAR PLANO POR ID
const getById = async (id) => {
    const result = await pool.query(`
        SELECT ${COLUNAS} ${ORIGEM}
        WHERE pt.codigoPlanoTreino = $1
    `, [id]);

    return result.rows[0] ?? null;
};

// BUSCAR PLANO PELO AGENDAMENTO
const findByAgendamento = async (codigoAgendamento) => {
    const result = await pool.query(`
        SELECT ${COLUNAS} ${ORIGEM}
        WHERE pt.codigoAgendamento = $1
    `, [codigoAgendamento]);

    return result.rows[0] ?? null;
};

// BUSCAR PLANOS DO ALUNO
const findByAluno = async (codigoAluno) => {
    const result = await pool.query(`
        SELECT ${COLUNAS} ${ORIGEM}
        WHERE pt.codigoAluno = $1
        ORDER BY pt.codigoPlanoTreino DESC
    `, [codigoAluno]);

    return result.rows;
};

// BUSCAR PLANOS CRIADOS PELO PERSONAL
const findByPersonal = async (codigoPersonal) => {
    const result = await pool.query(`
        SELECT ${COLUNAS} ${ORIGEM}
        WHERE pt.codigoPersonal = $1
        ORDER BY pt.codigoPlanoTreino DESC
    `, [codigoPersonal]);

    return result.rows;
};

// CRIAR PLANO DE TREINO
const create = async (
    codigoAluno,
    codigoPersonal,
    codigoAgendamento,
    descricaoPlanoTreino
) => {
    const result = await pool.query(`
        INSERT INTO PlanoTreino (
            codigoAluno,
            codigoPersonal,
            codigoAgendamento,
            descricaoPlanoTreino
        )
        VALUES ($1, $2, $3, $4)
        RETURNING codigoPlanoTreino AS "codigoPlanoTreino"
    `, [
        codigoAluno,
        codigoPersonal,
        codigoAgendamento,
        descricaoPlanoTreino
    ]);

    return getById(result.rows[0].codigoPlanoTreino);
};

// ATUALIZAR PLANO DE TREINO
const update = async (
    id,
    codigoAluno,
    codigoPersonal,
    codigoAgendamento,
    descricaoPlanoTreino
) => {
    const result = await pool.query(`
        UPDATE PlanoTreino
        SET
            codigoAluno = $1,
            codigoPersonal = $2,
            codigoAgendamento = $3,
            descricaoPlanoTreino = $4
        WHERE codigoPlanoTreino = $5
        RETURNING codigoPlanoTreino AS "codigoPlanoTreino"
    `, [
        codigoAluno,
        codigoPersonal,
        codigoAgendamento,
        descricaoPlanoTreino,
        id
    ]);

    if (!result.rows[0]) return null;

    return getById(result.rows[0].codigoPlanoTreino);
};

// EXCLUIR PLANO DE TREINO
const remove = async (id) => {
    const result = await pool.query(`
        DELETE FROM PlanoTreino
        WHERE codigoPlanoTreino = $1
        RETURNING codigoPlanoTreino
    `, [id]);

    return result.rows[0] ?? null;
};

export default {
    getAll,
    getById,
    findByAgendamento,
    findByAluno,
    findByPersonal,
    create,
    update,
    remove
};