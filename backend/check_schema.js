const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkSchema() {
  try {
    const results = await sequelize.query(
      "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method';",
      { type: QueryTypes.SELECT }
    );
    console.log('Order Schema:', JSON.stringify(results, null, 2));
    
    // Also check the ENUM values if it's a custom type
    const enumQuery = "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'enum_orders_payment_method';";
    const enums = await sequelize.query(enumQuery, { type: QueryTypes.SELECT });
    console.log('ENUM Values:', JSON.stringify(enums, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking schema:', err);
    process.exit(1);
  }
}

checkSchema();
