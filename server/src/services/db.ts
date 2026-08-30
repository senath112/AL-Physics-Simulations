import mysql from 'mysql2/promise';

/**
 * Creates and exposes a MySQL connection pool using server environment variables.
 * Does not hardcode credentials.
 */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'physicsbysenath',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
