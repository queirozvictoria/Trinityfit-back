import pkg from 'pg';
const {Pool} = pkg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tcc- Sistema de treino',
    password: '1234',
    port: 5432,
});
export default pool;
