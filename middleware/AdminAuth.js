import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import dotenv from "dotenv";
import validator from "validator";

export const verifyAdmin = (req, res, next) => {
  const userId = req.query.id;

  const uid = req.cookies.uid;

  if (uid) {
    next();
  } else {
    if (!userId) {
      res.send("You do not have any valid uid to access this!");
    } else {
      pool.query(
        "SELECT * FROM users WHERE `uid` = ?",
        [userId],
        async (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          if (results.length === 0) {
            res.send("You do not have any valid uid to access this!");
          } else {
            const user = results[0];
            if (user.role === "admin") {
              if (user && user.uid) {
                res.cookie("uid", user.uid);
              } else {
                console.error("User or UID is not defined");
              }
              next();
            } else {
              res.send("You do not have permission to access this!");
            }
          }
        }
      );
    }
  }
};
