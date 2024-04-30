import { catchAsyncError } from "../middlewares/async-error-handler.js";
import ErrorHandler from "../middlewares/error-handler.js";
import { User } from "../models/user-registration-model.js";
import { sendResponseToken } from "../utils/jwt-token.js";
import cloudinary from "cloudinary";

export const newUserRegistration = catchAsyncError(async (req, res, next) => {
	const { firstName, lastName, email, phone, dob, gender, password } = req.body;
	if (
		!firstName ||
		!lastName ||
		!email ||
		!phone ||
		!dob ||
		!gender ||
		!password
	) {
		return next(new ErrorHandler("Please fill required form fields!", 400));
	}

	let user = await User.findOne({ email });
	if (user) return next(new ErrorHandler("User Already Registered!", 400));
	user = await User.create({
		firstName,
		lastName,
		email,
		phone,
		password,
		dob,
		gender,
		role: "Regular",
	});
	sendResponseToken(user, res, 200, "User registration successful!");
});

export const login = catchAsyncError(async (req, res, next) => {
	const { email, password, confirmPassword, role } = req.body;
	if (!email || !password || !confirmPassword || !role) {
		return next(new ErrorHandler("Please fill all fields!"), 400);
	}
	// find user
	let user = await User.findOne({ email }).select("+password");
	if (!user) {
		return next(new ErrorHandler("Invalid Email or Password!"), 400);
	}
	const isPasswordMatch = await user.comparePassword(password);
	if (!isPasswordMatch) {
		return next(new ErrorHandler("Invalid Email or Password!"), 400);
	}
	if (role !== user.role) {
		return next(new ErrorHandler("User not found with this role!"), 400);
	}
	sendResponseToken(user, res, 200, "User login successful!");
});

export const newAdminRegistration = catchAsyncError(async (req, res, next) => {
	const { firstName, lastName, email, phone, dob, gender, password } = req.body;
	if (
		!firstName ||
		!lastName ||
		!email ||
		!phone ||
		!dob ||
		!gender ||
		!password
	) {
		return next(new ErrorHandler("Please fill required form fields!", 400));
	}
	const isRegistered = await User.findOne({ email });
	if (isRegistered) {
		return next(
			new ErrorHandler(
				`A ${isRegistered.role} user with this email already exist!`,
				400
			)
		);
	}
	const admin = await User.create({
		firstName,
		lastName,
		email,
		phone,
		dob,
		gender,
		password,
		role: "Admin",
	});
	res.status(200).json({
		success: true,
		message: "A new admin successfully registered!",
		admin,
	});
});

export const addNewStaff = catchAsyncError(async (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		return next(
			new ErrorHandler("Avatar required, please upload a photo!", 400)
		);
	}

	const avatar = req.files.undefined || req.files.avatar;

	console.log(req.files);
	const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
	console.log(avatar?.mimetype);
	if (!allowedFormats.includes(avatar?.mimetype)) {
		return next(
			new ErrorHandler(
				"Image format not allowed! please upload PNG, JPEG, or WEBP format.",
				400
			)
		);
	}
	const {
		firstName,
		lastName,
		email,
		phone,
		dob,
		gender,
		password,
		department,
		designation,
		joinDate,
	} = req.body;
	if (
		!firstName ||
		!lastName ||
		!email ||
		!phone ||
		!dob ||
		!gender ||
		!password ||
		!department ||
		!designation ||
		!joinDate ||
		!avatar
	) {
		return next(new ErrorHandler("Please Fill Full Form!", 400));
	}
	const isRegistered = await User.findOne({ email });
	if (isRegistered) {
		return next(
			new ErrorHandler(
				`${isRegistered.role} already registered with this email!`,
				400
			)
		);
	}
	const cloudinaryResponse = await cloudinary.uploader.upload(
		avatar.tempFilePath
	);
	if (!cloudinaryResponse || cloudinaryResponse.error) {
		console.error(
			"Cloudinary Error:",
			cloudinaryResponse.error || "Unknown Cloudinary error"
		);
		return next(
			new ErrorHandler("Failed To Upload Staff Avatar To Cloudinary", 500)
		);
	}

	const staff = await User.create({
		avatar: {
			public_id: cloudinaryResponse.public_id,
			url: cloudinaryResponse.secure_url,
		},
		firstName,
		lastName,
		email,
		phone,
		dob,
		gender,
		password,
		department,
		designation,
		joinDate,
		role: "Staff",
	});
	res.status(200).json({
		success: true,
		message: "New Staff Registered",
		staff,
	});
});

export const getAllUsers = catchAsyncError(async (req, res, next) => {
	const users = await User.find({});
	res.status(200).json({
		success: true,
		users,
	});
});
export const getOnlyUsers = catchAsyncError(async (req, res, next) => {
	const users = await User.find({ role: "Regular" });
	res.status(200).json({
		success: true,
		users,
	});
});
export const getOnlyStaffs = catchAsyncError(async (req, res, next) => {
	const users = await User.find({ role: "Staff" });
	res.status(200).json({
		success: true,
		users,
	});
});
export const getOnlyAdmins = catchAsyncError(async (req, res, next) => {
	const users = await User.find({ role: "Admin" });
	res.status(200).json({
		success: true,
		users,
	});
});

// Logout function for frontend user
export const logout = catchAsyncError(async (req, res, next) => {
	const tokenType =
		req.user.role === "Admin"
			? "adminToken"
			: req.user.role === "Regular"
			? "userToken"
			: "staffToken";
	res
		.status(201)
		.cookie(tokenType, "", { expires: new Date(Date.now()) })
		.json({
			success: true,
			message:
				req.user.role === "Admin"
					? "Admin Logged Out Successfully."
					: req.user.role === "Regular"
					? "User Logged Out Successfully."
					: "Staff Logged Out Successfully.",
		});
});
