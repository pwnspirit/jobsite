const { sequelize } = require('../config/database');
const { User, Skill, Job, UserSkill, Notification } = require('../models');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Skills
    console.log('📚 Seeding skills...');
    const skills = [
      { name: 'JavaScript', category: 'Programming', description: 'JavaScript programming language' },
      { name: 'Python', category: 'Programming', description: 'Python programming language' },
      { name: 'React', category: 'Frontend', description: 'React.js framework' },
      { name: 'Node.js', category: 'Backend', description: 'Node.js runtime environment' },
      { name: 'MySQL', category: 'Database', description: 'MySQL database management' },
      { name: 'MongoDB', category: 'Database', description: 'MongoDB NoSQL database' },
      { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services' },
      { name: 'Docker', category: 'DevOps', description: 'Containerization platform' },
      { name: 'Git', category: 'Version Control', description: 'Git version control system' },
      { name: 'Agile', category: 'Methodology', description: 'Agile development methodology' },
      { name: 'UI/UX Design', category: 'Design', description: 'User interface and experience design' },
      { name: 'Data Analysis', category: 'Analytics', description: 'Data analysis and visualization' },
      { name: 'Machine Learning', category: 'AI/ML', description: 'Machine learning algorithms' },
      { name: 'Project Management', category: 'Management', description: 'Project management skills' },
      { name: 'Communication', category: 'Soft Skills', description: 'Effective communication skills' }
    ];

    for (const skillData of skills) {
      await Skill.findOrCreate({
        where: { name: skillData.name },
        defaults: skillData
      });
    }
    console.log(`✅ ${skills.length} skills seeded`);

    // Seed Users
    console.log('👥 Seeding users...');
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'seeker',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
        bio: 'Experienced software developer with 5+ years in web development',
        experience: 'mid',
        expectedSalary: 120000
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'seeker',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0102',
        location: 'New York, NY',
        bio: 'Frontend developer passionate about creating beautiful user experiences',
        experience: 'junior',
        expectedSalary: 80000
      },
      {
        email: 'mike.johnson@example.com',
        password: 'password123',
        role: 'seeker',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1-555-0103',
        location: 'Austin, TX',
        bio: 'Senior full-stack developer with expertise in modern web technologies',
        experience: 'senior',
        expectedSalary: 150000
      },
      {
        email: 'sarah.wilson@example.com',
        password: 'password123',
        role: 'recruiter',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '+1-555-0201',
        location: 'Seattle, WA',
        bio: 'Tech recruiter at TechCorp, specializing in software engineering roles'
      },
      {
        email: 'david.brown@example.com',
        password: 'password123',
        role: 'recruiter',
        firstName: 'David',
        lastName: 'Brown',
        phone: '+1-555-0202',
        location: 'Boston, MA',
        bio: 'Senior recruiter at InnovateTech, focused on AI/ML talent'
      },
      {
        email: 'emma.davis@example.com',
        password: 'password123',
        role: 'recruiter',
        firstName: 'Emma',
        lastName: 'Davis',
        phone: '+1-555-0203',
        location: 'Denver, CO',
        bio: 'Startup recruiter helping early-stage companies build their teams'
      }
    ];

    for (const userData of users) {
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: { ...userData, isVerified: true }
      });
    }
    console.log(`✅ ${users.length} users seeded`);

    // Seed User Skills
    console.log('🔗 Seeding user skills...');
    const userSkills = [
      { userId: 2, skillId: 1, proficiency: 'advanced', yearsOfExperience: 3 }, // John - JavaScript
      { userId: 2, skillId: 3, proficiency: 'advanced', yearsOfExperience: 4 }, // John - React
      { userId: 2, skillId: 4, proficiency: 'intermediate', yearsOfExperience: 2 }, // John - Node.js
      { userId: 3, skillId: 1, proficiency: 'intermediate', yearsOfExperience: 2 }, // Jane - JavaScript
      { userId: 3, skillId: 3, proficiency: 'intermediate', yearsOfExperience: 1 }, // Jane - React
      { userId: 3, skillId: 11, proficiency: 'beginner', yearsOfExperience: 1 }, // Jane - UI/UX
      { userId: 4, skillId: 1, proficiency: 'expert', yearsOfExperience: 7 }, // Mike - JavaScript
      { userId: 4, skillId: 2, proficiency: 'advanced', yearsOfExperience: 5 }, // Mike - Python
      { userId: 4, skillId: 4, proficiency: 'expert', yearsOfExperience: 6 }, // Mike - Node.js
      { userId: 4, skillId: 5, proficiency: 'advanced', yearsOfExperience: 4 }, // Mike - MySQL
      { userId: 4, skillId: 7, proficiency: 'intermediate', yearsOfExperience: 3 }, // Mike - AWS
    ];

    for (const userSkillData of userSkills) {
      await UserSkill.findOrCreate({
        where: { userId: userSkillData.userId, skillId: userSkillData.skillId },
        defaults: userSkillData
      });
    }
    console.log(`✅ ${userSkills.length} user skills seeded`);

    // Seed Jobs
    console.log('💼 Seeding jobs...');
    const jobs = [
      {
        title: 'Senior Frontend Developer',
        description: 'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications using modern JavaScript frameworks.',
        requirements: '5+ years of experience with React, JavaScript, HTML, CSS. Experience with TypeScript and modern build tools.',
        responsibilities: 'Develop new user-facing features, build reusable code and libraries, optimize applications for maximum speed and scalability.',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        jobType: 'full-time',
        experienceLevel: 'senior',
        category: 'Software Development',
        industry: 'Technology',
        salaryMin: 120000,
        salaryMax: 180000,
        benefits: 'Health insurance, 401k, flexible PTO, remote work options',
        isApproved: true,
        recruiterId: 5
      },
      {
        title: 'Full Stack Developer',
        description: 'Join our dynamic team as a Full Stack Developer. You will work on both frontend and backend development, contributing to our innovative products.',
        requirements: '3+ years of experience with JavaScript, Node.js, React, and databases. Knowledge of cloud platforms is a plus.',
        responsibilities: 'Develop and maintain web applications, collaborate with cross-functional teams, write clean and maintainable code.',
        company: 'InnovateTech',
        location: 'New York, NY',
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'Software Development',
        industry: 'Technology',
        salaryMin: 90000,
        salaryMax: 130000,
        benefits: 'Competitive salary, health benefits, professional development, team events',
        isApproved: true,
        recruiterId: 6
      },
      {
        title: 'Junior React Developer',
        description: 'Great opportunity for a Junior React Developer to grow their skills in a supportive environment. We provide mentorship and training.',
        requirements: '1+ years of experience with React and JavaScript. Understanding of HTML, CSS, and web fundamentals.',
        responsibilities: 'Build user interfaces, work with APIs, participate in code reviews, learn from senior developers.',
        company: 'StartupXYZ',
        location: 'Austin, TX',
        jobType: 'full-time',
        experienceLevel: 'junior',
        category: 'Software Development',
        industry: 'Technology',
        salaryMin: 60000,
        salaryMax: 80000,
        benefits: 'Health insurance, equity options, flexible hours, learning budget',
        isApproved: true,
        recruiterId: 7
      },
      {
        title: 'DevOps Engineer',
        description: 'We are seeking a DevOps Engineer to help us build and maintain our infrastructure. You will work with cloud platforms and automation tools.',
        requirements: '3+ years of experience with AWS, Docker, CI/CD pipelines. Knowledge of Kubernetes and monitoring tools.',
        responsibilities: 'Manage cloud infrastructure, automate deployment processes, monitor system performance, ensure security.',
        company: 'TechCorp',
        location: 'Seattle, WA',
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'DevOps',
        industry: 'Technology',
        salaryMin: 100000,
        salaryMax: 140000,
        benefits: 'Health insurance, 401k, remote work, professional development',
        isApproved: true,
        recruiterId: 5
      },
      {
        title: 'Data Scientist',
        description: 'Join our data team to help extract insights from large datasets. You will work on machine learning models and data analysis.',
        requirements: '2+ years of experience with Python, machine learning libraries, and statistical analysis. Experience with SQL and data visualization.',
        responsibilities: 'Develop ML models, analyze data, create visualizations, collaborate with product teams.',
        company: 'InnovateTech',
        location: 'Boston, MA',
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'Data Science',
        industry: 'Technology',
        salaryMin: 95000,
        salaryMax: 135000,
        benefits: 'Competitive salary, health benefits, flexible work, learning opportunities',
        isApproved: true,
        recruiterId: 6
      },
      {
        title: 'UI/UX Designer',
        description: 'We are looking for a creative UI/UX Designer to help us create beautiful and intuitive user experiences.',
        requirements: '3+ years of experience in UI/UX design. Proficiency with design tools like Figma, Sketch, or Adobe Creative Suite.',
        responsibilities: 'Design user interfaces, create user flows, conduct user research, collaborate with development teams.',
        company: 'StartupXYZ',
        location: 'Denver, CO',
        jobType: 'full-time',
        experienceLevel: 'mid',
        category: 'Design',
        industry: 'Technology',
        salaryMin: 70000,
        salaryMax: 100000,
        benefits: 'Health insurance, equity, flexible hours, creative freedom',
        isApproved: true,
        recruiterId: 7
      }
    ];

    for (const jobData of jobs) {
      await Job.findOrCreate({
        where: { title: jobData.title, company: jobData.company },
        defaults: jobData
      });
    }
    console.log(`✅ ${jobs.length} jobs seeded`);

    // Seed Notifications
    console.log('🔔 Seeding notifications...');
    const notifications = [
      {
        userId: 2,
        type: 'job_suggestion',
        title: 'New Job Match',
        message: 'We found a Senior Frontend Developer position that matches your skills!',
        data: { jobId: 1 }
      },
      {
        userId: 3,
        type: 'job_suggestion',
        title: 'Job Opportunity',
        message: 'Check out this Junior React Developer role that might be perfect for you!',
        data: { jobId: 3 }
      },
      {
        userId: 4,
        type: 'job_suggestion',
        title: 'Senior Role Available',
        message: 'A Senior Full Stack Developer position that matches your experience level!',
        data: { jobId: 2 }
      }
    ];

    for (const notificationData of notifications) {
      await Notification.create(notificationData);
    }
    console.log(`✅ ${notifications.length} notifications seeded`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample data includes:');
    console.log('- 15 skills (JavaScript, Python, React, etc.)');
    console.log('- 6 users (3 job seekers, 3 recruiters)');
    console.log('- 6 sample jobs (various roles and locations)');
    console.log('- User skill associations');
    console.log('- Sample notifications');
    console.log('\n🔑 Test accounts:');
    console.log('Admin: admin@jobsite.com / admin123');
    console.log('Seeker: john.doe@example.com / password123');
    console.log('Recruiter: sarah.wilson@example.com / password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedData(); 
