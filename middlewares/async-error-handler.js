/**
 * Utility function to catch asynchronous errors in route handlers.
 * @param {Function} payLoadFunction - The route handler function to be executed.
 * @returns {Function} - A middleware function that catches errors and passes them to the Express error handler.
 */
export const catchAsyncError = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
