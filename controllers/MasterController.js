import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import validator from "validator";
import { generateGiftCode, generateRandomValues } from "../utils.js";

dotenv.config();

const secret = process.env.JWT_SECRET;

export const getBanks = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT `id`, `bank_name` as name FROM banks",
    [],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Compare hashed password
      const banks = results;
      res.json({
        message: "Banks fetched successfully",
        status: true,
        data: banks,
      });
    }
  );
};

export const setGiftCode = (req, res) => {
  const { amount, redeem_limit, gift_code } = req.body;
  const giftCode = generateGiftCode(gift_code);

  pool.query(
    "INSERT INTO gift_code (code, amount, redeem_limit) VALUES (?, ?, ?)",
    [giftCode, amount, redeem_limit],
    (error, results) => {
      if (error) {
        console.error("Database insertion error:", error.message);
        return res.status(500).json({ error: "Database insertion error" });
      }

      res.json({
        message: "Gift code registered successfully",
        status: true,
      });
    }
  );
};
