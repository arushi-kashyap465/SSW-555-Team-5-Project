const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'SSW-555-Team-5-Project-Scanner-Application';

async function main() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    console.log('Connected to MongoDB:', MONGO_URL);
    const db = client.db(DB_NAME);

    const usersCol = db.collection('users');

    await usersCol.deleteMany({});

    const now = new Date();
    const users = [
      {
        username: 'instructor1',
        email: 'instructor@example.com',
        name: 'Dr. Instructor',
        role: 'instructor',
        createdAt: now
      },
      {
        username: 'student1',
        email: 'student1@example.com',
        name: 'Alice Student',
        role: 'student',
        createdAt: now
      },
      {
        username: 'student2',
        email: 'student2@example.com',
        name: 'Bob Student',
        role: 'student',
        createdAt: now
      }
    ];

    const result = await usersCol.insertMany(users);
    console.log(`Inserted ${result.insertedCount} users.`);
    console.log('Inserted IDs:', result.insertedIds);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}

module.exports = { main };