const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL === 'postgres://user:password@hostname:5432/dbname?sslmode=require') {
  console.error('❌ Error: DATABASE_URL must be correctly set in backend/.env for NeonDB');
  process.exit(1);
}

console.log('📡 Connecting to NeonDB (PostgreSQL)...');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false, // Set to console.log to see SQL queries
  define: {
    underscored: true,
    timestamps: true,
  },
});

sequelize.authenticate()
  .then(() => console.log('✅ Connected to NeonDB (PostgreSQL) successfully'))
  .catch(err => {
    console.error('❌ NeonDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = sequelize;
