import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'khampha_tphcm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối
pool.getConnection()
  .then(conn => {
    console.log('✅ Kết nối MySQL thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
  });

export default pool;
