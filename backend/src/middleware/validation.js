import validator from 'validator';

export const validateRegister = (req, res, next) => {
  const { email, masterPassword, vaultSalt } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!masterPassword || typeof masterPassword !== 'string' || masterPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Master password must be at least 8 characters long.',
    });
  }

  if (!vaultSalt || typeof vaultSalt !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Vault salt is required for zero-knowledge key derivation.',
    });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, masterPassword } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (!masterPassword || typeof masterPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Master password is required.',
    });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

export const validateCredential = (req, res, next) => {
  const { title, encryptedPassword, passwordIv } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Credential title is required.',
    });
  }

  if (!encryptedPassword || typeof encryptedPassword !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Encrypted password payload is required.',
    });
  }

  if (!passwordIv || typeof passwordIv !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password IV (initialization vector) is required.',
    });
  }

  next();
};
