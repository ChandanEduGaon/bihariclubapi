import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import dotenv from "dotenv";
import validator from "validator";
import { generateOrderId, increaseAmountByPercentage } from "../utils.js";

dotenv.config();

export const deposit = async (req, res) => {
  const order_id = generateOrderId();
  const payType = req.body.pay_type;
  const uid = req.body.uid;
  const amount = req.body.amount;
  const payload = {
    customer_mobile: req.body.phone,
    user_token: "086150a284eb0aeaa38d017ecc14dd65",
    amount: req.body.amount,
    order_id: order_id,
    redirect_url: req.body.redirect_url,
    remark1: req.body.remark1,
    remark2: req.body.remark2,
  };

  const fDeposit = [
    { deposit: 200, bonus: 28 },
    { deposit: 400, bonus: 48 },
    { deposit: 1000, bonus: 108 },
    { deposit: 2000, bonus: 188 },
    { deposit: 10000, bonus: 488 },
    { deposit: 24000, bonus: 1388 },
    { deposit: 120000, bonus: 5888 },
    { deposit: 240000, bonus: 8888 },
  ];

  try {
    const response = await axios.post(
      "https://arkpay.pepelottery.in/api/create-order",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status) {
      pool.query(
        "SELECT percent FROM pay_type WHERE type = ?",
        [payType],
        (error, results) => {
          if (error) {
            console.error("Database query error:", error.message);
            return res.status(500).json({ message: "Database error" });
          }

          if (results.length > 0) {
            const game_amount = increaseAmountByPercentage(
              amount,
              results[0].percent
            );

            // Check if it's the user's first deposit
            pool.query(
              "SELECT COUNT(*) as count FROM deposit WHERE uid = ? AND status = ?",
              [uid, "success"],
              (error, results) => {
                if (error) {
                  console.error("Database query error:", error.message);
                  return res.status(500).json({ message: "Database error" });
                }

                const isFirstDeposit = results[0].count === 0;

                pool.query(
                  "INSERT INTO deposit (uid, deposit_amount, received_amount, payment_platform, pay_type, status, transaction_id, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  [
                    uid,
                    amount,
                    game_amount,
                    payType,
                    payType,
                    "pending",
                    order_id,
                    order_id,
                  ],
                  (error, results) => {
                    if (error) {
                      console.error("Database insertion error:", error.message);
                      return res
                        .status(500)
                        .json({ message: "Database error" });
                    }

                    // If it's the first deposit, update the user's bonus
                    if (isFirstDeposit) {
                      const bonusEntry = fDeposit.find(
                        (entry) => entry.deposit === amount
                      );
                      if (bonusEntry) {
                        pool.query(
                          "UPDATE users SET first_deposit = ? WHERE uid = ?",
                          [bonusEntry.bonus, uid],
                          (error, results) => {
                            if (error) {
                              console.error(
                                "Database update error:",
                                error.message
                              );
                              return res
                                .status(500)
                                .json({ message: "Database error" });
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            );
          }
        }
      );
    }

    res.json({
      message: "Order created successfully",
      status: true,
      data: response.data,
    });
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
};

import { format } from "date-fns"; // For date formatting

export const withdraw = async (req, res) => {
  const uid = req.body.uid;
  const amount = req.body.amount;
  const payment_platform = "xgame";
  const transaction_id = generateOrderId();
  const remarks = "Withdrawal request.";
  const order_id = generateOrderId();

  // Get the current date in YYYY-MM-DD format
  const currentDate = format(new Date(), "yyyy-MM-dd");

  try {
    // Query to check if there's already a withdrawal for the user on the current date
    pool.query(
      "SELECT COUNT(*) as count FROM withdrawal WHERE uid = ? AND DATE(created_at) = ?",
      [uid, currentDate],
      (error, results) => {
        if (error) {
          console.error("Database query error:", error.message);
          return res.status(500).json({
            message: "Internal server error",
            status: false,
          });
        }

        const withdrawalCount = results[0].count;

        if (withdrawalCount > 0) {
          // User has already withdrawn today
          return res.json({
            message: "You have already made a withdrawal today.",
            status: false,
          });
        }

        // Proceed with the withdrawal insertion if no withdrawal exists for today
        pool.query(
          "INSERT INTO withdrawal (uid, amount, payment_platform, status, transaction_id, remarks, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            uid,
            amount,
            payment_platform,
            "pending",
            transaction_id,
            remarks,
            order_id,
          ],
          (insertError, insertResults) => {
            if (insertError) {
              console.error("Database insertion error:", insertError.message);
              return res.status(500).json({
                message: "Internal server error",
                status: false,
              });
            }
            res.json({
              message: "Withdrawal request created successfully",
              status: true,
              data: {},
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(error.response?.status || 500).send(error.message);
  }
};

export const webhook = async (req, res) => {
  res.json({
    message: "Webhook called successfully",
    status: true,
    data: req.body,
  });
};

export const getDepositList = async (req, res) => {
  const pay_type = req.query.pay_type ? req.query.pay_type : "";
  const uid = req.query.uid ? req.query.uid : "";
  const status = req.query.status ? req.query.status : "";
  const date = req.query.date ? req.query.date : "";
  let query = "";
  let values = "";

  if (status === "all") {
    query =
      "SELECT uid, deposit_amount, pay_type, status, transaction_id, created_at FROM deposit WHERE `uid` = ? AND `pay_type` = ? AND DATE(created_at) > ? ORDER BY `id` DESC";
    values = [uid, pay_type, date];
  } else {
    query =
      "SELECT uid, deposit_amount, pay_type, status, transaction_id, created_at FROM deposit WHERE `uid` = ? AND `pay_type` = ? AND `status` = ? AND DATE(created_at) = ? ORDER BY `id` DESC";
    values = [uid, pay_type, status, date];
  }

  pool.query(query, values, (error, results) => {
    if (error) {
      console.error("Database query error:", error.message);
      return res.status(500).json({ error: "Database query error" });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Data not found",
        status: false,
      });
    } else {
      return res.status(200).json({
        message: "Data fetched successfully",
        status: true,
        data: results,
      });
    }
  });
};


export const checkout = (req, res) => {
  res.json({
    message: "Withdrawal request created successfully",
    status: true,
    data: {},
  }); 
};