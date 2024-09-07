import express from "express";
const adminRouter = express.Router();
import { verifyUser } from "../middleware/Auth.js";
import { setGiftCode } from "../controllers/MasterController.js";
import {
  adminUsers,
  adminTrx,
  adminWingo,
  adminDashboard,
  adminUserDetails,
  withdrawalRequests,
  giftCodes,
  moneyControl,
  issues,
} from "../controllers/AdminController.js";
import { verifyAdmin } from "../middleware/AdminAuth.js";
import {
  blockUser,
  createGiftCode,
  deleteGiftCode,
  getAdminDetail,
  getBetAmount,
  getBetList,
  getGiftCodeList,
  getUserList,
  getWingoPeriodList,
  moneyAdd,
  setResult,
  withdrawalApprove,
} from "../controllers/AdminDataController.js";

adminRouter.post("/setGiftCode", verifyUser, setGiftCode);
adminRouter.get("/dashboard", verifyAdmin, adminDashboard);
adminRouter.get("/users", verifyAdmin, adminUsers);
adminRouter.get("/wingo", verifyAdmin, adminWingo);
adminRouter.get("/trx", verifyAdmin, adminTrx);
adminRouter.get("/wingolist", verifyAdmin, getWingoPeriodList);
adminRouter.get("/getBetList", verifyAdmin, getBetList);
adminRouter.get("/getBetAmount", verifyAdmin, getBetAmount);
adminRouter.get("/setResult", verifyAdmin, setResult);

adminRouter.get("/getUserList", verifyAdmin, getUserList);
adminRouter.get("/blockUser", verifyAdmin, blockUser);
adminRouter.get("/getAdminDetail", verifyAdmin, getAdminDetail);
adminRouter.get("/user/details", verifyAdmin, adminUserDetails);
adminRouter.get("/withdrawal/requests", verifyAdmin, withdrawalRequests);
adminRouter.get(
  "/withdrawal/requests/approve",
  verifyAdmin,
  withdrawalApprove
);
adminRouter.get("/gift/codes", verifyAdmin, giftCodes);
adminRouter.get("/gift/code/list", verifyAdmin, getGiftCodeList);
adminRouter.get("/gift/code/delete", verifyAdmin, deleteGiftCode);
adminRouter.post("/gift/code/create", verifyAdmin, createGiftCode);

adminRouter.get("/money/control", verifyAdmin, moneyControl);
adminRouter.post("/money/add", verifyAdmin, moneyAdd);
adminRouter.get("/issues", verifyAdmin, issues);



export default adminRouter;
