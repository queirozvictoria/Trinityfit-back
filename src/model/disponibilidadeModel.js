import pool from "../config/db.js";

// LISTAR TODAS AS DISPONIBILIDADES
const getAll = async () => {
    const result = await pool.query(`
        SELECT
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
        FROM Disponibilidade
        ORDER BY dataDisponibilidade ASC, horarioInicio ASC
    `);

    return result.rows;
};

// BUSCAR DISPONIBILIDADE POR ID
const getById = async (id) => {
    const result = await pool.query(`
        SELECT
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
        FROM Disponibilidade
        WHERE codigoDisponibilidade = $1
    `, [id]);

    return result.rows[0] ?? null;
};

// BUSCAR DISPONIBILIDADES DO PERSONAL
const findByPersonal = async (codigoPersonal) => {
    const result = await pool.query(`
        SELECT
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
        FROM Disponibilidade
        WHERE codigoPersonal = $1
        ORDER BY dataDisponibilidade ASC, horarioInicio ASC
    `, [codigoPersonal]);

    return result.rows;
};

// BUSCAR DISPONIBILIDADES ATIVAS DO PERSONAL
const findAtivasByPersonal = async (codigoPersonal) => {
    const result = await pool.query(`
        SELECT
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
        FROM Disponibilidade
        WHERE codigoPersonal = $1
          AND status = TRUE
        ORDER BY dataDisponibilidade ASC, horarioInicio ASC
    `, [codigoPersonal]);

    return result.rows;
};

// CRIAR DISPONIBILIDADE
const create = async (
    codigoPersonal,
    dataDisponibilidade,
    horarioInicio,
    horarioFim,
    status
) => {
    const result = await pool.query(`
        INSERT INTO Disponibilidade (
            codigoPersonal,
            dataDisponibilidade,
            horarioInicio,
            horarioFim,
            status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
    `, [
        codigoPersonal,
        dataDisponibilidade,
        horarioInicio,
        horarioFim,
        status
    ]);

    return result.rows[0] ?? null;
};

// ATUALIZAR DISPONIBILIDADE
const update = async (
    id,
    codigoPersonal,
    dataDisponibilidade,
    horarioInicio,
    horarioFim,
    status
) => {
    const result = await pool.query(`
        UPDATE Disponibilidade
        SET
            codigoPersonal = $1,
            dataDisponibilidade = $2,
            horarioInicio = $3,
            horarioFim = $4,
            status = $5
        WHERE codigoDisponibilidade = $6
        RETURNING
            codigoDisponibilidade AS "codigoDisponibilidade",
            codigoPersonal AS "codigoPersonal",
            dataDisponibilidade AS "dataDisponibilidade",
            horarioInicio AS "horarioInicio",
            horarioFim AS "horarioFim",
            status
    `, [
        codigoPersonal,
        dataDisponibilidade,
        horarioInicio,
        horarioFim,
        status,
        id
    ]);

    return result.rows[0] ?? null;
};

// EXCLUIR DISPONIBILIDADE
const remove = async (id) => {
    const result = await pool.query(`
        DELETE FROM Disponibilidade
        WHERE codigoDisponibilidade = $1
        RETURNING codigoDisponibilidade
    `, [id]);

    return result.rows[0] ?? null;
};

export default {
    getAll,
    getById,
    findByPersonal,
    findAtivasByPersonal,
    create,
    update,
    remove
};