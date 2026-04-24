import { Hono } from 'hono';
import { db } from './data.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tokboost-super-secret-key-2025';

const app = new Hono();

// Middleware
app.use('/api/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') return c.text('', 204);
  await next();
});

// Health
app.get('/api/health', (c) => c.json({ ok: true }));

// Owner login
app.post('/api/owner/login', async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const owner = db.owner.get();
  if (body.username === owner.username && db.hashPassword(body.password) === owner.passwordHash) {
    const token = jwt.sign({ role: 'owner', username: owner.username }, JWT_SECRET, { expiresIn: '7d' });
    return c.json({ success: true, token });
  }
  return c.json({ success: false, message: 'Invalid credentials' }, 401);
});

// Get owner info
app.get('/api/owner/info', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const owner = db.owner.get();
    return c.json({ username: owner.username, whatsapp: owner.whatsapp });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Update owner
app.put('/api/owner/update', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const body = await c.req.json<{ username?: string; password?: string; whatsapp?: string }>();
    const owner = db.owner.get();
    if (body.username) owner.username = body.username;
    if (body.password) owner.passwordHash = db.hashPassword(body.password);
    if (body.whatsapp) owner.whatsapp = body.whatsapp;
    db.owner.update(owner);
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Get pricing
app.get('/api/pricing', (c) => c.json(db.pricing.get()));

// Update pricing
app.put('/api/pricing', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const body = await c.req.json();
    db.pricing.update(body);
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Admins
app.get('/api/admins', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const admins = db.admins.getAll();
    return c.json(admins.map(a => ({ ...a, passwordHash: undefined })));
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

app.post('/api/admins', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const body = await c.req.json<{ username: string; password: string }>();
    if (db.admins.getByUsername(body.username)) {
      return c.json({ success: false, message: 'Username already exists' }, 400);
    }
    const id = db.generateId();
    const admin = {
      id,
      username: body.username,
      passwordHash: db.hashPassword(body.password),
      walletType: '',
      walletNumber: '',
      walletName: '',
      userLink: db.generateId(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    db.admins.add(admin);
    return c.json({ success: true, admin: { ...admin, passwordHash: undefined } });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

app.delete('/api/admins/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    db.admins.remove(c.req.param('id'));
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Owner orders
app.get('/api/owner/orders', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    return c.json(db.orders.getAll().reverse());
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Admin login
app.post('/api/admin/login', async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  const admin = db.admins.getByUsername(body.username);
  if (!admin || !admin.isActive) return c.json({ success: false, message: 'Invalid credentials' }, 401);
  if (db.hashPassword(body.password) !== admin.passwordHash) return c.json({ success: false, message: 'Invalid credentials' }, 401);
  const token = jwt.sign({ role: 'admin', adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  db.activity.add({
    id: db.generateId(),
    adminId: admin.id,
    action: 'login',
    details: 'Admin logged in',
    timestamp: new Date().toISOString(),
  });
  return c.json({ success: true, token, admin: { ...admin, passwordHash: undefined } });
});

// Admin info
app.get('/api/admin/info', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; adminId: string };
    const admin = db.admins.getById(decoded.adminId);
    if (!admin) return c.json({ error: 'Not found' }, 404);
    return c.json({ ...admin, passwordHash: undefined });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Update admin wallet
app.put('/api/admin/wallet', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; adminId: string };
    const body = await c.req.json<{ walletType: string; walletNumber: string; walletName: string }>();
    db.admins.update(decoded.adminId, {
      walletType: body.walletType as 'easypaisa' | 'jazzcash',
      walletNumber: body.walletNumber,
      walletName: body.walletName,
    });
    db.activity.add({
      id: db.generateId(),
      adminId: decoded.adminId,
      action: 'wallet_update',
      details: `Updated wallet to ${body.walletType}`,
      timestamp: new Date().toISOString(),
    });
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Refresh user link
app.post('/api/admin/refresh-link', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; adminId: string };
    const newLink = db.generateId();
    db.admins.update(decoded.adminId, { userLink: newLink });
    db.activity.add({
      id: db.generateId(),
      adminId: decoded.adminId,
      action: 'link_refresh',
      details: 'Generated new user link',
      timestamp: new Date().toISOString(),
    });
    return c.json({ success: true, userLink: newLink });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Admin orders
app.get('/api/admin/orders', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; adminId: string };
    return c.json(db.orders.getByAdmin(decoded.adminId));
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Get admin by link (public)
app.get('/api/admin/by-link/:link', (c) => {
  const admin = db.admins.getByLink(c.req.param('link'));
  if (!admin || !admin.isActive) return c.json({ error: 'Not found' }, 404);
  return c.json({
    id: admin.id,
    username: admin.username,
    walletType: admin.walletType,
    walletNumber: admin.walletNumber,
    walletName: admin.walletName,
    userLink: admin.userLink,
  });
});

// Create order (public)
app.post('/api/orders', async (c) => {
  const body = await c.req.json<{
    adminLink: string;
    tiktokUsername: string;
    service: string;
    quantity: number;
    totalPrice: number;
    transactionId: string;
    paymentScreenshot?: string;
  }>();
  const admin = db.admins.getByLink(body.adminLink);
  if (!admin || !admin.isActive) return c.json({ success: false, message: 'Invalid link' }, 400);
  const order = {
    id: db.generateId(),
    adminId: admin.id,
    tiktokUsername: body.tiktokUsername,
    service: body.service,
    quantity: body.quantity,
    totalPrice: body.totalPrice,
    transactionId: body.transactionId,
    paymentScreenshot: body.paymentScreenshot || '',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    userLink: body.adminLink,
  };
  db.orders.add(order);
  db.activity.add({
    id: db.generateId(),
    adminId: admin.id,
    action: 'new_order',
    details: `New ${body.service} order for ${body.tiktokUsername}`,
    timestamp: new Date().toISOString(),
  });
  return c.json({ success: true, order });
});

// Complete order
app.put('/api/orders/:id/complete', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string; adminId: string };
    const order = db.orders.getById(c.req.param('id'));
    if (!order || order.adminId !== decoded.adminId) return c.json({ error: 'Not found' }, 404);
    db.orders.update(order.id, { status: 'completed', completedAt: new Date().toISOString() });
    db.activity.add({
      id: db.generateId(),
      adminId: decoded.adminId,
      action: 'order_complete',
      details: `Completed order for ${order.tiktokUsername}`,
      timestamp: new Date().toISOString(),
    });
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Get order status (public)
app.get('/api/orders/:id/status', (c) => {
  const order = db.orders.getById(c.req.param('id'));
  if (!order) return c.json({ error: 'Not found' }, 404);
  return c.json({ status: order.status, tiktokUsername: order.tiktokUsername, service: order.service, completedAt: order.completedAt });
});

// Complaints
app.get('/api/complaints', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    return c.json(db.complaints.getAll());
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

app.post('/api/complaints', async (c) => {
  const body = await c.req.json<{ name: string; email: string; message: string }>();
  const complaint = {
    id: db.generateId(),
    name: body.name,
    email: body.email,
    message: body.message,
    createdAt: new Date().toISOString(),
  };
  db.complaints.add(complaint);
  return c.json({ success: true });
});

app.delete('/api/complaints/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    db.complaints.remove(c.req.param('id'));
    return c.json({ success: true });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Reviews
app.get('/api/reviews', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    return c.json(db.reviews.getAll());
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

app.post('/api/reviews', async (c) => {
  const body = await c.req.json<{ adminId: string; rating: number; comment: string }>();
  const review = {
    id: db.generateId(),
    adminId: body.adminId,
    rating: body.rating,
    comment: body.comment,
    createdAt: new Date().toISOString(),
  };
  db.reviews.add(review);
  return c.json({ success: true });
});

// Activity
app.get('/api/activity', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    return c.json(db.activity.getAll().reverse().slice(0, 200));
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

// Stats
app.get('/api/stats', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const token = auth.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET) as { role: string };
    const admins = db.admins.getAll();
    const orders = db.orders.getAll();
    return c.json({
      totalAdmins: admins.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0),
    });
  } catch { return c.json({ error: 'Unauthorized' }, 401); }
});

export default app;
