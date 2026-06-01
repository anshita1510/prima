"use strict";
// import jwt, { Secret, SignOptions } from 'jsonwebtoken';
// import {envKey} from '../../config/envKey';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVerificationToken = exports.verifyToken = exports.generateAuthToken = exports.generateVerificationToken = void 0;
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envKey_1 = require("../../config/envKey");
const JWT_SECRET = envKey_1.envKey.jwtSecret;
const signToken = (payload, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
};
const generateVerificationToken = (email) => {
    return signToken({ email, type: 'verification' }, '1h');
};
exports.generateVerificationToken = generateVerificationToken;
const generateAuthToken = (payload) => {
    return signToken({ ...payload, type: 'auth' }, '7d');
};
exports.generateAuthToken = generateAuthToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyToken = verifyToken;
const isValidVerificationToken = (token, expectedEmail) => {
    const payload = (0, exports.verifyToken)(token);
    if (!payload || !payload.exp)
        return false;
    return (payload.type === 'verification' &&
        payload.email === expectedEmail &&
        Date.now() < payload.exp * 1000);
};
exports.isValidVerificationToken = isValidVerificationToken;
