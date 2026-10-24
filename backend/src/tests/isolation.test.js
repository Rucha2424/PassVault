import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './testHelper.js';

describe('User Data Isolation & Security Enforcement', () => {
  setupTestDB();

  let userACookie;
  let userBCookie;
  let userACredentialId;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'userA@vault.local',
        masterPassword: 'MasterPasswordUserA!123',
        vaultSalt: 'c2FsdFVzZXJBMTIzNDU2Nw==',
      });
    userACookie = resA.headers['set-cookie'];

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'userB@vault.local',
        masterPassword: 'MasterPasswordUserB!456',
        vaultSalt: 'c2FsdFVzZXJCMTIzNDU2Nw==',
      });
    userBCookie = resB.headers['set-cookie'];

    // User A creates a confidential credential
    const credRes = await request(app)
      .post('/api/credentials')
      .set('Cookie', userACookie)
      .send({
        title: "User A's Super Secret Project",
        encryptedPassword: 'dXNlckFfc2VjcmV0X2NpcGhlcg==',
        passwordIv: 'dXNlckFfaXYxMjM0NTY3OA==',
      });
    userACredentialId = credRes.body.credential._id;
  });

  it("User B cannot see User A's credentials in their vault list", async () => {
    const res = await request(app)
      .get('/api/credentials')
      .set('Cookie', userBCookie);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.credentials).toEqual([]);
  });

  it("User B receives 404 when attempting to access User A's credential by ID", async () => {
    const res = await request(app)
      .get(`/api/credentials/${userACredentialId}`)
      .set('Cookie', userBCookie);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("User B cannot update User A's credential", async () => {
    const res = await request(app)
      .put(`/api/credentials/${userACredentialId}`)
      .set('Cookie', userBCookie)
      .send({
        title: 'Hacked by User B',
      });

    expect(res.status).toBe(404);

    // Verify original title unchanged
    const verifyRes = await request(app)
      .get(`/api/credentials/${userACredentialId}`)
      .set('Cookie', userACookie);

    expect(verifyRes.body.credential.title).toBe("User A's Super Secret Project");
  });

  it("User B cannot delete User A's credential", async () => {
    const res = await request(app)
      .delete(`/api/credentials/${userACredentialId}`)
      .set('Cookie', userBCookie);

    expect(res.status).toBe(404);

    // Verify credential still exists for User A
    const verifyRes = await request(app)
      .get(`/api/credentials/${userACredentialId}`)
      .set('Cookie', userACookie);

    expect(verifyRes.status).toBe(200);
  });
});
