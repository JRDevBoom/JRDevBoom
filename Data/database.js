
const pgp = require("pg-promise")();
const db = pgp('postgres://postgres:123456@localhost:5432/project_car');
const moment = require('moment-timezone');

function processData(carin, carout) {
  const total = carin - carout;
  const query = "INSERT INTO project (time, carin, carout, total) VALUES (localtimestamp, $1, $2, $3)";
  return db.none(query, [carin, carout, total])
    .catch((error) => {
      // บันทึก error ด้วย logger แทนการ console.log
      logger.error('Error processing data:', error);
    });
}
function sendData() {
    return new Promise((resolve, reject) => {
    Promise.all([
        db.any(`
            SELECT
                series.time_interval,
                COALESCE(SUM(p.carin), 0) AS carin,
                COALESCE(SUM(p.carout), 0) AS carout
            FROM
                (
                    SELECT DISTINCT generate_series(
                        date_trunc('hour', MIN(p.time)),
                        date_trunc('hour', MAX(p.time)) + INTERVAL '1 hour',
                        '15 minutes'::interval
                    ) AS time_interval
                    FROM project AS p
                ) AS series
            LEFT JOIN
                project AS p
            ON
                date_trunc('hour', p.time) + INTERVAL '15 min' * floor(date_part('minute', p.time) / 15) = series.time_interval
            GROUP BY
                series.time_interval
            ORDER BY
                series.time_interval DESC;
        `),
        db.one(`
            SELECT SUM(carin - carout) AS total
            FROM project;
        `)
    ])
    .then(([data1, result]) => {
        data1.forEach((item) => {
            item.time_interval = moment.tz(item.time_interval, 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
        });
        const totalRemainingCars = result.total;
        resolve({ data1, totalcar: totalRemainingCars }); // Resolve data
    })
    .catch((error) => {
        reject(error); // Reject error
    });
}
)}



module.exports = { processData, sendData};
