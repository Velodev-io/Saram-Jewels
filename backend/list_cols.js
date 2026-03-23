const sequelize = require('./config/database');
const { Sequelize } = require('sequelize');

async function listColumns() {
  console.log('📡 Attempting to query NeonDB...');
  try {
    await sequelize.authenticate();
    console.log('✅ Connected.');
    const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Columns in products:', results.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during query:', err.message);
    process.exit(1);
  }
}
listColumns();
