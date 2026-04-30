// import jwt, { Secret, SignOptions } from 'jsonwebtoken';
// import {envKey} from '../../config/envKey';

// interface JwtPayLoad {
//   id?: number;
//   email?: string;
//   name?: string;
//   role?: string;
//   type?: 'verification' | 'auth';
//   [key: string]: any;
// }

// const JWT_SECRET: Secret = envKey.jwtSecret!;

// const signToken = (
//   payload: JwtPayLoad,
//   expiresIn: SignOptions['expiresIn']
// ): string => {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn });
// };


// export const generateVerificationToken=(email:string):string=>{
//   return signToken(
//     {email, type:'verification'},
//     '1h'
//   );
// };

// export const generateAuthToken=(payload:{
//   id: number;
//   name?: string;
//   email: string;
//   role: string;
// }): string=>{
//   return signToken(
//     { ...payload, type: 'auth'},
//     '7d'
//   );
// };

// export const verifyToken= (token: string): JwtPayLoad | null =>{
//   try{
//     const decoded= jwt.verify(token, JWT_SECRET) as JwtPayLoad;
//     return decoded;
//   } catch (errror){
//     return null;
//   }
// };

// export const isValidVerificationToken= (token: string, expectedEmail: string): boolean=>{
//   const payload= verifyToken(token);
//   if(!payload) return false;

//   return(
//     payload.type ==='verification' &&
//     payload.email === expectedEmail &&
//     payload.exp !== undefined &&
//     Date.now() < payload.exp * 100
//   );
// }

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { envKey } from '../../config/envKey';

interface JwtPayLoad {
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  type?: 'verification' | 'auth';
  exp?: number;
  [key: string]: any;
}

const JWT_SECRET: Secret = envKey.jwtSecret!;

const signToken = (
  payload: JwtPayLoad,
  expiresIn: SignOptions['expiresIn']
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateVerificationToken = (email: string): string => {
  return signToken(
    { email, type: 'verification' },
    '1h'
  );
};

export const generateAuthToken = (payload: {
  id: number;
  name?: string;
  email: string;
  role: string;
}): string => {
  return signToken(
    { ...payload, type: 'auth' },
    '7d'
  );
};

export const verifyToken = (token: string): JwtPayLoad | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayLoad;
  } catch {
    return null;
  }
};

export const isValidVerificationToken = (
  token: string,
  expectedEmail: string
): boolean => {
  const payload = verifyToken(token);
  if (!payload || !payload.exp) return false;

  return (
    payload.type === 'verification' &&
    payload.email === expectedEmail &&
    Date.now() < payload.exp * 1000
  );
};
