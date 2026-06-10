const app = require('./app');
const pool = require('./db/connection');

const PORT = process.env.PORT || 5000;

// Test DB connection on start
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connection successful! Database: " + (process.env.DB_NAME || 'bkads'));
    connection.release();
  } catch (error) {
    console.error("CRITICAL: MySQL connection failed! Check database credentials in .env", error.message);
    process.exit(1);
  }
}

testDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Express API Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
});
