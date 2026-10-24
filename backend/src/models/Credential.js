import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner user ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Credential title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    url: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Logins', 'Credit Cards', 'Secure Notes', 'Identity', 'Other'],
      default: 'Logins',
      index: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Sensitive client-side encrypted fields and their respective initialization vectors
    encryptedPassword: {
      type: String,
      required: [true, 'Encrypted password is required'],
    },
    passwordIv: {
      type: String,
      required: [true, 'Password IV is required'],
    },
    encryptedNotes: {
      type: String,
      default: '',
    },
    notesIv: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast owner lookups and sorting
credentialSchema.index({ userId: 1, updatedAt: -1 });
credentialSchema.index({ userId: 1, category: 1 });
credentialSchema.index({ userId: 1, isFavorite: 1 });

const Credential = mongoose.model('Credential', credentialSchema);
export default Credential;
