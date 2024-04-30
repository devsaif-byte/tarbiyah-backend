import mongoose from "mongoose";

export const noticeSchema = new mongoose.Schema({
	cover: {
		public_id: String,
		url: String,
	},
	title: {
		type: String,
		required: true,
		minLength: [3, "Title must contain at least 3 Characters!"],
		maxLength: [120, "Title cannot exceed 120 Characters!"],
	},
	description: {
		type: String,
		required: [true, "Please provide description."],
		minLength: [30, "Description must contain at least 30 Characters!"],
		maxLength: [5000, "Description cannot exceed 5000 Characters!"],
	},
	postedOn: {
		type: Date,
		default: Date.now,
	},
	postedBy: {
		type: mongoose.Schema.ObjectId,
		ref: "Admin",
		required: true,
	},
});
export const Notice = mongoose.model("Notice", noticeSchema);
