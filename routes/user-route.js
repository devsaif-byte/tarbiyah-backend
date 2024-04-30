import { Router } from "express";
import {
	addNewStaff,
	getAllUsers,
	getOnlyAdmins,
	getOnlyStaffs,
	getOnlyUsers,
	login,
	logout,
	newAdminRegistration,
	newUserRegistration,
} from "../controllers/user-controller.js";
import {
	isAdminAuthenticated,
	isStaffAuthenticated,
	isUserAuthenticated,
} from "../middlewares/auth.js";

const router = Router();

// Post methods
router.post("/register", newUserRegistration);
router.post("/login", login);
router.post("/regular/logout", isUserAuthenticated, logout);
router.post("/admin/logout", isAdminAuthenticated, logout);
router.post("/staff/logout", isStaffAuthenticated, logout);
// Post methods (new admin and staffs registration)
router.post("/admin/add-new", isAdminAuthenticated, newAdminRegistration);
router.post("/staff/add-new", isAdminAuthenticated, addNewStaff);
// Get methods

router.get("/all", isAdminAuthenticated, getAllUsers);
router.get("/admin/me", isAdminAuthenticated, getOnlyAdmins);
router.get("/regular/me", isUserAuthenticated, getOnlyUsers);
router.get("/regular/all", isAdminAuthenticated, getOnlyUsers);
router.get("/staff/me", isStaffAuthenticated, getOnlyStaffs);
router.get("/staff/all", getOnlyStaffs);
export default router;
