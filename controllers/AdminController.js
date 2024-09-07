import pool from "../db.js";

export const adminDashboard = (req, res) => {
  let data = {
    menu: "dashboard",
    submenu: "dashboard",
  };

  res.render("pages/dashboard", {
    title: "Dashboard",
    data: data,
  });
};
export const adminUsers = (req, res) => {
  let data = {
    menu: "dashboard",
    submenu: "users",
  };

  res.render("pages/users", {
    title: "Users",
    data: data,
  });
};

export const adminWingo = (req, res) => {
  let data = {
    menu: "games",
    submenu: "wingo",
  };

  res.render("pages/wingo", {
    title: "Wingo",
    data: data,
  });
};
export const adminTrx = (req, res) => {
  let data = {
    menu: "games",
    submenu: "trx",
  };

  res.render("pages/trx", {
    title: "Trx Win",
    data: data,
  });
};

export const adminUserDetails = async (req, res) => {
  const uid = req.query.uid ? req.query.uid : 0;

  let data = {
    menu: "users",
    submenu: "users",
  };

  try {
    // Query for user details
    const userResults = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `users` WHERE `uid` = ?",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    // Query for user bets
    const betResults = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `bet` WHERE `uid` = ? ORDER BY `id` DESC",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const deposits = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `deposit` WHERE `uid` = ? ORDER BY `id` DESC",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const withdrawal = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `withdrawal` WHERE `uid` = ? ORDER BY `id` DESC",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const banks = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `user_banks` WHERE `uid` = ? ORDER BY `id` DESC",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    // Query for user bets
    const betAmount = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT SUM(amount) as total FROM `bet` WHERE `uid` = ?",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const winAmount = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT SUM(amount) as total FROM `bet` WHERE `uid` = ? AND `win_status` = ?",
        [uid, "win"],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const lossAmount = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT SUM(amount) as total FROM `bet` WHERE `uid` = ? AND `win_status` = ?",
        [uid, "loss"],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const giftRedeems = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `gift_redeems` WHERE `uid` = ? ",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });
    // Query for user bets
    const tnxHistory = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `transaction_history` WHERE uid = ? ORDER BY id DESC",
        [uid],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    data.user = userResults[0];
    data.bets = betResults;
    data.total_bet_amount = betAmount[0].total;
    data.win_amount = winAmount[0].total;
    data.loss_amount = lossAmount[0].total;
    data.deposits = deposits;
    data.withdrawal = withdrawal;
    data.banks = banks;
    data.gift_redeems = giftRedeems;
    data.tnx_history = tnxHistory;

    res.render("pages/user_details", {
      title: "User Details",
      data: data,
    });
  } catch (err) {
    res.json({
      status: false,
      msg: err.message,
      data: [],
    });
  }
};

export const withdrawalRequests = async (req, res) => {
  let data = {
    menu: "withdrawal",
    submenu: "withdrawal",
  };

  try {
    // Query for withdrawal requests
    const withdrawals = await new Promise((resolve, reject) => {
      pool.query(
        "SELECT * FROM `withdrawal` WHERE `status` = 'pending' ORDER BY `id` DESC",
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    });

    data.withdrawals = withdrawals;

    res.render("pages/withdrawal_requests", {
      title: "Withdrawal Requests",
      data: data,
    });
  } catch (err) {
    res.json({
      status: false,
      msg: err.message,
      data: [],
    });
  }
};

export const giftCodes = async (req, res) => {
  let data = {
    menu: "gift_codes",
    submenu: "gift_codes",
  };

  res.render("pages/gift_codes", {
    title: "Withdrawal Requests",
    data: data,
  });
};
export const moneyControl = async (req, res) => {
  let data = {
    menu: "money_control",
    submenu: "money_control",
  };

  res.render("pages/money_control", {
    title: "Money Controls",
    data: data,
  });
};
export const issues = async (req, res) => {
  let data = {
    menu: "issues",
    submenu: "issues",
  };

  const issuesList = await new Promise((resolve, reject) => {
    pool.query("SELECT * FROM `issues` ORDER BY id DESC", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
  data.issues = issuesList;

  res.render("pages/issues", {
    title: "User Issues",
    data: data,
  });
};
