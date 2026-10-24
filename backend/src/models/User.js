import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return passwordHash in standard queries
    },
    vaultSalt: {
      type: String,
      required: [true, 'Vault salt is required for client-side zero-knowledge encryption'],
    },
    settings: {
      autoLockTimeout: {
        type: Number,
        default: 15, // in minutes
      },
      theme: {
        type: String,
        default: 'warm-ivory',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compare candidate master password with stored bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash master password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Sanitize user object for responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
