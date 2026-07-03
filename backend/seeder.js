import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const importData = async () => {
  try {
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 MongoDB Connected successfully for seeding...');

    
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🧹 Existing users and products cleared.');

    
    
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      password: '123456',
      isAdmin: true,
    });
    console.log(`👤 Admin Account Provisioned: [${adminUser.email}]`);

    
    console.log('✨ Admin user created successfully. No sample products seeded.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during import lifecycle: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🗑️ Database completely wiped of user and product records.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during removal lifecycle: ${error.message}`);
    process.exit(1);
  }
};


if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}