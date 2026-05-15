import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function init() {
  try {
    // Attempt to authenticate as admin. If not exists, create first admin.
    let adminAuth;
    try {
      adminAuth = await pb.admins.authWithPassword('admin@testdoc.com', 'Admin123456');
    } catch (e) {
      console.log('Creating initial admin...');
      await pb.admins.create({
        email: 'admin@testdoc.com',
        password: 'Admin123456',
        passwordConfirm: 'Admin123456'
      });
      adminAuth = await pb.admins.authWithPassword('admin@testdoc.com', 'Admin123456');
    }

    console.log('Admin authenticated.');

    // Create test_cases collection
    try {
      await pb.collections.create({
        name: 'test_cases',
        type: 'base',
        schema: [
          { name: 'title', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'order', type: 'number' }
        ]
      });
      console.log('Created test_cases collection.');
    } catch (e) { console.log('test_cases collection exists.'); }

    // Create test_steps collection
    try {
      await pb.collections.create({
        name: 'test_steps',
        type: 'base',
        schema: [
          { name: 'test_case', type: 'relation', options: { collectionId: 'test_cases', cascadeDelete: true } },
          { name: 'description', type: 'text' },
          { name: 'expectedResult', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'actualResult', type: 'text' },
          { name: 'stepIndex', type: 'number' }
        ]
      });
      console.log('Created test_steps collection.');
    } catch (e) { console.log('test_steps collection exists.'); }

    // Create evidences collection
    try {
      await pb.collections.create({
        name: 'evidences',
        type: 'base',
        schema: [
          { name: 'test_step', type: 'relation', options: { collectionId: 'test_steps', cascadeDelete: true } },
          { name: 'file', type: 'file', options: { maxSelect: 1, maxSize: 5242880 } }
        ]
      });
      console.log('Created evidences collection.');
    } catch (e) { console.log('evidences collection exists.'); }

    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Failed to init DB:', err.response || err);
  }
}

init();
