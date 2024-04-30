import { Router } from "express";
import {
	deleteAllNotice,
	deleteNotice,
	editNotice,
	getAllNotice,
	getSingleNotice,
	postNotice,
} from "../controllers/notice-controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";
const router = Router();

router.get("/all", getAllNotice);
router.post("/new", isAdminAuthenticated, postNotice);
router.get("/:id", isAdminAuthenticated, getSingleNotice);
router.post("/delete/:id", isAdminAuthenticated, deleteNotice);
router.put("/update/:id", isAdminAuthenticated, editNotice);
router.post("/deleteAll", isAdminAuthenticated, deleteAllNotice);

export default router;
