const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.addColumn('addresses', 'house_no', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    console.log('✅ house_no column added (or already existed)');
  } catch (e) {
    console.warn('⚠️ house_no column may already exist:', e.message);
  }

  try {
    await queryInterface.addColumn('addresses', 'locality', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
    console.log('✅ locality column added (or already existed)');
  } catch (e) {
    console.warn('⚠️ locality column may already exist:', e.message);
  }

  process.exit(0);
})();
