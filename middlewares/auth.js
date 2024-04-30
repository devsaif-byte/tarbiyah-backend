import { User } from "../models/user-registration-model.js";
import { catchAsyncError } from "./async-error-handler.js";
import ErrorHandler from "./error-handler.js";
import jwt from "jsonwebtoken";

export const isAdminAuthenticated = catchAsyncError(async (req, res, next) => {
	const token = req.cookies.adminToken;
	if (!token) return next(new ErrorHandler("Admin not authenticated!", 400));
	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	req.user = await User.findById(decoded.id);
	if (req.user.role !== "Admin")
		return next(
			new ErrorHandler(
				`${req.user.role} is not authorized for this resource!`,
				400
			)
		);
	next();
});
export const isUserAuthenticated = catchAsyncError(async (req, res, next) => {
	const token = req.cookies.userToken;
	if (!token) return next(new ErrorHandler("User not authenticated!", 400));

	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	req.user = await User.findById(decoded.id);
	if (req.user.role !== "Regular")
		return next(
			new ErrorHandler(
				`${req.user.role} is not authorized for this resource!`,
				400
			)
		);
	next();
});
export const isStaffAuthenticated = catchAsyncError(async (req, res, next) => {
	const token = req.cookies.staffToken;
	if (!token) return next(new ErrorHandler("Staff not authenticated!", 400));

	const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
	req.user = await User.findById(decoded.id);
	if (req.user.role !== "Staff")
		return next(
			new ErrorHandler(
				`${req.user.role} is not authorized for this resource!`,
				400
			)
		);
	next();
});
