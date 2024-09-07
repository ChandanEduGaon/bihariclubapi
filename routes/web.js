import express from "express";
const router = express.Router();
import {
  getK3PeriodList,
  getWingoPeriodList,
  getTrxWinPeriodList,
  getD5PreiodList,
} from "../controllers/DataController.js";
import {
  register,
  login,
  getUser,
  getUserBetHistory,
  getUserWinStatus,
  addUserBank,
  getUserBank,
  changeUserBank,
  getLoginList,
  getOtp,
  redeemGiftCode,
  getRedeemHistory,
  makeAttendance,
  getPromotion,
  getTransactionHistory,
  getInvitationList,
  getInviteBonus,
  getInviteBonusList,
  changePassword,
  upload,
  submitIssue,
} from "../controllers/UserController.js";
import { verifyUser } from "../middleware/Auth.js";
import {
  betD5,
  betK3,
  betTrx,
  betWingo,
} from "../controllers/WingoBetController.js";
import { getBanks } from "../controllers/MasterController.js";
import {
  checkout,
  deposit,
  getDepositList,
  webhook,
  withdraw,
} from "../controllers/PaymentController.js";
import { postReq } from "../ccavRequestHandler.js";

// Initialization
router.get("/", (req, res) => {
  res.send("Welcome");
});

// Payment Routes
router.post("/deposit", verifyUser, deposit);
router.post("/webhook", verifyUser, webhook);
router.post("/withdraw", verifyUser, withdraw);

// Users Routes
router.post("/register", register);
router.post("/login", login);
router.get("/getOtp", getOtp);

// Protected Routes
router.get("/getUser", verifyUser, getUser);
router.get("/getUserBetHistory", verifyUser, getUserBetHistory);
router.get("/getUserWinStatus", verifyUser, getUserWinStatus);

// User Add-data Routes
router.post("/addUserBank", verifyUser, addUserBank);
router.get("/getUserBank", verifyUser, getUserBank);
router.get("/changeUserBank", verifyUser, changeUserBank);
router.get("/getLoginList", verifyUser, getLoginList);
router.post("/redeemGiftCode", verifyUser, redeemGiftCode);
router.get("/getRedeemHistory", verifyUser, getRedeemHistory);
router.post("/makeAttendance", verifyUser, makeAttendance);

// Bet Routes
router.post("/betWingo", verifyUser, betWingo);
router.post("/betK3", verifyUser, betK3);
router.post("/betD5", verifyUser, betD5);
router.post("/betTrxWin", verifyUser, betTrx);

// Data Routes
router.get("/getWingoPreiodList", verifyUser, getWingoPeriodList);
router.get("/getK3PreiodList", verifyUser, getK3PeriodList);
router.get("/getD5PreiodList", verifyUser, getD5PreiodList);
router.get("/getTrxWinPeriodList", verifyUser, getTrxWinPeriodList);
router.get("/getDepositList", verifyUser, getDepositList);

router.get("/getPromotion", verifyUser, getPromotion);
router.get("/getTransactionHistory", verifyUser, getTransactionHistory);
router.get("/getInvitationList", verifyUser, getInvitationList);
router.get("/getInviteBonus", verifyUser, getInviteBonus);
router.get("/getInviteBonusList", verifyUser, getInviteBonusList);
router.post("/changePassword", verifyUser, changePassword);
router.post("/issues", verifyUser, upload.single("screenshot"), submitIssue);
// Master Routes
router.get("/banks", verifyUser, getBanks);
router.post("/checkout", verifyUser, postReq);

export default router;

/// Comment for testing
