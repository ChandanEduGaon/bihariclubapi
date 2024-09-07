import pool from "../db.js";

export const getWingoPeriodList = (req, res) => {
  const page = req.query.page ? req.query.page : 0;
  const type = req.query.type ? req.query.type : "1min";

  const offset = page * 10;
  pool.query(
    "SELECT `color_result`, `num_result`, `period_id`, `size_result`, `time_type` FROM `wingo` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 10 OFFSET ?",
    [type, offset],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      }
      const list = results;
      pool.query(
        "SELECT COUNT(id) as `rows` FROM `wingo` WHERE `time_type` = ? ",
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
            status: true,
            msg: "Success",
            data: list,
            totalPageCount:
              results.length > 0 ? Math.trunc(results[0].rows / 10) : 0,
          });
        }
      );
    }
  );
};

export const getK3PeriodList = (req, res) => {
  const page = req.query.page ? req.query.page : 0;
  const type = req.query.type ? req.query.type : "1min";

  const offset = page * 10;
  pool.query(
    "SELECT `ludo_result`, `num_result`, `period_id`, `size_result`, `time_type` FROM `k3` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 10 OFFSET ?",
    [type, offset],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      }
      const list = results;
      pool.query(
        "SELECT COUNT(id) as `rows` FROM `k3` WHERE `time_type` = ? ",
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
            status: true,
            msg: "Success",
            data: list,
            totalPageCount:
              results.length > 0 ? Math.trunc(results[0].rows / 10) : 0,
          });
        }
      );
    }
  );
};

export const getD5PreiodList = (req, res) => {
  const page = req.query.page ? req.query.page : 0;
  const type = req.query.type ? req.query.type : "1min";

  const offset = page * 10;
  pool.query(
    "SELECT `multiple_num_result`, `num_result`, `period_id`, `time_type` FROM `d5` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 10 OFFSET ?",
    [type, offset],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      }
      const list = results;
      pool.query(
        "SELECT COUNT(id) as `rows` FROM `d5` WHERE `time_type` = ? ",
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
            status: true,
            msg: "Success",
            data: list,
            totalPageCount:
              results.length > 0 ? Math.trunc(results[0].rows / 10) : 0,
          });
        }
      );
    }
  );
};

export const getTrxWinPeriodList = (req, res) => {
  const page = req.query.page ? req.query.page : 0;
  const type = req.query.type ? req.query.type : "1min";

  const offset = page * 10;
  pool.query(
    "SELECT `block_result`, `num_result`, `period_id`, `color_result`, `time_type`, `created_at` FROM `trx` WHERE `time_type` = ? ORDER BY `id` DESC LIMIT 10 OFFSET ?",
    [type, offset],
    (err, results) => {
      if (err) {
        res.json({
          status: false,
          msg: err.message,
          data: [],
        });
        return;
      }
      const list = results;
      pool.query(
        "SELECT COUNT(id) as `rows` FROM `trx` WHERE `time_type` = ? ",
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
            status: true,
            msg: "Success",
            data: list,
            totalPageCount:
              results.length > 0 ? Math.trunc(results[0].rows / 10) : 0,
          });
        }
      );
    }
  );
};
