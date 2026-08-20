import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const app = express();

app.use(cors());
app.use(express.json());

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
    console.log(
      "PostgreSQL connected successfully"
    );

    client.release();
  })
  .catch((error) => {
    console.error(
      "PostgreSQL connection failed:",
      error
    );
  });

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "Dashboard backend is running"
  );
});

// ==========================================
// CARDS API
// ==========================================

// ==========================================
// CARDS API
// CURRENT MONTH VS PREVIOUS MONTH
// ==========================================

app.get(
  "/api/dashboard",
  async (req, res) => {
    try {
      const result = await pool.query(`
        WITH latest_month AS (
          SELECT
            DATE_TRUNC(
              'month',
              MAX(created_at)
            ) AS current_month
          FROM ecommerce_daily_data
        ),

        monthly_data AS (
          SELECT
            DATE_TRUNC(
              'month',
              created_at
            ) AS month,

            SUM(total_revenue) AS total_revenue,

            SUM(orders) AS total_orders,

            SUM(new_customers) AS total_new_customers,

            SUM(cancelled_orders) AS total_cancelled_orders,

            AVG(active_accounts) AS average_active_accounts,

            MAX(active_accounts) AS latest_active_accounts

          FROM ecommerce_daily_data

          GROUP BY
            DATE_TRUNC(
              'month',
              created_at
            )
        ),

        current_month AS (
          SELECT
            m.*
          FROM monthly_data m
          CROSS JOIN latest_month l
          WHERE m.month = l.current_month
        ),

        previous_month AS (
          SELECT
            m.*
          FROM monthly_data m
          CROSS JOIN latest_month l
          WHERE m.month =
            l.current_month - INTERVAL '1 month'
        )

        SELECT

          -- =====================================
          -- CURRENT MONTH
          -- =====================================

          current_month.total_revenue,

          current_month.total_orders,

          current_month.total_new_customers,

          current_month.total_cancelled_orders,

          current_month.latest_active_accounts,

          -- =====================================
          -- PREVIOUS MONTH
          -- =====================================

          COALESCE(
            previous_month.total_revenue,
            0
          ) AS previous_revenue,

          COALESCE(
            previous_month.total_orders,
            0
          ) AS previous_orders,

          COALESCE(
            previous_month.total_new_customers,
            0
          ) AS previous_new_customers,

          COALESCE(
            previous_month.total_cancelled_orders,
            0
          ) AS previous_cancelled_orders,

          COALESCE(
            previous_month.latest_active_accounts,
            0
          ) AS previous_active_accounts

        FROM current_month

        LEFT JOIN previous_month
          ON TRUE;
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "No dashboard data available",
        });
      }

      const row = result.rows[0];

      // ==========================================
      // HELPER
      // ==========================================

      const calculatePercentage = (
        current: number,
        previous: number
      ): number => {
        if (previous === 0) {
          return 0;
        }

        return Number(
          (
            ((current - previous) /
              previous) *
            100
          ).toFixed(2)
        );
      };

      // ==========================================
      // CURRENT VALUES
      // ==========================================

      const revenue =
        Number(row.total_revenue);

      const orders =
        Number(row.total_orders);

      const newCustomers =
        Number(row.total_new_customers);

      const activeAccounts =
        Number(row.latest_active_accounts);

      const cancelledOrders =
        Number(
          row.total_cancelled_orders
        );

      // ==========================================
      // PREVIOUS MONTH VALUES
      // ==========================================

      const previousRevenue =
        Number(row.previous_revenue);

      const previousOrders =
        Number(row.previous_orders);

      const previousNewCustomers =
        Number(
          row.previous_new_customers
        );

      const previousActiveAccounts =
        Number(
          row.previous_active_accounts
        );

      const previousCancelledOrders =
        Number(
          row.previous_cancelled_orders
        );

      // ==========================================
      // MONTHLY CHANGES
      // ==========================================

      const revenueChange =
        calculatePercentage(
          revenue,
          previousRevenue
        );

      const ordersChange =
        calculatePercentage(
          orders,
          previousOrders
        );

      const customersChange =
        calculatePercentage(
          newCustomers,
          previousNewCustomers
        );

      const activeAccountsChange =
        calculatePercentage(
          activeAccounts,
          previousActiveAccounts
        );

      const cancelledOrdersChange =
        calculatePercentage(
          cancelledOrders,
          previousCancelledOrders
        );

      // ==========================================
      // GROWTH RATE
      // ==========================================
      // Growth rate = current month's
      // orders compared with previous month's orders

      const growthRate =
        ordersChange;

      // ==========================================
      // FORMAT HELPERS
      // ==========================================

      const formatCurrency = (
        value: number
      ) => {
        return `₹${value.toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`;
      };

      const formatNumber = (
        value: number
      ) => {
        return value.toLocaleString(
          "en-IN"
        );
      };

      const formatPercentage = (
        value: number
      ) => {
        const sign =
          value >= 0 ? "+" : "";

        return `${sign}${value.toFixed(
          2
        )}%`;
      };

      const getIndicator = (
        value: number
      ): "up" | "down" => {
        return value >= 0
          ? "up"
          : "down";
      };

      // ==========================================
      // CARD DATA
      // ==========================================

      const cards = [
        {
          title: "Total Revenue",

          value:
            formatCurrency(revenue),

          percentage:
            formatPercentage(
              revenueChange
            ),

          description:
            revenueChange >= 0
              ? "Trending up this month"
              : "Down this month",

          sub_desc:
            "Compared to last month",

          performance_indicator:
            getIndicator(
              revenueChange
            ),
        },

        {
          title: "Total Orders",

          value:
            formatNumber(orders),

          percentage:
            formatPercentage(
              ordersChange
            ),

          description:
            ordersChange >= 0
              ? "Orders are increasing"
              : "Orders are decreasing",

          sub_desc:
            "Compared to last month",

          performance_indicator:
            getIndicator(
              ordersChange
            ),
        },

        {
          title: "New Customers",

          value:
            formatNumber(
              newCustomers
            ),

          percentage:
            formatPercentage(
              customersChange
            ),

          description:
            customersChange >= 0
              ? "Customer acquisition is growing"
              : "Customer acquisition is down",

          sub_desc:
            "Compared to last month",

          performance_indicator:
            getIndicator(
              customersChange
            ),
        },

        {
          title: "Growth Rate",

          value:
            `${growthRate.toFixed(
              2
            )}%`,

          percentage:
            formatPercentage(
              growthRate
            ),

          description:
            growthRate >= 0
              ? "Monthly growth is positive"
              : "Monthly growth is negative",

          sub_desc:
            "Based on monthly order growth",

          performance_indicator:
            getIndicator(
              growthRate
            ),
        },
      ];

      // ==========================================
      // RESPONSE
      // ==========================================

      console.log(
        "Dashboard cards:",
        cards
      );

      res.json({
        cards,

        // Keep the raw values available
        // so existing code does not break.

        total_revenue: revenue,

        total_orders: orders,

        total_new_customers:
          newCustomers,

        total_cancelled_orders:
          cancelledOrders,

        active_accounts:
          activeAccounts,

        growth_rate:
          growthRate,

        changes: {
          revenue: revenueChange,
          orders: ordersChange,
          new_customers:
            customersChange,
          active_accounts:
            activeAccountsChange,
          cancelled_orders:
            cancelledOrdersChange,
        },
      });

    } catch (error) {
      console.error(
        "Dashboard database error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to get dashboard data",
      });
    }
  }
);

// ==========================================
// CHARTS + TABLE DATA API
// ==========================================

app.get(
  "/api/dashboard/history",
  async (req, res) => {
    try {
      const {
        range,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        sortOrder,
        search,
      } = req.query;

      // ==========================================
      // CHECK WHETHER PAGINATION WAS REQUESTED
      // ==========================================

      const paginationRequested =
        page !== undefined ||
        limit !== undefined;

      // ==========================================
      // SORTING
      // ==========================================

      const sortableColumns: Record<string, string> = {
        created_at: "d.created_at",
        total_revenue: "d.total_revenue",
        orders: "d.orders",
        new_customers: "d.new_customers",
        active_accounts: "d.active_accounts",
        cancelled_orders: "d.cancelled_orders",
        growth_rate: "d.growth_rate",
      };

      const requestedSort =
        typeof sortBy === "string"
          ? sortBy
          : "created_at";

      const requestedOrder =
        typeof sortOrder === "string" &&
        sortOrder.toLowerCase() === "desc"
          ? "DESC"
          : "ASC";

      const sortColumn =
        sortableColumns[requestedSort] ??
        sortableColumns.created_at;

      let currentPage = Number(page) || 1;
      let rowsPerPage = Number(limit) || 10;

      if (currentPage < 1) {
        currentPage = 1;
      }

      if (rowsPerPage < 1) {
        rowsPerPage = 10;
      }

      if (rowsPerPage > 100) {
        rowsPerPage = 100;
      }

      const offset =
        (currentPage - 1) *
        rowsPerPage;

      // ==========================================
      // BUILD FILTER CONDITIONS
      // ==========================================

      let whereClause = "";
      const values: (string | number)[] =
        [];

      // ==========================================
      // PREDEFINED DATE RANGES
      // ==========================================

      if (
        range === "7days" ||
        range === "1month" ||
        range === "3months"
      ) {
        let interval = "";

        if (range === "7days") {
          interval = "6 days";
        } else if (
          range === "1month"
        ) {
          interval = "1 month";
        } else {
          interval = "3 months";
        }

        whereClause = `
          d.created_at >=
            (
              SELECT MAX(created_at)
              FROM ecommerce_daily_data
            ) - INTERVAL '${interval}'

          AND d.created_at <=
            (
              SELECT MAX(created_at)
              FROM ecommerce_daily_data
            )
        `;
      }

      // ==========================================
      // CUSTOM DATE RANGE
      // ==========================================

      else if (
        startDate &&
        endDate
      ) {
        values.push(
          String(startDate),
          String(endDate)
        );

        whereClause = `
          d.created_at >= $1::date

          AND d.created_at <
            ($2::date + INTERVAL '1 day')
        `;
      }

      // ==========================================
      // DEFAULT
      // ==========================================

      else if (!paginationRequested) {
        whereClause = `
          d.created_at >=
            (
              SELECT MAX(created_at)
              FROM ecommerce_daily_data
            ) - INTERVAL '6 days'

          AND d.created_at <=
            (
              SELECT MAX(created_at)
              FROM ecommerce_daily_data
            )
        `;
      }

      // ==========================================
      // GLOBAL SEARCH
      // ==========================================

      if (
        typeof search === "string" &&
        search.trim() !== ""
      ) {
        const searchPosition =
          values.length + 1;

        values.push(
          `%${search.trim()}%`
        );

        const searchCondition = `
          (
            CAST(d.created_at AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.total_revenue AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.orders AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.new_customers AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.active_accounts AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.cancelled_orders AS TEXT)
              ILIKE $${searchPosition}

            OR CAST(d.growth_rate AS TEXT)
              ILIKE $${searchPosition}
          )
        `;

        whereClause = whereClause
          ? `${whereClause} AND ${searchCondition}`
          : searchCondition;
      }

      // ==========================================
      // PAGINATED REQUEST
      // ==========================================

      if (paginationRequested) {
        const limitPosition =
          values.length + 1;

        const offsetPosition =
          values.length + 2;

        values.push(
          rowsPerPage,
          offset
        );

        const query = `
          SELECT
            d.id,
            d.created_at,
            d.total_revenue,
            d.orders,
            d.new_customers,
            d.active_accounts,
            d.cancelled_orders,
            d.growth_rate,

            COUNT(*) OVER() AS total_count

          FROM ecommerce_daily_data d

          ${whereClause ? `WHERE ${whereClause}` : ""}

          ORDER BY
            CASE
              WHEN '${requestedSort}' = 'created_at'
                THEN EXTRACT(EPOCH FROM d.created_at)
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'total_revenue'
                THEN d.total_revenue
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'orders'
                THEN d.orders
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'new_customers'
                THEN d.new_customers
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'active_accounts'
                THEN d.active_accounts
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'cancelled_orders'
                THEN d.cancelled_orders
            END ${requestedOrder},

            CASE
              WHEN '${requestedSort}' = 'growth_rate'
                THEN d.growth_rate
            END ${requestedOrder},

            d.id ASC

          LIMIT $${limitPosition}

          OFFSET $${offsetPosition};
        `;

        const result =
          await pool.query(
            query,
            values
          );

        const total =
          result.rows.length > 0
            ? Number(
                result.rows[0]
                  .total_count
              )
            : await getTotalCount(
                whereClause,
                values.slice(
                  0,
                  values.length - 2
                )
              );

        const totalPages =
          Math.ceil(
            total / rowsPerPage
          );

        const data =
          result.rows.map(
            (row) => {
              const {
                total_count,
                ...record
              } = row;

              return record;
            }
          );

        console.log(
          `Paginated records: page ${currentPage}, limit ${rowsPerPage}, sort ${requestedSort} ${requestedOrder}, search "${typeof search === "string" ? search : ""}", returned ${data.length}, total ${total}`
        );

        return res.json({
          data,
          total,
          page: currentPage,
          limit: rowsPerPage,
          totalPages,
        });
      }

      // ==========================================
      // NORMAL REQUEST
      // ==========================================
      // Used by the chart.
      //
      // This keeps the existing response as
      // an array so DashboardChart does not
      // break.

      const query = `
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

        ${whereClause ? `WHERE ${whereClause}` : ""}

        ORDER BY
          d.created_at ASC,
          d.id ASC;
      `;

      const result =
        await pool.query(
          query,
          values
        );

      console.log(
        `Chart records returned: ${result.rows.length}`
      );

      return res.json(
        result.rows
      );

    } catch (error) {
      console.error(
        "Chart/Table database error:",
        error
      );

      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get dashboard history",
      });
    }
  }
);


// ==========================================
// GET TOTAL COUNT
// ==========================================

async function getTotalCount(
  whereClause: string,
  values: (string | number)[]
) {
  const query = `
    SELECT COUNT(*) AS total

    FROM ecommerce_daily_data d

    ${whereClause ? `WHERE ${whereClause}` : ""};
  `;

  const result =
    await pool.query(
      query,
      values
    );

  return Number(
    result.rows[0].total
  );
}

// ==========================================
// ADD TABLE ROW
// ==========================================

app.post(
  "/api/dashboard/table",
  async (req, res) => {
    try {
      const {
        created_at,
        total_revenue,
        orders,
        new_customers,
        active_accounts,
        cancelled_orders,
        growth_rate,
      } = req.body;

      const result =
        await pool.query(
          `
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
          `,
          [
            created_at,
            total_revenue,
            orders,
            new_customers,
            active_accounts,
            cancelled_orders,
            growth_rate,
          ]
        );

      console.log(
        "Added row:",
        result.rows[0]
      );

      res.status(201).json(
        result.rows[0]
      );

    } catch (error) {
      console.error(
        "Add row error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to add row",
      });
    }
  }
);

// ==========================================
// EDIT TABLE ROW
// ==========================================

app.put(
  "/api/dashboard/table/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        total_revenue,
        orders,
        new_customers,
        active_accounts,
        cancelled_orders,
        growth_rate,
      } = req.body;

      console.log(
        "EDIT ID:",
        id
      );

      console.log(
        "EDIT DATA:",
        req.body
      );

      const result =
        await pool.query(
          `
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
          `,
          [
            total_revenue,
            orders,
            new_customers,
            active_accounts,
            cancelled_orders,
            growth_rate,
            id,
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Row not found",
        });
      }

      console.log(
        "UPDATED:",
        result.rows[0]
      );

      res.json(
        result.rows[0]
      );

    } catch (error) {
      console.error(
        "EDIT DATABASE ERROR:",
        error
      );

      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update row",
      });
    }
  }
);

// ==========================================
// DELETE TABLE ROW
// ==========================================

app.delete(
  "/api/dashboard/table/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      console.log(
        "Deleting row ID:",
        id
      );

      const result =
        await pool.query(
          `
          DELETE FROM ecommerce_daily_data

          WHERE id = $1

          RETURNING *;
          `,
          [id]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Row not found",
        });
      }

      console.log(
        "Deleted row:",
        result.rows[0]
      );

      res.json({
        message:
          "Row deleted successfully",

        row:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Delete row error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to delete row",
      });
    }
  }
);

// ==========================================
// BUG REPORT API
// ==========================================

app.post(
  "/api/bugs",
  async (req, res) => {
    try {
      const { bug_title, description } = req.body;

      // Validate required fields
      if (
        !bug_title ||
        !bug_title.trim() ||
        !description ||
        !description.trim()
      ) {
        return res.status(400).json({
          error: "Bug title and description are required",
        });
      }

      // Validate description length
      if (description.length > 100) {
        return res.status(400).json({
          error: "Description must be 100 characters or less",
        });
      }

      const result = await pool.query(
        `
          INSERT INTO bug_reports
          (
            bug_title,
            description
          )
          VALUES
          (
            $1,
            $2
          )
          RETURNING *;
        `,
        [
          bug_title.trim(),
          description.trim(),
        ]
      );

      console.log(
        "Bug report added:",
        result.rows[0]
      );

      res.status(201).json(
        result.rows[0]
      );

    } catch (error) {
      console.error(
        "Bug report error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to submit bug report",
      });
    }
  }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(5000, () => {
  console.log(
    "Backend running on http://localhost:5000"
  );
});
