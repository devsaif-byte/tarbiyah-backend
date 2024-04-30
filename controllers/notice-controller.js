import { catchAsyncError } from "../middlewares/async-error-handler.js";
import ErrorHandler from "../middlewares/error-handler.js";
import { Notice } from "../models/notice-model.js";
import { User } from "../models/user-registration-model.js";
import cloudinary from "cloudinary";

export const postNotice = catchAsyncError(async (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		return next(
			new ErrorHandler("Cover required, please upload a photo!", 400)
		);
	}

	const { cover } = req.files;

	console.log(cover);
	const allowedFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
	if (!allowedFormats.includes(cover.mimetype)) {
		return next(
			new ErrorHandler(
				"Image format not allowed! please upload PNG, JPEG, or WEBP format.",
				400
			)
		);
	}
	const { title, description } = req.body;

	if (!title || !description || !cover)
		return next(
			new ErrorHandler("Cannot create empty post!, write something."),
			400
		);
	if (req.user.role !== "Admin")
		return next(new ErrorHandler("Only admin can post a notice."), 400);

	const isAlreadyExist = await Notice.findOne({ title, description });

	if (isAlreadyExist) {
		return next(
			new ErrorHandler(
				"Look like The Notice already exist! You can create another one."
			),
			400
		);
	}

	const cloudinaryResponse = await cloudinary.uploader.upload(
		cover.tempFilePath
	);
	if (!cloudinaryResponse || cloudinaryResponse.error) {
		console.error(
			"Cloudinary Error:",
			cloudinaryResponse.error || "Unknown Cloudinary error"
		);
		return next(
			new ErrorHandler("Failed To Upload notice cover image To Cloudinary", 500)
		);
	}

	const post = await Notice.create({
		cover: {
			public_id: cloudinaryResponse.public_id,
			url: cloudinaryResponse.secure_url,
		},
		title,
		description,
		postedBy: req.user._id,
	});
	res.status(200).json({
		success: true,
		message: "A new Notice was posted!",
		post,
	});
});
export const getSingleNotice = catchAsyncError(async (req, res, next) => {
	const id = req.params.id;
	const notice = await Notice.findById(id);
	res.status(200).json({
		success: true,
		notice,
	});
});
export const getAllNotice = catchAsyncError(async (req, res, next) => {
	const notices = await Notice.find({});
	const authorId = notices.map((n) => n.postedBy);
	const authors = await User.find({ _id: { $in: authorId } });
	// Create a map of author IDs to their corresponding author objects
	const authorMap = new Map();
	authors.forEach((author) => {
		authorMap.set(author._id.toString(), author);
	});

	// Merge notices with their respective authors
	const noticesWithAuthors = notices.map((notice) => {
		return {
			...notice.toObject(),
			author: authorMap.get(notice.postedBy.toString()),
		};
	});
	res.status(200).json({
		success: true,
		noticesWithAuthors,
	});
});
export const editNotice = catchAsyncError(async (req, res, next) => {
	const { title, description } = req.body;
	const id = req.params.id;
	if (!title || !description) {
		return next(new ErrorHandler("Title and description are required.", 400));
	}
	const notice = await Notice.findByIdAndUpdate(
		id,
		{ title, description },
		{
			new: true, // if true, return the modified document rather than the original
			strict: true,
		}
	);
	if (!notice) {
		return next(new ErrorHandler("Notice not found.", 404));
	}
	res.status(200).json({
		success: true,
		message: "Notice updated successfully.",
		notice,
	});
});
export const deleteNotice = catchAsyncError(async (req, res, next) => {
	const id = req.params.id;
	const notice = await Notice.findOne(id);
	if (!notice) {
		return next(new ErrorHandler("Notice not found.", 404));
	}
	res.status(200).json({
		success: true,
		message: "The Notice was deleted!",
	});
});
export const deleteAllNotice = catchAsyncError(async (req, res, next) => {
	const notice = await Notice.deleteMany({});
	if (!notice) {
		return next(new ErrorHandler("Notice not found.", 404));
	}
	res.status(200).json({
		success: true,
		message: "All Notice was deleted successfully!",
	});
});
