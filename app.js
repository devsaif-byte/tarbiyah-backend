import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cookieSession from "cookie-session";
import { errorHandler } from "./middlewares/error-handler.js";
import { dbConnection } from "./database/db-connection.js";
import userRouter from "./routes/user-route.js";
import noticeRouter from "./routes/notice-route.js";
const app = express();
dotenv.config({ path: "./configs/config.env" });

const corsOptions = {
	origin: [
		process.env.FRONTEND_URL_PROD_MODE,
		process.env.FRONTEND_URL_DEV_MODE,
		process.env.DASHBOARD_URL_DEV_MODE,
	],
	methods: ["GET", "POST", "DELETE", "PUT"],
	credentials: true,
};
app.use(
	// using json, urlencoded, fileupload for cloudinary
	express.urlencoded({ extended: true }),
	fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }),
	express.json()
);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
	// using cookie session
	cookieSession({
		name: "session",
		keys: [process.env.COOKIE_SESSION_KEY1, process.env.COOKIE_SESSION_KEY2],
		domain: [
			process.env.FRONTEND_URL_DEV_MODE,
			process.env.FRONTEND_URL_PROD_MODE,
			process.env.DASHBOARD_URL_DEV_MODE,
		],
		sameSite: process.env.FRONTEND_URL_PROD_MODE ? "none" : "lax",
		httpOnly: true,
		secure: process.env.FRONTEND_URL_PROD_MODE ? true : false, // set to true because I'll be using https in production,
		expires: new Date(
			Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
	})
);

// using routes
app.use("/api/v1/user", cors(corsOptions), userRouter);
app.use("/api/v1/notice", cors(corsOptions), noticeRouter);
// calling database function
dbConnection();
// using custom error middleware
app.use(errorHandler);
export default app;
