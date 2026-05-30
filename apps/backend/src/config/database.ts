import mongoose from 'mongoose';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Using existing database connection');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message || err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('♻️ MongoDB reconnected');
        this.isConnected = true;
      });

      try {
        console.log('🔌 Connecting to primary MongoDB...');
        await mongoose.connect(mongoUri, {
          maxPoolSize: 10, // Connection pool size
          serverSelectionTimeoutMS: 5000, // Timeout after 5s
          socketTimeoutMS: 45000, // Close sockets after 45s
        });

        this.isConnected = true;
        console.log('✅ MongoDB connected successfully to primary database');
      } catch (primaryError: any) {
        console.error('⚠️ Primary MongoDB connection failed:', primaryError.message || primaryError);
        
        // In production, do not attempt to fall back to local MongoDB
        if (process.env.NODE_ENV === 'production') {
          throw primaryError;
        }
        
        try {
          console.log('🔄 Disconnecting and resetting Mongoose connection state...');
          await mongoose.disconnect();
        } catch (disconnectError) {
          // ignore disconnect error
        }

        console.log('🔄 Attempting fallback to local MongoDB instance...');
        const fallbackUri = 'mongodb://127.0.0.1:27017/devplatform';
        await mongoose.connect(fallbackUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        this.isConnected = true;
        console.log('✅ Connected successfully to local fallback MongoDB');
      }

    } catch (error) {
      console.error('💥 MongoDB connection completely failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 MongoDB disconnected gracefully');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  public getConnectionStatus(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export default Database.getInstance();