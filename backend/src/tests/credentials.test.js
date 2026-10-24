import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './testHelper.js';

describe('Credential CRUD Endpoints', () => {
  setupTestDB();

  let userCookie;

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@vault.internal',
        masterPassword: 'SecureMasterPassword123!',
        vaultSalt: 'c2FsdF9mb3JfdGVzdF8xNg==',
      });
    userCookie = regRes.headers['set-cookie'];
  });

  it('POST /api/credentials creates a client-side encrypted credential', async () => {
    const payload = {
      title: 'GitHub Enterprise',
      url: 'https://github.com',
      username: 'dev_octocat',
      category: 'Logins',
      isFavorite: true,
      encryptedPassword: 'dGVzdENpcGhlcnRleHRQYXNzd29yZA==',
      passwordIv: 'dGVzdFBhc3N3b3JkSXYxMg==',
      encryptedNotes: 'ZW5jcnlwdGVkTm90ZXNEYXRh',
      notesIv: 'bm90ZXNJdjEyMzQ1Ng==',
    };

    const res = await request(app)
      .post('/api/credentials')
      .set('Cookie', userCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.credential.title).toBe(payload.title);
    expect(res.body.credential.encryptedPassword).toBe(payload.encryptedPassword);
    expect(res.body.credential.passwordIv).toBe(payload.passwordIv);
  });

  it('POST /api/credentials rejects payload missing encryptedPassword or IV', async () => {
    const res = await request(app)
      .post('/api/credentials')
      .set('Cookie', userCookie)
      .send({
        title: 'Broken Credential',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/credentials lists user credentials', async () => {
    await request(app)
      .post('/api/credentials')
      .set('Cookie', userCookie)
      .send({
        title: 'AWS Cloud',
        encryptedPassword: 'Y2lwaGVydGV4dDE=',
        passwordIv: 'aXYxMjM0NTY3OA==',
      });

    const res = await request(app)
      .get('/api/credentials')
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.credentials[0].title).toBe('AWS Cloud');
  });

  it('PUT /api/credentials/:id updates a credential', async () => {
    const createRes = await request(app)
      .post('/api/credentials')
      .set('Cookie', userCookie)
      .send({
        title: 'Initial Title',
        encryptedPassword: 'Y2lwaGVydGV4dDE=',
        passwordIv: 'aXYxMjM0NTY3OA==',
      });

    const credId = createRes.body.credential._id;

    const updateRes = await request(app)
      .put(`/api/credentials/${credId}`)
      .set('Cookie', userCookie)
      .send({
        title: 'Updated Title',
        isFavorite: true,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.credential.title).toBe('Updated Title');
    expect(updateRes.body.credential.isFavorite).toBe(true);
  });

  it('DELETE /api/credentials/:id removes a credential', async () => {
    const createRes = await request(app)
      .post('/api/credentials')
      .set('Cookie', userCookie)
      .send({
        title: 'To Be Deleted',
        encryptedPassword: 'Y2lwaGVydGV4dDE=',
        passwordIv: 'aXYxMjM0NTY3OA==',
      });

    const credId = createRes.body.credential._id;

    const deleteRes = await request(app)
      .delete(`/api/credentials/${credId}`)
      .set('Cookie', userCookie);

    expect(deleteRes.status).toBe(200);

    const checkRes = await request(app)
      .get(`/api/credentials/${credId}`)
      .set('Cookie', userCookie);

    expect(checkRes.status).toBe(404);
  });

  it('GET /api/health returns server status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('PassVault REST API');
  });
});
