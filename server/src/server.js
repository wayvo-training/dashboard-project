"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = __importDefault(require("pg"));
dotenv_1.default.config();
const { Pool } = pg_1.default;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ==========================================
// POSTGRESQL CONNECTION
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});
// ==========================================
// TEST DATABASE CONNECTION
// ==========================================
pool
    .connect()
    .then((client) => {
    console.log("PostgreSQL connected successfully");
    client.release();
})
    .catch((error) => {
    console.error("PostgreSQL connection failed:", error);
});
// ==========================================
// HOME ROUTE
// ==========================================
app.get("/", (req, res) => {
    res.send("Dashboard backend is running");
});
// ==========================================
// CARDS API
// ==========================================
app.get("/api/dashboard", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        SUM(total_revenue) AS total_revenue,
        SUM(orders) AS total_orders,
        SUM(new_customers) AS total_new_customers,
        SUM(cancelled_orders) AS total_cancelled_orders,

        (
          SELECT active_accounts
          FROM ecommerce_daily_data
          ORDER BY created_at DESC
          LIMIT 1
        ) AS active_accounts,

        (
          SELECT growth_rate
          FROM ecommerce_daily_data
          ORDER BY created_at DESC
          LIMIT 1
        ) AS growth_rate

      FROM ecommerce_daily_data;
    `);
        console.log("Dashboard summary:", result.rows[0]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Dashboard database error:", error);
        res.status(500).json({
            error: "Failed to get dashboard data",
        });
    }
});
// ==========================================
// CHARTS + TABLE DATA API
// ==========================================
app.get("/api/dashboard/history", async (req, res) => {
    try {
        const { range, startDate, endDate, } = req.query;
        let query = "";
        let values = [];
        // ==========================================
        // PREDEFINED DATE RANGES
        // ==========================================
        if (range === "7days" ||
            range === "1month" ||
            range === "3months") {
            let interval = "";
            if (range === "7days") {
                interval = "6 days";
            }
            else if (range === "1month") {
                interval = "1 month";
            }
            else {
                interval = "3 months";
            }
            query = `
          WITH latest AS (
            SELECT MAX(created_at) AS latest_date
            FROM ecommerce_daily_data
          )

          SELECT
            d.id,
            d.created_at,
            d.total_revenue,
            d.orders,
            d.new_customers,
            d.active_accounts,
            d.cancelled_orders,
            d.growth_rate

          FROM ecommerce_daily_data d

          CROSS JOIN latest

          WHERE d.created_at >=
            latest.latest_date -
            INTERVAL '${interval}'

            AND d.created_at <=
            latest.latest_date

          ORDER BY d.created_at ASC;
        `;
        }
        // ==========================================
        // CUSTOM DATE RANGE
        // ==========================================
        else if (startDate &&
            endDate) {
            query = `
          SELECT
            id,
            created_at,
            total_revenue,
            orders,
            new_customers,
            active_accounts,
            cancelled_orders,
            growth_rate

          FROM ecommerce_daily_data

          WHERE created_at >= $1::date

            AND created_at <
              ($2::date + INTERVAL '1 day')

          ORDER BY created_at ASC;
        `;
            values = [
                String(startDate),
                String(endDate),
            ];
        }
        // ==========================================
        // DEFAULT
        // ==========================================
        else {
            query = `
          WITH latest AS (
            SELECT MAX(created_at) AS latest_date
            FROM ecommerce_daily_data
          )

          SELECT
            d.id,
            d.created_at,
            d.total_revenue,
            d.orders,
            d.new_customers,
            d.active_accounts,
            d.cancelled_orders,
            d.growth_rate

          FROM ecommerce_daily_data d

          CROSS JOIN latest

          WHERE d.created_at >=
            latest.latest_date -
            INTERVAL '6 days'

            AND d.created_at <=
              latest.latest_date

          ORDER BY d.created_at ASC;
        `;
        }
        const result = await pool.query(query, values);
        console.log(`Chart/Table records returned: ${result.rows.length}`);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Chart database error:", error);
        res.status(500).json({
            error: "Failed to get dashboard history",
        });
    }
});
// ==========================================
// ADD TABLE ROW
// ==========================================
app.post("/api/dashboard/table", async (req, res) => {
    try {
        const { created_at, total_revenue, orders, new_customers, active_accounts, cancelled_orders, growth_rate, } = req.body;
        const result = await pool.query(`
        INSERT INTO ecommerce_daily_data
        (
          created_at,
          total_revenue,
          orders,
          new_customers,
          active_accounts,
          cancelled_orders,
          growth_rate
        )

        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )

        RETURNING *;
        `, [
            created_at,
            total_revenue,
            orders,
            new_customers,
            active_accounts,
            cancelled_orders,
            growth_rate,
        ]);
        console.log("Added row:", result.rows[0]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Add row error:", error);
        res.status(500).json({
            error: "Failed to add row",
        });
    }
});
// ==========================================
// EDIT TABLE ROW
// ==========================================
app.put("/api/dashboard/table/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { total_revenue, orders, new_customers, active_accounts, cancelled_orders, growth_rate, } = req.body;
        console.log("EDIT ID:", id);
        console.log("EDIT DATA:", req.body);
        const result = await pool.query(`
      UPDATE ecommerce_daily_data
      SET
        total_revenue = $1,
        orders = $2,
        new_customers = $3,
        active_accounts = $4,
        cancelled_orders = $5,
        growth_rate = $6
      WHERE id = $7
      RETURNING *;
      `, [
            total_revenue,
            orders,
            new_customers,
            active_accounts,
            cancelled_orders,
            growth_rate,
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Row not found",
            });
        }
        console.log("UPDATED:", result.rows[0]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error("EDIT DATABASE ERROR:", error);
        res.status(500).json({
            error: error instanceof Error
                ? error.message
                : "Failed to update row",
        });
    }
});
// ==========================================
// DELETE TABLE ROW
// ==========================================
app.delete("/api/dashboard/table/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting row ID:", id);
        const result = await pool.query(`
        DELETE FROM ecommerce_daily_data

        WHERE id = $1

        RETURNING *;
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Row not found",
            });
        }
        console.log("Deleted row:", result.rows[0]);
        res.json({
            message: "Row deleted successfully",
            row: result.rows[0],
        });
    }
    catch (error) {
        console.error("Delete row error:", error);
        res.status(500).json({
            error: "Failed to delete row",
        });
    }
});
// ==========================================
// START SERVER
// ==========================================
app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
