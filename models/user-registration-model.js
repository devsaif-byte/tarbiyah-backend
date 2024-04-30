import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

// This user schema for registering dashboard user

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "First Name Is Required!"],
		minLength: [3, "First Name Must Contain At Least 3 Characters!"],
	},
	lastName: {
		type: String,
		required: [true, "Last Name Is Required!"],
		minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
	},
	email: {
		type: String,
		required: [true, "Email Is Required!"],
		validate: [validator.isEmail, "Provide A Valid Email!"],
	},
	phone: {
		type: String,
		required: [true, "Phone Is Required!"],
		minLength: [11, "Phone Number Must Contain Exact 11 Digits!"],
		maxLength: [11, "Phone Number Must Contain Exact 11 Digits!"],
	},
	dob: {
		type: Date,
		required: [true, "DOB Is Required!"],
	},
	gender: {
		type: String,
		required: [true, "Gender Is Required!"],
		enum: ["Male", "Female"],
	},
	password: {
		type: String,
		required: [true, "Password Is Required!"],
		minLength: [8, "Password Must Contain At Least 8 Characters!"],
		select: false,
	},
	role: {
		type: String,
		required: [true, "User Role Required!"],
		enum: ["Regular", "Admin", "Staff"],
	},
	joinDate: {
		type: Date,
	},
	designation: {
		type: String,
	},
	department: {
		type: String,
	},
	avatar: {
		public_id: String,
		url: String,
	},
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next();
	else this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

export const User = mongoose.model("User", userSchema);
