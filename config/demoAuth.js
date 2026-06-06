import bcryptjs from 'bcryptjs';

const demoUsers = global.demoUsers || new Map();
global.demoUsers = demoUsers;

let demoReady = global.demoReady;

const seedDemoUsers = async () => {
  if (demoReady) return;

  const passwordHash = await bcryptjs.hash('demo123', 10);

  demoUsers.set('demo@pg.com', {
    id: 'demo-user-1',
    name: 'Demo User',
    email: 'demo@pg.com',
    phone: '9876543210',
    password: passwordHash,
  });

  demoReady = true;
  global.demoReady = true;
};

export const isDemoAuthEnabled = () => {
  const uri = process.env.MONGODB_URI?.trim();
  return Boolean(process.env.VERCEL && !uri);
};

export const ensureDemoAuth = async () => {
  if (!isDemoAuthEnabled()) {
    return false;
  }

  await seedDemoUsers();
  return true;
};

export const findDemoUserByEmail = async (email) => {
  await ensureDemoAuth();
  return demoUsers.get(email.toLowerCase()) || null;
};

export const findDemoUserByPhone = async (phone) => {
  await ensureDemoAuth();
  for (const user of demoUsers.values()) {
    if (user.phone === phone) {
      return user;
    }
  }
  return null;
};

export const createDemoUser = async ({ name, email, phone, password }) => {
  await ensureDemoAuth();

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcryptjs.hash(password, 10);
  const id = `demo-user-${Date.now()}`;

  const user = {
    id,
    name,
    email: normalizedEmail,
    phone,
    password: passwordHash,
  };

  demoUsers.set(normalizedEmail, user);
  return user;
};

export const compareDemoPassword = async (user, password) => {
  return bcryptjs.compare(password, user.password);
};

export const findDemoUserById = async (id) => {
  await ensureDemoAuth();
  for (const user of demoUsers.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
};
