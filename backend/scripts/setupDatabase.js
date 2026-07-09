const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'job_site_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/verified`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Drop existing tables if they exist (for clean setup)
    console.log('🗑️ Dropping existing tables...');
    const dropTables = [
      'DROP TABLE IF EXISTS bookmarks',
      'DROP TABLE IF EXISTS notifications',
      'DROP TABLE IF EXISTS applications',
      'DROP TABLE IF EXISTS user_skills',
      'DROP TABLE IF EXISTS jobs',
      'DROP TABLE IF EXISTS skills',
      'DROP TABLE IF EXISTS users'
    ];

    for (const dropTable of dropTables) {
      await connection.query(dropTable);
    }
    console.log('✅ Existing tables dropped');

    // Create tables
    console.log('🏗️ Creating new tables...');
    const tables = [
      // Users table
      `CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('seeker', 'recruiter', 'admin') NOT NULL DEFAULT 'seeker',
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        location VARCHAR(255),
        bio TEXT,
        resumePath VARCHAR(500),
        experience ENUM('entry', 'junior', 'mid', 'senior', 'executive'),
        expectedSalary INT,
        isActive BOOLEAN DEFAULT TRUE,
        isVerified BOOLEAN DEFAULT FALSE,
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_location (location)
      )`,

      // Skills table
      `CREATE TABLE skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(100),
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_category (category)
      )`,

      // User Skills junction table
      `CREATE TABLE user_skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        skillId INT NOT NULL,
        proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
        yearsOfExperience INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_skill (userId, skillId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_skillId (skillId)
      )`,

      // Jobs table
      `CREATE TABLE jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        responsibilities TEXT,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        jobType ENUM('full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid') NOT NULL,
        experienceLevel ENUM('entry', 'junior', 'mid', 'senior', 'executive') NOT NULL,
        category VARCHAR(100) NOT NULL,
        industry VARCHAR(100),
        salaryMin INT,
        salaryMax INT,
        salaryType ENUM('hourly', 'monthly', 'yearly') DEFAULT 'yearly',
        benefits TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        isApproved BOOLEAN DEFAULT FALSE,
        applicationDeadline DATETIME,
        views INT DEFAULT 0,
        applicationsCount INT DEFAULT 0,
        recruiterId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiterId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_title (title),
        INDEX idx_location (location),
        INDEX idx_category (category),
        INDEX idx_jobType (jobType),
        INDEX idx_experienceLevel (experienceLevel),
        INDEX idx_isActive_approved (isActive, isApproved),
        FULLTEXT idx_search (title, description, company)
      )`,

      // Applications table
      `CREATE TABLE applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        jobId INT NOT NULL,
        coverLetter TEXT,
        status ENUM('applied', 'under_review', 'shortlisted', 'interviewed', 'rejected', 'hired') DEFAULT 'applied',
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewedAt DATETIME,
        recruiterNotes TEXT,
        interviewDate DATETIME,
        interviewType ENUM('phone', 'video', 'onsite'),
        isWithdrawn BOOLEAN DEFAULT FALSE,
        withdrawnAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_job (userId, jobId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_jobId (jobId),
        INDEX idx_status (status),
        INDEX idx_appliedAt (appliedAt)
      )`,

      // Notifications table
      `CREATE TABLE notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        type ENUM('application_update', 'job_suggestion', 'profile_view', 'message', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT FALSE,
        readAt DATETIME,
        data JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_type (type),
        INDEX idx_isRead (isRead),
        INDEX idx_createdAt (createdAt)
      )`,

      // Bookmarks table
      `CREATE TABLE bookmarks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        jobId INT NOT NULL,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_job_bookmark (userId, jobId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_jobId (jobId)
      )`
    ];

    for (const table of tables) {
      await connection.query(table);
    }

    console.log('✅ All tables created successfully');

    // Create admin user if it doesn't exist
    const adminCheck = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@jobsite.com']
    );

    if (adminCheck[0].length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await connection.query(
        `INSERT INTO users (email, password, role, firstName, lastName, isVerified, isActive) 
         VALUES (?, ?, 'admin', 'Admin', 'User', TRUE, TRUE)`,
        ['admin@jobsite.com', hashedPassword]
      );
      
      console.log('✅ Admin user created (email: admin@jobsite.com, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run seed (to populate with sample data)');
    console.log('2. Start the server: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 