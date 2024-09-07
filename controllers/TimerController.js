import cron from "node-cron";
import pool from "../db.js"; // Import the database connection

const timers = [
  { duration: 60, current: 60, type: "1min", name: "timer1" },
  { duration: 180, current: 180, type: "3min", name: "timer3" },
  { duration: 300, current: 300, type: "5min", name: "timer5" },
  { duration: 600, current: 600, type: "10min", name: "timer10" },
];

const getRandomNumberInRange = (from, to) => {
  return Math.floor(Math.random() * (to - from + 1)) + from;
};

const insertTrxPeriod = (type) => {
  pool.query(
    "SELECT `num` FROM prediction WHERE `status` = ? AND `type` = ? AND `game` = ?",
    [1, type, "trx"],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      let randomNumber = getRandomNumberInRange(0, 9);
      if (results.length > 0) {
        randomNumber = results[0].num;
        pool.query(
          "UPDATE `prediction` SET `status` = ? WHERE `type` = ? AND `game` = ?",
          [0, type, "trx"],
          (error, results) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }
          }
        );
      }

      let color = randomNumber % 2 === 1 ? "green" : "red";
      if (randomNumber === 5) {
        color = "green,violet";
      } else if (randomNumber === 0) {
        color = "red,violet";
      }
      let size = randomNumber > 4 ? "big" : "small";

      pool.query(
        "SELECT `period_id` FROM `trx` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 1",
        [type],
        (err, results) => {
          if (err) {
            console.error(
              `Error inserting data into the database for ${type}:`,
              err
            );
            return;
          }
          const period_id = parseInt(results[0].period_id) + 1;

          pool.query(
            "SELECT `bet`, `amount`, `uid` FROM `bet` WHERE `game_type` = ? AND `period_id` = ?",
            [type, period_id],
            (err, results) => {
              if (err) {
                console.error(
                  `Error inserting data into the database for ${type}:`,
                  err
                );
                return;
              }
              if (results.length > 0) {
                results.map((item, index) => {
                  let win_status = "loss";
                  const bet = item.bet;
                  var result_amount = 0;
                  if (!isNaN(bet)) {
                    if (randomNumber === Number(bet)) {
                      win_status = "win";
                    }
                    result_amount = item.amount * 9;
                  } else {
                    if (bet === color || bet === size) {
                      win_status = "win";
                    }
                    result_amount = item.amount * 2;
                  }
                  pool.query(
                    "UPDATE `bet` SET `win_status` = ? , `result_amount` = ? , `result` = ? WHERE `period_id` = ?",
                    [win_status, result_amount, randomNumber, period_id],
                    (error, results) => {
                      if (error) {
                        return res.status(500).json({ error: error.message });
                      }
                    }
                  );
                  if (win_status === "win") {
                    pool.query(
                      "UPDATE `users` SET `money` = `money` + ? WHERE uid = ?",
                      [result_amount, item.uid],
                      (error, results) => {
                        if (error) {
                          return res.status(500).json({ error: error.message });
                        }
                      }
                    );
                  }
                });
              }
            }
          );

          const query =
            "INSERT INTO trx (time_type, num_result, block_result, color_result, period_id) VALUES (?, ?, ?, ?, ?)";
          const values = [type, randomNumber, "xxx", color, period_id];

          pool.query(query, values, (err, results) => {
            if (err) {
              console.error(
                `Error inserting data into the database for ${type}:`,
                err
              );
              return;
            }
            console.log(
              `Data inserted into the database for ${type}:`,
              results
            );
          });
        }
      );
    }
  );
};

const insertWingoPeriod = (type) => {
  pool.query(
    "SELECT `num` FROM prediction WHERE `status` = ? AND `type` = ? AND `game` = ?",
    [1, type, "wingo"],
    async (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      let randomNumber = getRandomNumberInRange(0, 9);
      if (results.length > 0) {
        randomNumber = results[0].num;
        pool.query(
          "UPDATE `prediction` SET `status` = ? WHERE `type` = ? AND `game` = ?",
          [0, type, "wingo"],
          (error, results) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }
          }
        );
      }

      let color = randomNumber % 2 === 1 ? "green" : "red";
      if (randomNumber === 5) {
        color = "green,violet";
      } else if (randomNumber === 0) {
        color = "red,violet";
      }
      let size = randomNumber > 4 ? "big" : "small";

      pool.query(
        "SELECT `period_id` FROM `wingo` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 1",
        [type],
        (err, results) => {
          if (err) {
            console.error(
              `Error inserting data into the database for ${type}:`,
              err
            );
            return;
          }
          const period_id = parseInt(results[0].period_id) + 1;

          pool.query(
            "SELECT `bet`, `amount`, `uid` FROM `bet` WHERE `game_type` = ? AND `period_id` = ?",
            [type, period_id],
            (err, results) => {
              if (err) {
                console.error(
                  `Error inserting data into the database for ${type}:`,
                  err
                );
                return;
              }
              if (results.length > 0) {
                results.map((item, index) => {
                  let win_status = "loss";
                  const bet = item.bet;
                  var result_amount = 0;
                  if (!isNaN(bet)) {
                    if (randomNumber === Number(bet)) {
                      win_status = "win";
                    }
                    result_amount = item.amount * 9;
                  } else {
                    if (bet === color || bet === size) {
                      win_status = "win";
                    }
                    result_amount = item.amount * 2;
                  }
                  pool.query(
                    "UPDATE `bet` SET `win_status` = ? , `result_amount` = ? , `result` = ? WHERE `period_id` = ? AND `game` = ? AND `game_type` = ?",
                    [
                      win_status,
                      result_amount,
                      randomNumber,
                      period_id,
                      "wingo",
                      type,
                    ],
                    (error, results) => {
                      if (error) {
                        return res.status(500).json({ error: error.message });
                      }
                    }
                  );
                  if (win_status === "win") {
                    pool.query(
                      "UPDATE `users` SET `money` = `money` + ? WHERE uid = ?",
                      [result_amount, item.uid],
                      (error, results) => {
                        if (error) {
                          return res.status(500).json({ error: error.message });
                        }
                      }
                    );
                  }
                });
              }
            }
          );

          const query =
            "INSERT INTO wingo (time_type, num_result, size_result, color_result, period_id) VALUES (?, ?, ?, ?, ?)";
          const values = [type, randomNumber, size, color, period_id];

          pool.query(query, values, (err, results) => {
            if (err) {
              console.error(
                `Error inserting data into the database for ${type}:`,
                err
              );
              return;
            }
            console.log(
              `Data inserted into the database for ${type}:`,
              results
            );
          });
        }
      );
    }
  );
};

const insertK3Period = (type) => {
  let randomNumber1 = getRandomNumberInRange(1, 6);
  let randomNumber2 = getRandomNumberInRange(1, 6);
  let randomNumber3 = getRandomNumberInRange(1, 6);
  let num = randomNumber1 + randomNumber2 + randomNumber3;
  let size = num > 10 ? "big" : "small";

  let ludo = randomNumber1 + "," + randomNumber2 + "," + randomNumber3;
  pool.query(
    "SELECT `period_id` FROM `k3` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 1",
    [type],
    (err, results) => {
      if (err) {
        console.error(
          `Error inserting data into the database for ${type}:`,
          err
        );
        return;
      }
      const period_id = parseInt(results[0].period_id) + 1;

      pool.query(
        "SELECT `bet`, `amount`, `uid` FROM `bet` WHERE `game_type` = ? AND `period_id` = ?",
        [type, period_id],
        (err, results) => {
          if (err) {
            console.error(
              `Error inserting data into the database for ${type}:`,
              err
            );
            return;
          }
          if (results.length > 0) {
            results.map((item, index) => {
              let win_status = "loss";
              // const bet = JSON.parse(item.bet);
              var result_amount = 0;

              pool.query(
                "UPDATE `bet` SET `win_status` = ? , `result_amount` = ? , `result` = ? WHERE `period_id` = ? AND `game` = ? AND `game_type` = ?",
                [win_status, result_amount, num, period_id, "k3", type],
                (error, results) => {
                  if (error) {
                    return res.status(500).json({ error: error.message });
                  }
                }
              );
              if (win_status === "win") {
                pool.query(
                  "UPDATE `users` SET `money` = `money` + ? WHERE uid = ?",
                  [item.amount * 2, item.uid],
                  (error, results) => {
                    if (error) {
                      return res.status(500).json({ error: error.message });
                    }
                  }
                );
              }
            });
          }
        }
      );

      const query =
        "INSERT INTO k3 (time_type, num_result, size_result, ludo_result, period_id) VALUES (?, ?, ?, ?, ?)";
      const values = [type, num, size, ludo, period_id];

      pool.query(query, values, (err, results) => {
        if (err) {
          console.error(
            `Error inserting data into the database for ${type}:`,
            err
          );
          return;
        }
        console.log(`Data inserted into the database for ${type}:`, results);
      });
    }
  );
};

const insertd5Period = (type) => {
  let randomNumber1 = getRandomNumberInRange(0, 9);
  let randomNumber2 = getRandomNumberInRange(0, 9);
  let randomNumber3 = getRandomNumberInRange(0, 9);
  let randomNumber4 = getRandomNumberInRange(0, 9);
  let randomNumber5 = getRandomNumberInRange(0, 9);
  let num =
    randomNumber1 +
    randomNumber2 +
    randomNumber3 +
    randomNumber4 +
    randomNumber5;
  let mnum =
    randomNumber1 +
    "," +
    randomNumber2 +
    "," +
    randomNumber3 +
    "," +
    randomNumber4 +
    "," +
    randomNumber5;
  pool.query(
    "SELECT `period_id` FROM `d5` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 1",
    [type],
    (err, results) => {
      if (err) {
        console.error(
          `Error inserting data into the database for ${type}:`,
          err
        );
        return;
      }
      const period_id = parseInt(results[0].period_id) + 1;

      pool.query(
        "SELECT `bet`, `amount`, `uid` FROM `bet` WHERE `game_type` = ? AND `period_id` = ?",
        [type, period_id],
        (err, results) => {
          if (err) {
            console.error(
              `Error inserting data into the database for ${type}:`,
              err
            );
            return;
          }
          if (results.length > 0) {
            results.map((item, index) => {
              let win_status = "loss";
              // const bet = JSON.parse(item.bet);
              var result_amount = 0;

              pool.query(
                "UPDATE `bet` SET `win_status` = ? , `result_amount` = ? , `result` = ? WHERE `period_id` = ? AND `game` = ? AND `game_type` = ?",
                [win_status, result_amount, num, period_id, "d5", type],
                (error, results) => {
                  if (error) {
                    return res.status(500).json({ error: error.message });
                  }
                }
              );
              if (win_status === "win") {
                pool.query(
                  "UPDATE `users` SET `money` = `money` + ? WHERE uid = ?",
                  [item.amount * 2, item.uid],
                  (error, results) => {
                    if (error) {
                      return res.status(500).json({ error: error.message });
                    }
                  }
                );
              }
            });
          }
        }
      );


      const query =
        "INSERT INTO d5 (time_type, num_result, multiple_num_result, period_id) VALUES (?, ?, ?, ?)";
      const values = [type, num, mnum, period_id];

      pool.query(query, values, (err, results) => {
        if (err) {
          console.error(
            `Error inserting data into the database for ${type}:`,
            err
          );
          return;
        }
        console.log(`Data inserted into the database for ${type}:`, results);
      });
    }
  );
};

const realTimeDataController = (io) => {
  setInterval(() => {
    const realTimeData = {};

    timers.forEach((timer) => {
      timer.current -= 1;

      if (timer.current === 0) {
        timer.current = timer.duration;
        insertTrxPeriod(timer.type);
        insertWingoPeriod(timer.type);
        insertK3Period(timer.type);
        insertd5Period(timer.type);
      }

      realTimeData[timer.name] = timer.current;
    });

    // Emit the real-time data to all connected clients
    io.emit("timer", realTimeData);
  }, 1000);
};

export default realTimeDataController;
