import pool from "../config/db.js";

const COLUNAS = `
            codigoAgendamento AS "codigoAgendamento",
            codigoAluno AS "codigoAluno",
            codigoPersonal AS "codigoPersonal",
            dataAgendamento AS "dataAgendamento",
            horarioAgendamento AS "horarioAgendamento",
            statusAgendamento AS "statusAgendamento"`;

// Libera de novo o horário na tabela Disponibilidade
const liberarHorario = async (db, ag) => {
    if (!ag) return;
    await db.query(`
        UPDATE Disponibilidade
        SET status = TRUE
        WHERE codigoPersonal = $1
          AND dataDisponibilidade = $2
          AND horarioInicio = $3
    `, [ag.codigoPersonal, ag.dataAgendamento, ag.horarioAgendamento]);
};

// LISTAR TODOS OS AGENDAMENTOS
const getAll = async () => {
    const result = await pool.query(`
        SELECT ${COLUNAS}
        FROM Agendamento
        ORDER BY dataAgendamento DESC, horarioAgendamento DESC
    `);

    return result.rows;
};

// BUSCAR AGENDAMENTO POR ID
const getById = async (id) => {
    const result = await pool.query(`
        SELECT ${COLUNAS}
        FROM Agendamento
        WHERE codigoAgendamento = $1
    `, [id]);

    return result.rows[0] ?? null;
};

// BUSCAR AGENDAMENTOS DO ALUNO
const findByAluno = async (codigoAluno) => {
    const result = await pool.query(`
        SELECT ${COLUNAS}
        FROM Agendamento
        WHERE codigoAluno = $1
        ORDER BY dataAgendamento DESC, horarioAgendamento DESC
    `, [codigoAluno]);

    return result.rows;
};

// BUSCAR AGENDAMENTOS DO PERSONAL
const findByPersonal = async (codigoPersonal) => {
    const result = await pool.query(`
        SELECT ${COLUNAS}
        FROM Agendamento
        WHERE codigoPersonal = $1
        ORDER BY dataAgendamento DESC, horarioAgendamento DESC
    `, [codigoPersonal]);

    return result.rows;
};

// CRIAR AGENDAMENTO (reserva o horário na Disponibilidade)
const create = async (
    codigoAluno,
    codigoPersonal,
    dataAgendamento,
    horarioAgendamento,
    statusAgendamento
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // trava o horário livre para evitar dois alunos no mesmo horário
        const livre = await client.query(`
            SELECT codigoDisponibilidade
            FROM Disponibilidade
            WHERE codigoPersonal = $1
              AND dataDisponibilidade = $2
              AND horarioInicio = $3
              AND status = TRUE
            FOR UPDATE
        `, [codigoPersonal, dataAgendamento, horarioAgendamento]);

        if (livre.rows.length === 0) {
            const erro = new Error("Horário indisponível.");
            erro.code = "HORARIO_INDISPONIVEL";
            throw erro;
        }

        await client.query(`
            UPDATE Disponibilidade
            SET status = FALSE
            WHERE codigoDisponibilidade = $1
        `, [livre.rows[0].codigodisponibilidade]);

        const result = await client.query(`
            INSERT INTO Agendamento (
                codigoAluno,
                codigoPersonal,
                dataAgendamento,
                horarioAgendamento,
                statusAgendamento
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${COLUNAS}
        `, [
            codigoAluno,
            codigoPersonal,
            dataAgendamento,
            horarioAgendamento,
            statusAgendamento
        ]);

        await client.query("COMMIT");
        return result.rows[0] ?? null;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// ATUALIZAR AGENDAMENTO
const update = async (
    id,
    codigoAluno,
    codigoPersonal,
    dataAgendamento,
    horarioAgendamento,
    statusAgendamento
) => {
    const result = await pool.query(`
        UPDATE Agendamento
        SET
            codigoAluno = $1,
            codigoPersonal = $2,
            dataAgendamento = $3,
            horarioAgendamento = $4,
            statusAgendamento = $5
        WHERE codigoAgendamento = $6
        RETURNING ${COLUNAS}
    `, [
        codigoAluno,
        codigoPersonal,
        dataAgendamento,
        horarioAgendamento,
        statusAgendamento,
        id
    ]);

    return result.rows[0] ?? null;
};

// ATUALIZAR SOMENTE O STATUS (ex.: cancelar -> libera o horário)
const updateStatus = async (id, statusAgendamento) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            UPDATE Agendamento
            SET statusAgendamento = $1
            WHERE codigoAgendamento = $2
            RETURNING ${COLUNAS}
        `, [statusAgendamento, id]);

        const ag = result.rows[0] ?? null;

        if (ag && statusAgendamento === "CANCELADO") {
            await liberarHorario(client, ag);
        }

        await client.query("COMMIT");
        return ag;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// EXCLUIR AGENDAMENTO (libera o horário)
const remove = async (id) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            DELETE FROM Agendamento
            WHERE codigoAgendamento = $1
            RETURNING ${COLUNAS}
        `, [id]);

        const ag = result.rows[0] ?? null;
        await liberarHorario(client, ag);

        await client.query("COMMIT");
        return ag;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export default {
    getAll,
    getById,
    findByAluno,
    findByPersonal,
    create,
    update,
    updateStatus,
    remove
};