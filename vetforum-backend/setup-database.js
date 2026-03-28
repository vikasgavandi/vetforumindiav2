const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔍 Checking MySQL connection...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
    
    // Connect to MySQL server (without database selection)
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server successfully!');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'vetforumindia';
    console.log(`\n📦 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' is ready`);
    
    // Use the database
    await connection.query(`USE ${dbName}`);
    
    // Check if tables already exist
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length > 0) {
      console.log(`\n⚠️  Database already has ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('\n❓ Do you want to recreate the schema? (This will drop all existing data)');
      console.log('   To recreate: node setup-database.js --force');
      
      if (!process.argv.includes('--force')) {
        console.log('\n✅ Database setup complete (using existing schema)');
        await connection.end();
        return;
      }
      
      console.log('\n⚠️  Dropping all existing tables...');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ All tables dropped');
    }
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'DATABASE_SCHEMA.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.log(`\n❌ Schema file not found: ${schemaPath}`);
      console.log('Please ensure DATABASE_SCHEMA.sql exists in the backend directory');
      await connection.end();
      return;
    }
    
    console.log('\n📄 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔧 Applying database schema...');
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => {
        // Remove comments starting with --
        return s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
      })
      .filter(s => s.length > 0);
    
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`📡 Executing statement ${index + 1}: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      } catch (error) {
        // Ignore errors for statements that might not work (like DROP, CREATE VIEW, etc.)
        if (!error.message.includes('already exists') && 
            !error.message.includes("doesn't exist") &&
            !error.message.includes('Duplicate')) {
          console.warn(`⚠️  Warning on statement ${index + 1}: ${error.message.split('\n')[0]}`);
          console.log(`Full statement: ${statement}`);
        }
      }
    }
    
    console.log('✅ Schema applied successfully');
    
    // Verify tables were created
    const [newTables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ Found ${newTables.length} tables in database:`);
    newTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Test Sequelize connection
    console.log('\n🔧 Testing Sequelize connection...');
    const sequelize = require('./src/config/database');
    await sequelize.authenticate();
    console.log('✅ Sequelize connection successful!');
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your backend server (npm start)');
    console.log('   2. Server should now connect to database successfully');
    console.log('   3. Sample data will be seeded automatically on server start');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - MySQL server is not running');
      console.error('   - Start MySQL: brew services start mysql');
      console.error('   - Or: mysql.server start');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check DB_USER and DB_PASSWORD in .env');
      console.error('   - Current user:', dbConfig.user);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist, trying to create...');
    } else {
      console.error('\n💡 Full error:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase().catch(console.error);
