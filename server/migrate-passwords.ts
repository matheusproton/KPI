
import bcrypt from 'bcryptjs';
import sql from 'mssql';

async function migratePasswords() {
  console.log('Starting password migration...');
  
  let pool: sql.ConnectionPool | null = null;
  
  try {
    // Create database connection
    const config = {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_DATABASE || 'factory_kpi_dashboard',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourStrongPassword123!',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Database connected successfully');

    // Get all users
    const result = await pool.request()
      .query('SELECT id, username, password FROM users ORDER BY id');

    const users = result.recordset;
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      if (!user.password.startsWith('$2')) {
        console.log(`Migrating password for user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await pool.request()
          .input('id', sql.Int, user.id)
          .input('password', sql.NVarChar, hashedPassword)
          .query('UPDATE users SET password = @password WHERE id = @id');
          
        console.log(`✓ Password migrated for user: ${user.username}`);
      } else {
        console.log(`Password already hashed for user: ${user.username}`);
      }
    }
    
    console.log('Password migration completed successfully!');
  } catch (error) {
    console.error('Password migration failed:', error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

migratePasswords();
