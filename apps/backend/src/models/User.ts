import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface for User document
export interface IUser extends Document {
  email: string;
  password: string; // Will be hashed
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  googleId?: string; // For OAuth
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: function(this: IUser) {
        // Password required only if not using Google OAuth
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Auto-creates createdAt & updatedAt
  }
);

// Indexes for performance
UserSchema.index({ email: 1 }); // Ascending index on email
UserSchema.index({ googleId: 1 });

// Create and export model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;