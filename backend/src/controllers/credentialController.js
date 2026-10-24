import Credential from '../models/Credential.js';

/**
 * Get all credentials for current user
 * GET /api/credentials
 */
export const getCredentials = async (req, res, next) => {
  try {
    const { category, favorite, search } = req.query;

    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }

    const credentials = await Credential.find(query).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: credentials.length,
      credentials,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single credential by ID
 * GET /api/credentials/:id
 */
export const getCredentialById = async (req, res, next) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found.',
      });
    }

    res.status(200).json({
      success: true,
      credential,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new encrypted credential
 * POST /api/credentials
 */
export const createCredential = async (req, res, next) => {
  try {
    const {
      title,
      url,
      username,
      category,
      isFavorite,
      encryptedPassword,
      passwordIv,
      encryptedNotes,
      notesIv,
    } = req.body;

    const credential = await Credential.create({
      userId: req.user._id,
      title,
      url: url || '',
      username: username || '',
      category: category || 'Logins',
      isFavorite: !!isFavorite,
      encryptedPassword,
      passwordIv,
      encryptedNotes: encryptedNotes || '',
      notesIv: notesIv || '',
    });

    res.status(201).json({
      success: true,
      message: 'Credential saved securely.',
      credential,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing credential
 * PUT /api/credentials/:id
 */
export const updateCredential = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title',
      'url',
      'username',
      'category',
      'isFavorite',
      'encryptedPassword',
      'passwordIv',
      'encryptedNotes',
      'notesIv',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const credential = await Credential.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Credential updated.',
      credential,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a credential
 * DELETE /api/credentials/:id
 */
export const deleteCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
