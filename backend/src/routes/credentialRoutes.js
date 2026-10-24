import { Router } from 'express';
import {
  getCredentials,
  getCredentialById,
  createCredential,
  updateCredential,
  deleteCredential,
} from '../controllers/credentialController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateCredential } from '../middleware/validation.js';

const router = Router();

// All credential operations require authentication
router.use(requireAuth);

router.get('/', getCredentials);
router.post('/', validateCredential, createCredential);
router.get('/:id', getCredentialById);
router.put('/:id', updateCredential);
router.delete('/:id', deleteCredential);

export default router;
