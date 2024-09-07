import pool from "../db.js";
import Joi from "joi";

export const betWingo = (req, res) => {
  const schema = Joi.object({
    type: Joi.required(),
    user_id: Joi.required(),
    bet: Joi.required(),
    amount: Joi.required(),
    period_id: Joi.required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { type, user_id, bet, amount, period_id } = req.body;

  pool.query(
    "INSERT INTO bet (game, game_type, bet, qty, amount, purchase_amount, tax,  period_id, uid, win_status, status, result_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ",
    [
      "wingo",
      type,
      bet,
      1,
      amount - amount * (2 / 100),
      amount,
      amount * (2 / 100),
      period_id,
      user_id,
      "pending",
      1,
      isNaN(bet)
        ? (amount - amount * (2 / 100)) * 2
        : (amount - amount * (2 / 100)) * 9,
    ],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      pool.query(
        "UPDATE `users` SET `money` = `money` - ? WHERE uid = ?",
        [amount, user_id],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }
      );
      res.json({
        message: "Bet successfully",
        status: true,
        data: [],
      });
    }
  );
};

export const betK3 = (req, res) => {
  const schema = Joi.object({
    type: Joi.required(),
    user_id: Joi.required(),
    bet: Joi.required(),
    amount: Joi.required(),
    period_id: Joi.required(),
  });


  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { type, user_id, bet, amount, period_id } = req.body;

  pool.query(
    "INSERT INTO bet (game, game_type, bet, qty, amount, purchase_amount, tax,  period_id, uid, win_status, status, result_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ",
    [
      "k3",
      type,
      JSON.stringify(bet),
      1,
      amount - amount * (2 / 100),
      amount,
      amount * (2 / 100),
      period_id,
      user_id,
      "pending",
      1,
      isNaN(bet)
        ? (amount - amount * (2 / 100)) * 2
        : (amount - amount * (2 / 100)) * 9,
    ],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      pool.query(
        "UPDATE `users` SET `money` = `money` - ? WHERE uid = ?",
        [amount, user_id],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }
      );
      res.json({
        message: "Bet successfully",
        status: true,
        data: [],
      });
    }
  );
};

export const betD5 = (req, res) => {
  const schema = Joi.object({
    type: Joi.required(),
    user_id: Joi.required(),
    bet: Joi.required(),
    amount: Joi.required(),
    period_id: Joi.required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { type, user_id, bet, amount, period_id } = req.body;

  pool.query(
    "INSERT INTO bet (game, game_type, bet, qty, amount, purchase_amount, tax,  period_id, uid, win_status, status, result_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ",
    [
      "d5",
      type,
      JSON.stringify(bet),
      1,
      amount - amount * (2 / 100),
      amount,
      amount * (2 / 100),
      period_id,
      user_id,
      "pending",
      1,
      isNaN(bet)
        ? (amount - amount * (2 / 100)) * 2
        : (amount - amount * (2 / 100)) * 9,
    ],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      pool.query(
        "UPDATE `users` SET `money` = `money` - ? WHERE uid = ?",
        [amount, user_id],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }
      );
      res.json({
        message: "Bet successfully",
        status: true,
        data: [],
      });
    }
  );
};

export const betTrx = (req, res) => {
  const schema = Joi.object({
    type: Joi.required(),
    user_id: Joi.required(),
    bet: Joi.required(),
    amount: Joi.required(),
    period_id: Joi.required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { type, user_id, bet, amount, period_id } = req.body;

  pool.query(
    "INSERT INTO bet (game, game_type, bet, qty, amount, purchase_amount, tax, period_id, uid, win_status, status, result_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ",
    [
      "trx",
      type,
      bet,
      1,
      amount - amount * (2 / 100),
      amount,
      amount * (2 / 100),
      period_id,
      user_id,
      "pending",
      1,
      isNaN(bet)
        ? (amount - amount * (2 / 100)) * 2
        : (amount - amount * (2 / 100)) * 9,
    ],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      pool.query(
        "UPDATE `users` SET `money` = `money` - ? WHERE uid = ?",
        [amount, user_id],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }
      );
      res.json({
        message: "Bet successfully",
        status: true,
        data: [],
      });
    }
  );
};
