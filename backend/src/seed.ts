import mongoose from 'mongoose';
import * as crypto from 'crypto';
import { User } from './models/user.model';
import * as dotenv from 'dotenv';

dotenv.config();

function hashPassword(password: string): string {
  return crypto.createHash('sha512').update(password).digest('hex');
}

async function seedDatabase() {
  try {
    const mongoUri = process.env.DATABASE_URL;
    if (!mongoUri) throw new Error("DATABASE_URL is missing in .env file");

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    await User.deleteMany({});

    const testUsers = [
      {
        nickname: 'dev_gold',
        fullName: 'Amiram levin',
        email: 'amiram@ivtech.com',
        password: hashPassword('password123'),
      },
      {
        nickname: 'joker',
        fullName: 'Sam timewaster',
        email: 'sam@ivtech.com',
        password: hashPassword('password321'),
      },
      {
        nickname: 'The Best Reviewer',
        fullName: 'My Reviewer',
        email: 'review@ivtech.com',
        password: hashPassword('testtheapp123'),
      },
    ];

    await User.insertMany(testUsers);
    console.log('Database successfully seeded with hardcoded users!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();