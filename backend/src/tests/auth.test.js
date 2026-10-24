import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './testHelper.js';

describe('Auth Endpoints & Session Management', () => {
  setupTestDB();

  const testUser = {
    email: 'dev@passvault.test',
    masterPassword: 'MasterPassword2026!#',
    vaultSalt: 'aGVsbG93b3JsZHNhbHQxNg==',
  };

  it('POST /api/auth/register creates user and sets httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.vaultSalt).toBe(testUser.vaultSalt);
    expect(res.body.user.passwordHash).toBeUndefined(); // Never expose password hash

    // Verify cookie set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/passvault_session=/);
    expect(cookies[0]).toMatch(/HttpOnly/i);
  });

  it('POST /api/auth/register rejects duplicate email with 409 Conflict', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register validates password minimum length', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'short@test.com',
        masterPassword: 'short',
        vaultSalt: 'aGVsbG93b3JsZHNhbHQxNg==',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  it('POST /api/auth/login authenticates with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        masterPassword: testUser.masterPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.vaultSalt).toBe(testUser.vaultSalt);

    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toMatch(/passvault_session=/);
  });

  it('POST /api/auth/login rejects incorrect master password with 401', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        masterPassword: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me returns current user profile when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookie = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.vaultSalt).toBe(testUser.vaultSalt);
  });

  it('GET /api/auth/me returns 401 Unauthorized when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/logout clears session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toMatch(/passvault_session=;/);
  });
});
