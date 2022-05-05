const res = require('express/lib/response');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'skatepark',
    password: '123456',
    port: 5432
});

const nuevoSkater = async (payload) => {

    const newSkater = {
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
        values: payload
    }

    const result = await pool.query(newSkater);
    const skater = result.rows[0];
    return skater;
}

const getSkaters = async () => {
    const skater = {
        text: `SELECT * FROM skaters`
    }
    const result = await pool.query(skater);
    return result.rows;
}

const setSkaterStatus = async (id, estado) => {
    const setStatus = {
        text: `UPDATE skaters SET estado = $1 WHERE id = $2 RETURNING *`,
        values: [estado, id]
    }
    const result = await pool.query(setStatus);
    return result.rows[0];
}

const getSkater = async (email, password) => {
    const skater = {
        text: `SELECT * FROM skaters WHERE email = $1 AND password = $2`,
        values: [email, password]
    }
    const result = await pool.query(skater);
    return result.rows[0];
}

const updateSkater = async (email, consulta) => {
    console.log(email, consulta);
    const update = {
        text: `UPDATE skaters SET nombre = $1, password = $2, anos_experiencia = $3, especialidad = $4 WHERE email = $5 RETURNING *`,
        values: consulta.concat(email)
    }

    const result = await pool.query(update);
    console.log(result.rows[0]);
    return result.rows[0];
}

deleteSkater = async (email) => {
    console.log(email);
    const deleteSkater = {
        text: `DELETE FROM skaters WHERE email = $1 RETURNING *`,
        values: [email]
    }
    const skater = await pool.query(deleteSkater)
    return 'Skater eliminado';
}


module.exports = {
    nuevoSkater,
    getSkaters,
    setSkaterStatus,
    getSkater,
    updateSkater,
    deleteSkater
}