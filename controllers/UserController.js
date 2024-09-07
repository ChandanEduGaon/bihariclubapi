import pool from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import path from "path";
import multer from "multer";
import dotenv from "dotenv";
import validator from "validator";
import { generateOtp, generateRandomValues } from "../utils.js";

dotenv.config();

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "issue_" + Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

export const submitIssue = async (req, res) => {

  const { description, uid, phone } = req.body;
  const screenshot = req.file ? req.file.filename : null;

  const sql = "INSERT INTO issues (des, file, uid, phone) VALUES (?, ?, ?, ?)";
  pool.query(sql, [description, screenshot, uid, phone], (error, results) => {
    if (error) {
      console.error("Database insertion error:", error.message);
      return res
        .status(500)
        .json({ status: false, error: "Database insertion error" });
    }

    res.json({ status: true, message: "Issue submitted successfully" });
  });
};

const secret = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { phone, password, otp, invite_code } = req.body;
    const userip = req.socket.remoteAddress;

    // Validate phone
    if (!validator.isMobilePhone(phone, "any")) {
      return res.status(200).json({
        message: "Invalid phone number format",
        status: false,
        data: [],
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(200).json({
        message: "Password must be at least 6 characters long",
        status: false,
        data: [],
      });
    }

    // Use promise wrapper to enable async/await
    const [otpResult] = await pool
      .promise()
      .query(
        "SELECT otp FROM otp WHERE `user_ip` = ? ORDER BY id DESC LIMIT 1",
        [phone]
      );

    if (!otpResult.length || otpResult[0].otp !== otp) {
      return res.status(200).json({
        message: "Invalid or expired OTP!",
        status: false,
        data: [],
      });
    }

    // Validate password
    if (invite_code.length < 13) {
      return res.status(200).json({
        message: "Invite code should be at least 13 characters long",
        status: false,
        data: [req.body],
      });
    }

    // Check if user already exists
    const [userResult] = await pool
      .promise()
      .query("SELECT * FROM users WHERE `phone` = ?", [phone]);

    if (userResult.length > 0) {
      return res.status(200).json({
        message: "User already exists!",
        status: false,
        data: [],
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const random = generateRandomValues();

    // Insert new user into the database
    await pool
      .promise()
      .query(
        "INSERT INTO users (name, username, phone, uid, otp, password, ip, real_pass, invite_code, join_code, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          random.username,
          random.username,
          phone,
          random.uid,
          otp,
          hashedPassword,
          userip,
          password,
          invite_code,
          random.join_code,
          0,
        ]
      );

    // Handle referral bonus if invite_code is present
    if (invite_code) {
      const [inviteResult] = await pool
        .promise()
        .query("SELECT * FROM users WHERE `join_code` = ?", [invite_code]);

      if (inviteResult.length > 0) {
        await pool
          .promise()
          .query(
            "INSERT INTO transaction_history (uid, amount, type, details) VALUES (?, ?, ?, ?)",
            [inviteResult[0].uid, 100, "Referral Bonus", "Referral Bonus"]
          );
      }
    }

    // Return successful response
    res.json({
      message: "User registered successfully",
      status: true,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const login = (req, res) => {
  const { phone, password } = req.body;

  // Validate phone number format
  if (!validator.isMobilePhone(phone, "any")) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  // Database query to find user by phone number
  pool.query(
    "SELECT * FROM users WHERE `phone` = ?",
    [phone],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.json({
          message: "Invalid user!",
          status: false,
          data: [],
        });
      }

      // Compare hashed password
      const user = results[0];
      try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.json({
            message: "Incorrect password",
            status: false,
            data: [],
          });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, secret, {
          expiresIn: "5h",
        });

        pool.query(
          "INSERT INTO login_time (uid) VALUES (?) ",
          [user.uid],
          async (error, results) => {
            pool.query(
              "UPDATE users SET last_login = ? WHERE uid = ? ",
              [new Date(), user.uid],
              async (error, results) => {}
            );
          }
        );

        // Return response with token and user details
        res.json({
          message: "User logged in successfully",
          status: true,
          data: {
            token,
            user: user,
          },
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  );
};

export const getUser = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT `id`, `name`, `username`, `role`, `email`, `phone`, `uid`, `money`, `deposite_money`, `withdraw_money`, `commmission_money`, `claim_money`, `first_deposite`, `ref_money`, `ref_code`, `level`, `exp`, `join_code`, `invite_code`, `created_at`, `last_login` FROM users WHERE `uid` = ?",
    [userId],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Compare hashed password
      const user = results[0];
      res.json({
        message: "User fetched successfully",
        status: true,
        data: user,
      });
    }
  );
};

export const getUserBetHistory = (req, res) => {
  const game = req.query.game ? req.query.game : "wingo";
  const type = req.query.type ? req.query.type : "1min";
  const uid = req.query.uid;
  const page = req.query.page;
  const offset = page * 10;
  pool.query(
    "SELECT period_id, purchase_amount, qty as quantity , amount as Amount_after_tax , tax , result, bet , win_status , created_at as order_time FROM bet WHERE `uid` = ? AND `game` = ? AND `game_type` = ? ORDER BY `id` DESC LIMIT 10 OFFSET ?",
    [uid, game, type, offset],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Data not found" });
      }
      const list = results;
      pool.query(
        "SELECT COUNT(id) as `rows` FROM `bet` WHERE `game_type` = ? ",
        [type],
        (err, results) => {
          if (err) {
            res.json({
              status: false,
              msg: err.message,
              data: [],
            });
            return;
          }
          res.json({
            message: "Data fetched successfully",
            status: true,
            data: list,
            totalPageCount:
              results.length > 0 ? Math.trunc(results[0].rows / 10) : 0,
          });
        }
      );
    }
  );
};

export const getUserWinStatus = (req, res) => {
  const game = req.query.game ? req.query.game : "wingo";
  const type = req.query.type ? req.query.type : "1min";
  const uid = req.query.uid;

  // Ensure all required query parameters are provided
  if (!uid) {
    return res.status(400).json({
      error: "User ID (uid) is required",
    });
  }

  pool.query(
    "SELECT `win_status`, `period_id`, `result_amount`, `amount` FROM bet WHERE `uid` = ? AND `game` = ? AND `game_type` = ? AND `status` = ? ORDER BY id DESC LIMIT 1",
    [uid, game, type, "1"],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(200).json({ error: "Data not found", status: false });
      }

      // Update the status of the bet
      pool.query(
        "UPDATE `bet` SET `status` = ? WHERE `uid` = ? AND `period_id` = ? AND `game` = ? AND `game_type` = ?",
        ["0", uid, results[0].period_id, game, type],
        (updateError) => {
          if (updateError) {
            return res.status(500).json({ error: updateError.message });
          }

          // Fetch additional bet data from the specified table
          const query = `SELECT * FROM ${pool.escapeId(
            game
          )} WHERE \`time_type\` = ? AND \`period_id\` = ?`;
          pool.query(query, [type, results[0].period_id], (betError, bet) => {
            if (betError) {
              return res.status(500).json({ error: betError.message });
            }

            results[0].bet_data = bet[0];
            res.json({
              message: "Data fetched successfully",
              status: true,
              data: results[0],
            });
          });
        }
      );
    }
  );
};

export const addUserBank = (req, res) => {
  const { uid, bank, name, account_no, phone, email, code } = req.body;

  // Check if all required fields are provided
  if (!uid || !bank || !name || !account_no || !phone || !email || !code) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate input fields
  if (!validator.isMobilePhone(phone, "any")) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (!validator.isNumeric(account_no)) {
    return res.status(400).json({ error: "Invalid account number format" });
  }

  if (!validator.isAlphanumeric(code)) {
    return res.status(400).json({ error: "Invalid IFSC code format" });
  }

  // Check if user exists
  pool.query("SELECT * FROM users WHERE `uid` = ?", [uid], (error, results) => {
    if (error) {
      console.error("Database query error:", error.message);
      return res.status(500).json({ error: "Database query error" });
    }

    if (results.length === 0) {
      return res.status(500).json({
        message: "User not found",
        status: false,
      });
    }
    pool.query(
      "SELECT * FROM user_banks WHERE `account_no` = ? ",
      [account_no],
      (error, results) => {
        if (error) {
          console.error("Database query error:", error.message);
          return res.status(500).json({ error: "Database query error" });
        }

        if (results.length > 0) {
          return res.status(200).json({
            message: "Bank account already exists!",
            status: false,
          });
        } else {
          // Insert bank details into the database
          pool.query(
            "INSERT INTO user_banks (uid, bank_name, recipient_name, account_no, phone_no, email, ifsc_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [uid, bank, name, account_no, phone, email, code],
            (error, results) => {
              if (error) {
                console.error("Database insertion error:", error.message);
                return res
                  .status(500)
                  .json({ error: "Database insertion error" });
              }

              res.json({
                message: "User's bank details registered successfully",
                status: true,
              });
            }
          );
        }
      }
    );
  });
};

export const getUserBank = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT `id`, `bank_name`, `account_no`, `phone_no`, `current` FROM user_banks WHERE `uid` = ?",
    [userId],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(200).json({
          message: "User's banks account not found!",
          status: false,
        });
      } else {
        const banks = results;
        res.json({
          message: "User's banks account fetched successfully",
          status: true,
          data: banks,
        });
      }
    }
  );
};

export const changeUserBank = (req, res) => {
  const userId = req.query.uid;
  const bankId = req.query.bankid;
  pool.query(
    "SELECT * FROM user_banks WHERE `uid` = ? AND `id` = ? ",
    [userId, bankId],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User's bank account not found" });
      }

      pool.query(
        "UPDATE user_banks SET `current` = '1' WHERE `uid` = ? AND `id` = ? ",
        [userId, bankId],
        async (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          pool.query(
            "UPDATE user_banks SET `current` = '0' WHERE `uid` = ? AND `id` != ? ",
            [userId, bankId],
            async (error, results) => {
              if (error) {
                return res.status(500).json({ error: error.message });
              }
              res.json({
                message: "User's bank account updated successfully",
                status: true,
                data: [],
              });
            }
          );
        }
      );
    }
  );
};

export const getLoginList = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT * FROM `login_time` WHERE `uid` = ? ORDER BY `id` DESC ",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Data not found" });
      }

      // Compare hashed password
      const list = results;
      res.json({
        message: "Login list fetched successfully",
        status: true,
        data: list,
      });
    }
  );
};

export const getOtp = async (req, res) => {
  const otp = generateOtp();
  const userip = req.socket.remoteAddress;
  const payload = {
    authorization:
      "v8TkT8kZHkC6lXiMmZCWgqSaFERz4iNVRgYn04vz6GvYfdAsEWXsm7ThWBAJ",
    variables_values: otp,
    route: "otp",
    numbers: req.query.number,
  };
  try {
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: payload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
      },
    });

    pool.query(
      "INSERT INTO otp (otp, user_ip) VALUES (?, ?) ",
      [otp, req.query.number],
      (error, results) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
      }
    );

    res.json({
      message: "OTP sent successfully",
      status: true,
      data: response.data, // Use `response.data` to get the response body
    });
  } catch (error) {
    res.json({
      message: "OTP sent failed",
      status: false,
      data: [], // Use `response.data` to get the response body
    });
  }
};

export const redeemGiftCode = (req, res) => {
  const { uid, gift_code } = req.body;

  if (!uid || !gift_code) {
    return res.json({
      message: "Enter gift code",
      status: false,
      data: [],
    });
  }

  // Check if the gift code is valid
  pool.query(
    "SELECT * FROM gift_code WHERE `code` = ? ",
    [gift_code],
    (error, giftcodes) => {
      if (error) {
        return res.status(500).json({ error: "Database query error" });
      }

      if (giftcodes.length === 0) {
        return res.json({
          message: "Invalid gift code",
          status: false,
          data: [],
        });
      }

      const giftCodeData = giftcodes[0];

      // Check if the gift code has already been redeemed by this user
      pool.query(
        "SELECT * FROM gift_redeems WHERE `gift_code` = ? AND `uid` = ?",
        [gift_code, uid],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: "Database query error" });
          }

          if (results.length > 0) {
            return res.json({
              message: "Already used",
              status: false,
              data: [],
            });
          }

          // Redeem the gift code
          pool.query(
            "INSERT INTO gift_redeems (uid, gift_code, amount) VALUES (?, ?, ?)",
            [uid, gift_code, giftCodeData.amount],
            (error) => {
              if (error) {
                console.error("Database insertion error:", error.message);
                return res
                  .status(500)
                  .json({ error: "Database insertion error" });
              }

              // Update the user's money
              pool.query(
                "UPDATE `users` SET `money` = `money` + ?, `claim_money` = `claim_money` + ? WHERE `uid` = ?",
                [giftCodeData.amount, giftCodeData.amount, uid],
                (error) => {
                  if (error) {
                    return res.status(500).json({ error: error.message });
                  }

                  res.json({
                    message: "Gift code redeemed successfully",
                    status: true,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

export const getRedeemHistory = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT * FROM `gift_redeems` WHERE `uid` = ? ORDER BY `id` DESC ",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Data not found" });
      }

      const list = results;
      res.json({
        message: "Redeem list fetched successfully",
        status: true,
        data: list,
      });
    }
  );
};

export const getTransactionHistory = (req, res) => {
  const userId = req.query.uid;
  pool.query(
    "SELECT * FROM `transaction_history` WHERE `uid` = ? ORDER BY `id` DESC ",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Data not found" });
      }

      const list = results;
      res.json({
        message: "Transaction history fetched successfully",
        status: true,
        data: list,
      });
    }
  );
};

export const makeAttendance = (req, res) => {
  const { uid } = req.body;

  pool.query(
    "SELECT * FROM deposit WHERE uid = ? AND status = 'success' AND DATE(created_at) = CURRENT_DATE()",
    [uid],
    (error, results) => {
      if (error) {
        return res.json({
          message: "Database insertion error",
          status: false,
        });
      }
      if (results.length > 0) {
        pool.query(
          "SELECT * FROM attendance WHERE uid = ? AND DATE(created_at) = CURRENT_DATE()",
          [uid],
          (error, results) => {
            if (error) {
              return res.json({
                message: "Database insertion error",
                status: false,
              });
            }
            if (results.length > 0) {
              res.json({
                message: "User's attendance already exists",
                status: false,
              });
            } else {
              pool.query(
                "INSERT INTO attendance (uid, amount) VALUES (?, ?)",
                [uid, 5],
                (error, results) => {
                  if (error) {
                    console.error("Database insertion error:", error.message);
                    return res
                      .status(500)
                      .json({ error: "Database insertion error" });
                  } else {
                    pool.query(
                      "UPDATE `users` SET `money` = `money` + ?, `claim_money` = `claim_money` + ? WHERE `uid` = ?",
                      [5, 5, uid],
                      (error) => {
                        if (error) {
                          return res.status(500).json({ error: error.message });
                        }

                        res.json({
                          message: "User's attendance registered successfully",
                          status: true,
                        });
                      }
                    );
                  }
                }
              );
            }
          }
        );
      } else {
        return res.json({
          message: "Please deposit required balance",
          status: false,
        });
      }
    }
  );
};

export const getPromotion = async (req, res) => {
  const uid = req.query.uid;
  const data = {
    users: 0,
    deposits: 0,
    total_deposits: 0,
  };
  let user = {};
  let uids = [];

  try {
    // First query: Get the user by uid
    const userResults = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM users WHERE uid = ?",
        [uid],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (userResults.length > 0) {
      user = userResults[0];
    } else {
      return res.json({
        message: "User not found",
        status: false,
      });
    }

    // Second query: Get users by invite_code
    const invitedUsers = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM users WHERE invite_code = ?",
        [user.join_code],
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      );
    });

    if (invitedUsers.length > 0) {
      data.users = invitedUsers.length;
      uids = invitedUsers.map((user) => user.uid);
    }

    // Third query: Get deposits by uids
    if (uids.length > 0) {
      const deposits = await new Promise((resolve, reject) => {
        pool.query(
          "SELECT * FROM deposit WHERE uid IN (?) AND status = ?",
          [uids, "success"],
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        );
      });

      if (deposits.length > 0) {
        data.deposits = deposits.length;
        data.total_deposits = deposits.reduce(
          (total, deposit) => total + parseInt(deposit.deposit_amount),
          0
        );
      }
    }

    return res.json({
      message: "Success",
      status: true,
      data: data,
    });
  } catch (error) {
    return res.json({
      message: "Database query error",
      status: false,
      error: error.message,
    });
  }
};

export const getInvitationList = (req, res) => {
  const userId = req.query.uid;

  // List with bonus, people, and amount conditions
  const bonusList = [
    {
      bonus: 55.0,
      people: 1,
      amount: 300.0,
    },
    {
      bonus: 155.0,
      people: 3,
      amount: 300.0,
    },
    {
      bonus: 555.0,
      people: 10,
      amount: 500.0,
    },
    {
      bonus: 1555.0,
      people: 30,
      amount: 800.0,
    },
    {
      bonus: 2775.0,
      people: 50,
      amount: 1200.0,
    },
    {
      bonus: 4165.0,
      people: 75,
      amount: 1200.0,
    },
    {
      bonus: 5555.0,
      people: 100,
      amount: 1200.0,
    },
    {
      bonus: 11111.0,
      people: 200,
      amount: 1200.0,
    },
    {
      bonus: 27777.0,
      people: 500,
      amount: 1200.0,
    },
    {
      bonus: 55555.0,
      people: 1000,
      amount: 1200.0,
    },
    {
      bonus: 111111.0,
      people: 2000,
      amount: 1200.0,
    },
    {
      bonus: 277777.0,
      people: 5000,
      amount: 1200.0,
    },
  ];

  // First query: Get the user's details by `uid`
  pool.query(
    "SELECT * FROM `users` WHERE `uid` = ?",
    [userId],
    (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (userResults.length === 0) {
        return res
          .status(200)
          .json({ message: "User not found", status: false });
      } else {
        const inviteCode = userResults[0].join_code;

        // Second query: Get the list of users invited by this user
        pool.query(
          "SELECT deposite_money FROM `users` WHERE `invite_code` = ?",
          [inviteCode],
          (err, inviteResults) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Count how many invited users meet the deposit conditions
            const validPeople = inviteResults.filter(
              (invitedUser) => invitedUser.deposite_money >= 300
            ).length;

            // Find all the bonuses the user qualifies for
            const earnedBonuses = bonusList.filter(
              (bonusItem) =>
                validPeople >= bonusItem.people &&
                inviteResults.every(
                  (invitedUser) =>
                    invitedUser.deposite_money >= bonusItem.amount
                )
            );

            // Return the array of all qualified bonuses
            return res.status(200).json({
              message:
                earnedBonuses.length > 0
                  ? "Bonuses earned"
                  : "No bonuses earned",
              status: earnedBonuses.length > 0,
              bonuses: earnedBonuses,
              validPeople: validPeople,
            });
          }
        );
      }
    }
  );
};

export const getInviteBonus = (req, res) => {
  const userId = req.query.uid;
  const people = req.query.people;
  const amount = req.query.amount;

  // Check if the user already has a bonus for the same number of people
  pool.query(
    "SELECT * FROM invite_bonuses WHERE uid = ? AND people = ?",
    [userId, people],
    (error, results) => {
      if (error) {
        console.error("Database query error:", error.message);
        return res.status(500).json({ error: "Database query error" });
      }

      // If a record already exists, prevent duplicate entry
      if (results.length > 0) {
        return res.status(200).json({
          message: "Bonus already claimed for this number of people",
          status: false,
        });
      }

      // Insert invite bonus into invite_bonuses table
      pool.query(
        "INSERT INTO invite_bonuses (uid, people, amount) VALUES (?, ?, ?)",
        [userId, people, amount],
        (error) => {
          if (error) {
            console.error("Database insertion error:", error.message);
            return res.status(500).json({ error: "Database insertion error" });
          }

          pool
            .promise()
            .query(
              "INSERT INTO transaction_history (uid, amount, type, details) VALUES (?, ?, ?, ?)",
              [userId, amount, "Invitation Bonus", "Invitation Bonus"]
            );

          // Update the user's money
          pool.query(
            "UPDATE `users` SET `money` = `money` + ? WHERE `uid` = ?",
            [amount, userId],
            (error) => {
              if (error) {
                console.error("User money update error:", error.message);
                return res.status(500).json({ error: error.message });
              }

              res.json({
                message: "User's bonus claimed successfully",
                status: true,
              });
            }
          );
        }
      );
    }
  );
};

export const getInviteBonusList = (req, res) => {
  const userId = req.query.uid;

  // Check if the user already has a bonus for the same number of people
  pool.query(
    "SELECT * FROM invite_bonuses WHERE uid = ?",
    [userId],
    (error, results) => {
      if (error) {
        console.error("Database query error:", error.message);
        return res.status(500).json({ error: "Database query error" });
      }

      // If a record already exists, prevent duplicate entry
      if (results.length > 0) {
        res.json({
          message: "User's bonus claimed data fetched successfully",
          status: true,
          data: results,
        });
      }
    }
  );
};

export const changePassword = async (req, res) => {
  const { uid, oldPassword, newPassword } = req.body;

  // Validate new password strength (optional)
  if (!validator.isAlphanumeric(newPassword)) {
    return res.json({
      message: "New password is not strong enough",
      status: false,
      data: [],
    });
  }

  // Database query to find user by UID
  pool.query(
    "SELECT * FROM users WHERE `uid` = ?",
    [uid],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (results.length === 0) {
        return res.json({
          message: "User not found",
          status: false,
          data: [],
        });
      }

      // Compare hashed old password
      const user = results[0];
      try {
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!passwordMatch) {
          return res.json({
            message: "Incorrect old password",
            status: false,
            data: [],
          });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        pool.query(
          "UPDATE users SET password = ?, real_pass = ? WHERE uid = ?",
          [hashedNewPassword, newPassword, uid],
          (error, results) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }

            res.json({
              message: "Password updated successfully",
              status: true,
              data: [],
            });
          }
        );
      } catch (error) {
        return res.json({
          message: "Contact to the administrator",
          status: false,
          data: [],
        });
      }
    }
  );
};
