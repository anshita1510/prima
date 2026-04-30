
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";

const app = express();

// Security middleware
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


export default app;