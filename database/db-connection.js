import mongoose from "mongoose";

export const dbConnection = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			dbName: "TARBIYAH_SCHOOL_PROJECT",
		});
		console.log("successfully connected to MONGODB ✅🚀");
	} catch (error) {
		console.log("error occurred while connecting to database ❌!", error);
	}
};
