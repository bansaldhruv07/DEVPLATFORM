import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role:string;
}

export const generateAccessToken = (
  payload: TokenPayload
): string => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn:
        process.env.JWT_ACCESS_EXPIRE as SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (
  payload: TokenPayload
): string => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRE as SignOptions["expiresIn"],
    }
  );
};

export const verifyAccessToken = (
  token: string
): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET as string
  ) as TokenPayload;
};

export const verifyRefreshToken = (
  token: string
): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as TokenPayload;
};