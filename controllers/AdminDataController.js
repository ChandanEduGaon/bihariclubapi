import pool from "../db.js";
import { generateGiftCode } from "../utils.js";

export const getWingoPeriodList = (req, res) => {
  const type = req.query.type ? req.query.type : "1min";
  const game = req.query.game ? req.query.game : "wingo";
  pool.query(
    `SELECT * FROM ${game} WHERE time_type = ? ORDER BY id DESC LIMIT 10`,
    [type],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      } else {
        res.json({
          status: true,
          msg: "Success",
          data: results,
        });
      }
    }
  );
};

export const getBetList = (req, res) => {
  const type = req.query.type ? req.query.type : "1min";
  const game = req.query.game ? req.query.game : "wingo";

  pool.query(
    `SELECT period_id FROM ${game} WHERE time_type = ? ORDER BY id DESC LIMIT 1`,
    [type],
    (err, results) => {
      if (err) {
        console.error(
          `Error inserting data into the database for ${type}:`,
          err
        );
        return;
      } else {
        const period_id = parseInt(results[0].period_id) + 1;

        pool.query(
          "SELECT * FROM `bet` WHERE `game_type` = ? AND `game` = ? AND `period_id` = ?",
          [type, game, period_id],
          (err, results) => {
            if (err) {
              res.json({
                status: false,
                msg: err.message,
                data: [],
              });
              return;
            } else {
              res.json({
                status: true,
                msg: "Success",
                data: results,
              });
            }
          }
        );
      }
    }
  );
};

export const getBetAmount = (req, res) => {
  const type = req.query.type ? req.query.type : "1min";
  const game = req.query.game ? req.query.game : "wingo";

  pool.query(
    `SELECT period_id FROM ${game} WHERE time_type = ? ORDER BY id DESC LIMIT 1`,
    [type],
    (err, results) => {
      if (err) {
        console.error(
          `Error inserting data into the database for ${type}:`,
          err
        );
        return;
      } else {
        const period_id = parseInt(results[0].period_id) + 1;

        pool.query(
          "SELECT `bet`, SUM(purchase_amount) AS total_amount FROM `bet` WHERE `game_type` = ? AND `game` = ? AND `period_id` = ? GROUP BY `bet`",
          [type, game, period_id],
          (err, results) => {
            if (err) {
              res.json({
                status: false,
                msg: err.message,
                data: [],
              });
              return;
            } else {
              res.json({
                status: true,
                msg: "Success",
                data: results,
              });
            }
          }
        );
      }
    }
  );
};

export const setResult = (req, res) => {
  const type = req.query.type ? req.query.type : "1min";
  const game = req.query.game ? req.query.game : "wingo";
  const result = req.query.result ? req.query.result : "0";

  pool.query(
    "UPDATE `prediction` SET `status` = 1 , `num` = ? WHERE `type` = ? AND `game` = ? ",
    [result, type, game],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      } else {
        res.json({
          status: true,
          msg: "Success",
          data: [],
        });
      }
    }
  );
};

export const getUserList = (req, res) => {
  const page = req.query.page ? req.query.page : 0;
  const offset = page * 10;
  pool.query(
    "SELECT * FROM `users` LIMIT 10 OFFSET ?",
    [offset],
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
        status: true,
        msg: "Success",
        data: results,
      });
    }
  );
};

export const getAdminDetail = (req, res) => {
  const uid = req.cookies.uid;
  pool.query("SELECT * FROM `users` WHERE `uid` = ?", [uid], (err, results) => {
    if (err) {
      res.json({
        status: false,
        msg: err.message,
        data: [],
      });
      return;
    }
    res.json({
      status: true,
      msg: "Success",
      data: results[0],
    });
  });
};

export const blockUser = (req, res) => {
  const uid = req.query.uid ? req.query.uid : 0;
  const status = req.query.status ? req.query.status : "pending";
  pool.query(
    "UPDATE `users` SET  `status` = ? WHERE `uid` = ?",
    [status, uid],
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
        status: true,
        msg: "Success",
        data: [],
      });
    }
  );
};

export const withdrawalApprove = async (req, res) => {
  const id = req.query.id ? req.query.id : 0;
  const status = req.query.status ? req.query.status : "pending";

  pool.query(
    "UPDATE `withdrawal` SET  `status` = ? WHERE `id` = ?",
    [status, id],
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
        status: true,
        msg: "Success",
        data: [],
      });
    }
  );
};

export const getGiftCodeList = (req, res) => {
  const limit = req.query.limit ? req.query.limit : "0";

  pool.query(
    `SELECT * FROM gift_code WHERE redeem_limit > ? AND status = ? ORDER BY id DESC`,
    [limit, "1"],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      } else {
        res.json({
          status: true,
          msg: "Success",
          data: results,
        });
      }
    }
  );
};

export const deleteGiftCode = async (req, res) => {
  const id = req.query.id ? req.query.id : 0;

  pool.query(
    "UPDATE `gift_code` SET  `status` = ? WHERE `id` = ?",
    ["0", id],
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
        status: true,
        msg: "Success",
        data: [],
      });
    }
  );
};

export const createGiftCode = (req, res) => {
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

export const moneyAdd = (req, res) => {
  const { amount, uid } = req.body;

  if (!uid) {
    return res.status(200).json({ message: "Enter uid", status: false });
  }
  if (!amount) {
    return res.status(200).json({ message: "Enter amount", status: false });
  }

  // First, check if the user exists
  pool.query("SELECT * FROM users WHERE uid = ?", [uid], (error, results) => {
    if (error) {
      console.error("Database query error:", error.message);
      return res.status(500).json({ error: "Database query error" });
    }

    if (results.length === 0) {
      return res
        .status(200)
        .json({ message: "User not found", status: false });
    }

    // User exists, proceed with inserting into transaction history
    pool.query(
      "INSERT INTO transaction_history (uid, amount, type, details) VALUES (?, ?, ?, ?)",
      [uid, amount, "Admin Salary", "Money Added by Admin"],
      (error, results) => {
        if (error) {
          console.error("Database insertion error:", error.message);
          return res.status(500).json({ error: "Database insertion error" });
        } else {
          // Update the user's money
          pool.query(
            "UPDATE users SET money = money + ? WHERE uid = ?",
            [amount, uid],
            (error, results) => {
              if (error) {
                console.error("Database update error:", error.message);
                return res.status(500).json({ error: "Database update error" });
              } else {
                res.json({
                  message: "Amount added successfully",
                  status: true,
                });
              }
            }
          );
        }
      }
    );
  });
};
