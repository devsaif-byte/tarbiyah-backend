class ErrorHandler extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}
export const errorHandler = (err, req, res, next) => {
	err.message = err.message || "Internal Server Error!";
	err.statusCode = err.statusCode || 500;

	if (err.name === "CastError")
		err = new ErrorHandler(`Resource not found. Invalid ${err.path}`, 400);
	if (err.code === 11000)
		err = new ErrorHandler(
			`Duplicate ${Object.keys(err.keyValue)} entered.`,
			400
		);
	if (err.name === "JsonWebTokenError")
		err = new ErrorHandler(`Json web token is invalid. try again!`, 400);
	if (err.name === "TokenExpiredError")
		err = new ErrorHandler(`Json token expired!`, 400);
	const errorMessage = err.errors
		? Object.values(err.errors)
				.map((error) => error.message)
				.join(" ")
		: err.message;

	return res.status(err.statusCode).json({
		success: true,
		message: errorMessage,
	});
};
export default ErrorHandler;
