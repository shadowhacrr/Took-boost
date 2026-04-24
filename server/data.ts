import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson<T>(file: string, fallback: T): T {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch { return fallback; }
}

function writeJson(file: string, data: unknown) {
  const p = path.join(DATA_DIR, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function hashPassword(pwd: string) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// Types
export interface Owner {
  username: string;
  passwordHash: string;
  whatsapp: string;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  walletType: 'easypaisa' | 'jazzcash' | '';
  walletNumber: string;
  walletName: string;
  userLink: string;
  createdAt: string;
  isActive: boolean;
}

export interface Pricing {
  followers: number;
  likes: number;
  comments: number;
  views: number;
  shares: number;
}

export interface Order {
  id: string;
  adminId: string;
  tiktokUsername: string;
  service: string;
  quantity: number;
  totalPrice: number;
  transactionId: string;
  paymentScreenshot: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  userLink: string;
}

export interface Complaint {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface Review {
  id: string;
  adminId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  adminId: string;
  action: string;
  details: string;
  timestamp: string;
}

// Initialize default data if missing
function ensureDefaults() {
  const owner = readJson<Owner | null>('owner.json', null);
  if (!owner) {
    writeJson('owner.json', {
      username: 'owner',
      passwordHash: hashPassword('owner123'),
      whatsapp: '923001234567'
    });
  }

  const pricing = readJson<Pricing | null>('pricing.json', null);
  if (!pricing) {
    writeJson('pricing.json', {
      followers: 50,
      likes: 30,
      comments: 100,
      views: 20,
      shares: 40
    });
  }

  if (!fs.existsSync(path.join(DATA_DIR, 'admins.json'))) writeJson('admins.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'orders.json'))) writeJson('orders.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'complaints.json'))) writeJson('complaints.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'reviews.json'))) writeJson('reviews.json', []);
  if (!fs.existsSync(path.join(DATA_DIR, 'activity.json'))) writeJson('activity.json', []);
}

ensureDefaults();

export const db = {
  hashPassword,
  generateId,
  owner: {
    get: () => readJson<Owner>('owner.json', { username: 'owner', passwordHash: hashPassword('owner123'), whatsapp: '923001234567' }),
    update: (data: Owner) => writeJson('owner.json', data),
  },
  pricing: {
    get: () => readJson<Pricing>('pricing.json', { followers: 50, likes: 30, comments: 100, views: 20, shares: 40 }),
    update: (data: Pricing) => writeJson('pricing.json', data),
  },
  admins: {
    getAll: () => readJson<Admin[]>('admins.json', []),
    getById: (id: string) => readJson<Admin[]>('admins.json', []).find(a => a.id === id),
    getByUsername: (username: string) => readJson<Admin[]>('admins.json', []).find(a => a.username === username),
    getByLink: (link: string) => readJson<Admin[]>('admins.json', []).find(a => a.userLink === link),
    add: (admin: Admin) => {
      const all = readJson<Admin[]>('admins.json', []);
      all.push(admin);
      writeJson('admins.json', all);
    },
    update: (id: string, data: Partial<Admin>) => {
      const all = readJson<Admin[]>('admins.json', []);
      const idx = all.findIndex(a => a.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...data };
        writeJson('admins.json', all);
      }
    },
    remove: (id: string) => {
      const all = readJson<Admin[]>('admins.json', []).filter(a => a.id !== id);
      writeJson('admins.json', all);
    },
  },
  orders: {
    getAll: () => readJson<Order[]>('orders.json', []),
    getById: (id: string) => readJson<Order[]>('orders.json', []).find(o => o.id === id),
    getByAdmin: (adminId: string) => readJson<Order[]>('orders.json', []).filter(o => o.adminId === adminId),
    getByUserLink: (link: string) => readJson<Order[]>('orders.json', []).filter(o => o.userLink === link),
    add: (order: Order) => {
      const all = readJson<Order[]>('orders.json', []);
      all.push(order);
      writeJson('orders.json', all);
    },
    update: (id: string, data: Partial<Order>) => {
      const all = readJson<Order[]>('orders.json', []);
      const idx = all.findIndex(o => o.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...data };
        writeJson('orders.json', all);
      }
    },
  },
  complaints: {
    getAll: () => readJson<Complaint[]>('complaints.json', []),
    add: (c: Complaint) => {
      const all = readJson<Complaint[]>('complaints.json', []);
      all.push(c);
      writeJson('complaints.json', all);
    },
    remove: (id: string) => {
      const all = readJson<Complaint[]>('complaints.json', []).filter(c => c.id !== id);
      writeJson('complaints.json', all);
    },
  },
  reviews: {
    getAll: () => readJson<Review[]>('reviews.json', []),
    getByAdmin: (adminId: string) => readJson<Review[]>('reviews.json', []).filter(r => r.adminId === adminId),
    add: (r: Review) => {
      const all = readJson<Review[]>('reviews.json', []);
      all.push(r);
      writeJson('reviews.json', all);
    },
  },
  activity: {
    getAll: () => readJson<Activity[]>('activity.json', []),
    getByAdmin: (adminId: string) => readJson<Activity[]>('activity.json', []).filter(a => a.adminId === adminId),
    add: (a: Activity) => {
      const all = readJson<Activity[]>('activity.json', []);
      all.push(a);
      writeJson('activity.json', all);
    },
  },
};
