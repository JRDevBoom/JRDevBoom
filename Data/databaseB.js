const pgp = require("pg-promise")();
const db = pgp('postgres://postgres:123456@localhost:5432/project_car');
const moment = require('moment-timezone');

function processDataB(CarIn, CarOut) {
  const totalB = CarIn - CarOut;
  const queryB = `INSERT INTO public."projectB" ("timeB", "carinB", "caroutB", "totalB") VALUES (localtimestamp, $1, $2, $3)`;
  return db.none(queryB, [CarIn, CarOut, totalB])
    .catch((error) => {
      // บันทึก error ด้วย logger แทนการ console.log
     console.error('Error processing data:', error);
    });
}

function sendDataBAPI() {
  return new Promise((resolve, reject) => {
      Promise.all([
          db.any(`
              SELECT
                  series.time_interval,
                  COALESCE(SUM(p."carinB"), 0) AS carinB,
                  COALESCE(SUM(p."caroutB"), 0) AS caroutB
              FROM
                  (
                      SELECT DISTINCT generate_series(
                          date_trunc('hour', MIN(p."timeB")),
                          date_trunc('hour', MAX(p."timeB")) + INTERVAL '1 hour',
                          '15 minutes'::interval
                      ) AS time_interval
                      FROM "projectB" AS p
                  ) AS series
              LEFT JOIN
                  "projectB" AS p
              ON
                  date_trunc('hour', p."timeB") + INTERVAL '15 min' * floor(date_part('minute', p."timeB") / 15) = series.time_interval
              GROUP BY
                  series.time_interval
              ORDER BY
                  series.time_interval DESC;
          `),
          db.one(`
              SELECT SUM("carinB" - "caroutB") AS total
              FROM "projectB";
          `),
          db.one(`
              SELECT COALESCE(SUM(p."carinB"), 0) AS carin
              FROM "projectB" AS p
          `),
          db.one(`
              SELECT COALESCE(SUM(p."caroutB"), 0) AS carout
              FROM "projectB" AS p
          `)
      ])
      .then(([data1, result, data2, data3]) => {
          data1.forEach((item) => {
              item.time_interval = moment.tz(item.time_interval, 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
          });
          const totalRemainingCars = result.total;
          resolve({ data1, total: totalRemainingCars, carInBAll: data2.carin, carOutBAll: data3.carout });
      })
      .catch((error) => {
          reject(error); // Reject error
      });
  });
}

module.exports = { processDataB, sendDataBAPI};