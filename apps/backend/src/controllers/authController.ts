import { Request, Response } from 'express';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

// =========================
// Register User
// =========================
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Create user
    // Password hashing should happen in model pre-save hook
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
    });

    // Token payload
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate tokens
    const accessToken = generateAccessToken(tokenPayload);

    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
    });

    return;
  } catch (error: unknown) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error instanceof Error ? error.message : String(error),
    });

    return;
  }
};

// =========================
// Login User
// =========================
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });

      return;
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });

      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });

      return;
    }

    // Token payload
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Generate tokens
    const accessToken = generateAccessToken(tokenPayload);

    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
      },
    });

    return;
  } catch (error: unknown) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error instanceof Error ? error.message : String(error),
    });

    return;
  }
};

// =========================
// Refresh Access Token
// =========================
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Check refresh token
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      });

      return;
    }

    // Verify token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.status(200).json({
      success: true,
      message: 'Access token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });

    return;
  } catch (error: unknown) {
    console.error('REFRESH TOKEN ERROR:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: error instanceof Error ? error.message : String(error),
    });

    return;
  }
};

// =========================
// Logout User
// =========================
export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });

    return;
  } catch (error: unknown) {
    console.error('LOGOUT ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error instanceof Error ? error.message : String(error),
    });

    return;
  }
};