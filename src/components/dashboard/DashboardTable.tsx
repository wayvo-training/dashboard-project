import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

import {
  MoreHorizontal,
  Plus,
  Settings2,
  ListFilter,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Checkbox } from "@/components/ui/checkbox";

const API_URL = "http://localhost:5000";

// ==========================================
// TABLE ROW TYPE
// ==========================================

type DashboardRow = {
  id: number;
  created_at: string;
  total_revenue: string;
  orders: string;
  new_customers: string;
  active_accounts: string;
  cancelled_orders: string;
  growth_rate: string;
};

// ==========================================
// FORM TYPE
// ==========================================

type FormData = {
  created_at: string;
  total_revenue: string;
  orders: string;
  new_customers: string;
  active_accounts: string;
  cancelled_orders: string;
  growth_rate: string;
};

// ==========================================
// EMPTY FORM
// ==========================================

const emptyForm: FormData = {
  created_at: "",
  total_revenue: "",
  orders: "",
  new_customers: "",
  active_accounts: "",
  cancelled_orders: "",
  growth_rate: "",
};

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const columns = [
  {
    key: "created_at",
    label: "Date",
  },
  {
    key: "total_revenue",
    label: "Revenue",
  },
  {
    key: "orders",
    label: "Orders",
  },
  {
    key: "new_customers",
    label: "New Customers",
  },
  {
    key: "active_accounts",
    label: "Active Accounts",
  },
  {
    key: "cancelled_orders",
    label: "Cancelled Orders",
  },
  {
    key: "growth_rate",
    label: "Growth Rate",
  },
] as const;

// ==========================================
// COMPONENT
// ==========================================

function DashboardTable() {
  const [rows, setRows] = useState<DashboardRow[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [totalRows, setTotalRows] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);
  const [search, setSearch] = useState("");
  // ==========================================
  // SORTING
  // ==========================================

  type SortColumn =
    | "created_at"
    | "total_revenue"
    | "orders"
    | "new_customers"
    | "active_accounts"
    | "cancelled_orders"
    | "growth_rate";

  const [sortBy, setSortBy] =
    useState<SortColumn>("created_at");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("asc");

  // Temporary values used inside the Sort menu.
  // They are only applied when the user clicks Apply.
  const [sortColumn, setSortColumn] =
    useState<SortColumn>("created_at");

  const [sortDirection, setSortDirection] =
    useState<"asc" | "desc">("asc");

  const [sortMenuOpen, setSortMenuOpen] =
    useState(false);

  // ==========================================
  // SELECTED ROWS
  // ==========================================

  const [selectedRows, setSelectedRows] =
    useState<number[]>([]);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [formData, setFormData] =
    useState<FormData>(emptyForm);

  // ==========================================
  // VISIBLE COLUMNS
  // ==========================================

  const [visibleColumns, setVisibleColumns] =
    useState<string[]>(
      columns.map(
        (column) => column.key
      )
    );

  // ==========================================
  // CUSTOMIZE COLUMNS PANEL
  // ==========================================

  const [columnMenuOpen, setColumnMenuOpen] =
    useState(false);

  const columnMenuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setColumnMenuOpen(false);
      }
    };

    if (columnMenuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [columnMenuOpen]);

  const isColumnVisible = (
    column: string
  ) => {
    return visibleColumns.includes(
      column
    );
  };

  // ==========================================
  // TOGGLE COLUMN
  // ==========================================

  const toggleColumn = (
    columnKey: string,
    checked: boolean
  ) => {
    setVisibleColumns((current) => {
      if (checked) {
        if (
          current.includes(columnKey)
        ) {
          return current;
        }

        return [
          ...current,
          columnKey,
        ];
      }

      return current.filter(
        (key) => key !== columnKey
      );
    });
  };

  // ==========================================
  // FETCH TABLE DATA
  // ==========================================

  const fetchRows = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
          page: String(page),
          limit: String(rowsPerPage),
          sortBy,
          sortOrder,
        });

if (search.trim() !== "") {
  params.set("search", search.trim());
}
      const response = await fetch(
        `${API_URL}/api/dashboard/history?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch table data"
        );
      }

      const result =
        await response.json();

      console.log(
        "Table request:",
        params.toString()
      );

      setRows(result.data);

      setSelectedRows((current) =>
        current.filter((id) =>
          result.data.some(
            (row: DashboardRow) =>
              row.id === id
          )
        )
      );

      setTotalRows(result.total);
      setTotalPages(
        Math.max(1, result.totalPages)
      );
      setError(null);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch data"
      );

    } finally {
      setLoading(false);
    }
  };

  // Keep selections that still exist in the newly
  // fetched page. Rows that are no longer visible
  // are removed from the selected count.

useEffect(() => {
  fetchRows();
}, [
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  search,
]);

  // ==========================================
  // SORT MENU
  // ==========================================

  const applySort = () => {
    setSortBy(sortColumn);
    setSortOrder(sortDirection);
    setPage(1);
    setSelectedRows([]);
    setSortMenuOpen(false);
  };

  const clearSort = () => {
    setSortColumn("created_at");
    setSortDirection("asc");
    setSortBy("created_at");
    setSortOrder("asc");
    setPage(1);
    setSelectedRows([]);
    setSortMenuOpen(false);
  };

  // ==========================================
  // ROW SELECTION
  // ==========================================

  const isRowSelected = (id: number) =>
    selectedRows.includes(id);

  const toggleRowSelection = (
    id: number,
    checked: boolean
  ) => {
    setSelectedRows((current) => {
      if (checked) {
        return current.includes(id)
          ? current
          : [...current, id];
      }

      return current.filter(
        (selectedId) => selectedId !== id
      );
    });
  };

  const allCurrentRowsSelected =
    rows.length > 0 &&
    rows.every((row) =>
      selectedRows.includes(row.id)
    );
  const toggleAllCurrentRows = (
    checked: boolean
  ) => {
    setSelectedRows((current) => {
      if (checked) {
        const currentIds = rows.map(
          (row) => row.id
        );

        return Array.from(
          new Set([
            ...current,
            ...currentIds,
          ])
        );
      }

      const currentIds = new Set(
        rows.map((row) => row.id)
      );

      return current.filter(
        (id) => !currentIds.has(id)
      );
    });
  };

  // ==========================================
  // OPEN ADD DIALOG
  // ==========================================

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  // ==========================================
  // OPEN EDIT DIALOG
  // ==========================================

  const handleEdit = (
    row: DashboardRow
  ) => {
    setEditingId(row.id);

    setFormData({
      created_at:
        row.created_at.slice(0, 10),

      total_revenue:
        String(row.total_revenue),

      orders:
        String(row.orders),

      new_customers:
        String(row.new_customers),

      active_accounts:
        String(row.active_accounts),

      cancelled_orders:
        String(row.cancelled_orders),

      growth_rate:
        String(row.growth_rate),
    });

    setDialogOpen(true);
  };

  // ==========================================
  // DELETE ROW
  // ==========================================

  const handleDelete = async (
    id: number
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this row?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/dashboard/table/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to delete row"
        );
      }

      await fetchRows();

    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete row"
      );
    }
  };

  // ==========================================
  // SAVE ROW
  // ==========================================

  const handleSave = async () => {
    try {
      const isEditing =
        editingId !== null;

      const url = isEditing
        ? `${API_URL}/api/dashboard/table/${editingId}`
        : `${API_URL}/api/dashboard/table`;

      const method = isEditing
        ? "PUT"
        : "POST";

      // When editing, do not send created_at.
      // The database keeps the existing date.

      const body = isEditing
        ? {
            total_revenue: Number(
              formData.total_revenue
            ),

            orders: Number(
              formData.orders
            ),

            new_customers: Number(
              formData.new_customers
            ),

            active_accounts: Number(
              formData.active_accounts
            ),

            cancelled_orders: Number(
              formData.cancelled_orders
            ),

            growth_rate: Number(
              formData.growth_rate
            ),
          }
        : {
            created_at:
              formData.created_at,

            total_revenue: Number(
              formData.total_revenue
            ),

            orders: Number(
              formData.orders
            ),

            new_customers: Number(
              formData.new_customers
            ),

            active_accounts: Number(
              formData.active_accounts
            ),

            cancelled_orders: Number(
              formData.cancelled_orders
            ),

            growth_rate: Number(
              formData.growth_rate
            ),
          };

      console.log("Saving row:", {
        editingId,
        method,
        url,
        body,
      });

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Response status:",
        response.status
      );

      console.log(
        "Response:",
        responseText
      );

      if (!response.ok) {
        throw new Error(
          `Request failed (${response.status}): ${responseText}`
        );
      }

      setDialogOpen(false);
      setEditingId(null);
      setFormData(emptyForm);

      await fetchRows();

    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save row"
      );
    }
  };

  // ==========================================
  // FORM FIELD
  // ==========================================

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================
  // LOADING
  // ==========================================

  
  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="rounded-lg border p-6">

        <p className="font-semibold text-red-500">
          Failed to load table
        </p>

        <p className="text-sm text-muted-foreground">
          {error}
        </p>

      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold">
            Data Table
          </h2>

          <p className="text-sm text-muted-foreground">
            Manage ecommerce performance data.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* GLOBAL SEARCH */}

          <Input
            placeholder="Search..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setSelectedRows([]);
            }}
            className="w-64"
          />

          {/* ==================================
              SORT
          ================================== */}

          <div className="relative">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSortMenuOpen(
                  (open) => !open
                )
              }
            >
              <ListFilter className="mr-2 h-4 w-4" />
              Sort
            </Button>

            {sortMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-md border bg-background p-4 shadow-lg">

                <div className="mb-4">
                  <p className="text-sm font-semibold">
                    Sort Data
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Choose a column and sort order.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Sort by
                  </label>

                  <select
                    value={sortColumn}
                    onChange={(event) =>
                      setSortColumn(
                        event.target.value as SortColumn
                      )
                    }
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {columns.map((column) => (
                      <option
                        key={column.key}
                        value={column.key}
                      >
                        {column.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium">
                    Order
                  </label>

                  <div className="space-y-2">

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="dashboard-sort-order"
                        value="asc"
                        checked={
                          sortDirection === "asc"
                        }
                        onChange={() =>
                          setSortDirection("asc")
                        }
                      />
                      Ascending
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="dashboard-sort-order"
                        value="desc"
                        checked={
                          sortDirection === "desc"
                        }
                        onChange={() =>
                          setSortDirection("desc")
                        }
                      />
                      Descending
                    </label>

                  </div>
                </div>

                <div className="flex justify-end gap-2">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSort}
                  >
                    Clear Sort
                  </Button>

                  <Button
                    type="button"
                    onClick={applySort}
                  >
                    Apply
                  </Button>

                </div>

              </div>
            )}

          </div>

          {/* ==================================
              CUSTOMIZE COLUMNS
          ================================== */}

          <div
            ref={columnMenuRef}
            className="relative"
          >

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setColumnMenuOpen(
                  (open) => !open
                )
              }
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Customize Columns
            </Button>

            {columnMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border bg-background p-2 shadow-lg">

                <div className="px-2 py-2">

                  <p className="text-sm font-medium">
                    Show columns
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Select the columns you want to display.
                  </p>

                </div>

                <div className="my-1 h-px bg-border" />

                <div className="space-y-1">

                  {columns.map((column) => (
                    <label
                      key={column.key}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    >

                      <Checkbox
                        checked={isColumnVisible(
                          column.key
                        )}
                        onCheckedChange={(
                          checked
                        ) =>
                          toggleColumn(
                            column.key,
                            checked === true
                          )
                        }
                      />

                      <span>
                        {column.label}
                      </span>

                    </label>
                  ))}

                </div>

              </div>
            )}

          </div>

          {/* ==================================
              ADD ROW
          ================================== */}

          <Button
            onClick={handleAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>

        </div>

      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-lg border">

        <Table>

          {/* ==================================
              TABLE HEADER
          ================================== */}

          <TableHeader>

            <TableRow>

              {/* CHECKBOX - ALWAYS VISIBLE */}

              <TableHead className="w-10">
                <Checkbox
                    checked={allCurrentRowsSelected}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    onCheckedChange={(checked) =>
                      toggleAllCurrentRows(
                        checked === true
                      )
                    }
                    aria-label="Select all rows"
                  />
              </TableHead>

              {/* DATE */}

              {isColumnVisible(
                "created_at"
              ) && (
                <TableHead>
                  Date
                </TableHead>
              )}

              {/* REVENUE */}

              {isColumnVisible(
                "total_revenue"
              ) && (
                <TableHead>
                  Revenue
                </TableHead>
              )}

              {/* ORDERS */}

              {isColumnVisible(
                "orders"
              ) && (
                <TableHead>
                  Orders
                </TableHead>
              )}

              {/* NEW CUSTOMERS */}

              {isColumnVisible(
                "new_customers"
              ) && (
                <TableHead>
                  New Customers
                </TableHead>
              )}

              {/* ACTIVE ACCOUNTS */}

              {isColumnVisible(
                "active_accounts"
              ) && (
                <TableHead>
                  Active Accounts
                </TableHead>
              )}

              {/* CANCELLED ORDERS */}

              {isColumnVisible(
                "cancelled_orders"
              ) && (
                <TableHead>
                  Cancelled Orders
                </TableHead>
              )}

              {/* GROWTH RATE */}

              {isColumnVisible(
                "growth_rate"
              ) && (
                <TableHead>
                  Growth Rate
                </TableHead>
              )}

              {/* ACTIONS - ALWAYS VISIBLE */}

              <TableHead className="w-10" />

            </TableRow>

          </TableHeader>

          {/* ==================================
              TABLE BODY
          ================================== */}

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {/* Checkbox */}
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>

                  {/* Date */}
                  {isColumnVisible("created_at") && (
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}

                  {/* Revenue */}
                  {isColumnVisible("total_revenue") && (
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  )}

                  {/* Orders */}
                  {isColumnVisible("orders") && (
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  )}

                  {/* New Customers */}
                  {isColumnVisible("new_customers") && (
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}

                  {/* Active Accounts */}
                  {isColumnVisible("active_accounts") && (
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}

                  {/* Cancelled Orders */}
                  {isColumnVisible("cancelled_orders") && (
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}

                  {/* Growth Rate */}
                  {isColumnVisible("growth_rate") && (
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (

              /* EMPTY STATE */
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 2}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-medium">
                      No data found
                    </p>

                    <p className="text-sm text-muted-foreground">
                      There are no records to display.
                    </p>
                  </div>
                </TableCell>
              </TableRow>

            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                >

                  {/* CHECKBOX */}

                  <TableCell>
                    <Checkbox
                      checked={isRowSelected(
                        row.id
                      )}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onCheckedChange={(checked) =>
                        toggleRowSelection(
                          row.id,
                          checked === true
                        )
                      }
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>

                  {/* DATE */}

                  {isColumnVisible(
                    "created_at"
                  ) && (
                    <TableCell>
                      {new Date(
                        row.created_at
                      ).toLocaleDateString()}
                    </TableCell>
                  )}

                  {/* REVENUE */}

                  {isColumnVisible(
                    "total_revenue"
                  ) && (
                    <TableCell>
                      ₹
                      {Number(
                        row.total_revenue
                      ).toLocaleString()}
                    </TableCell>
                  )}

                  {/* ORDERS */}

                  {isColumnVisible(
                    "orders"
                  ) && (
                    <TableCell>
                      {Number(
                        row.orders
                      ).toLocaleString()}
                    </TableCell>
                  )}

                  {/* NEW CUSTOMERS */}

                  {isColumnVisible(
                    "new_customers"
                  ) && (
                    <TableCell>
                      {Number(
                        row.new_customers
                      ).toLocaleString()}
                    </TableCell>
                  )}

                  {/* ACTIVE ACCOUNTS */}

                  {isColumnVisible(
                    "active_accounts"
                  ) && (
                    <TableCell>
                      {Number(
                        row.active_accounts
                      ).toLocaleString()}
                    </TableCell>
                  )}

                  {/* CANCELLED ORDERS */}

                  {isColumnVisible(
                    "cancelled_orders"
                  ) && (
                    <TableCell>
                      {Number(
                        row.cancelled_orders
                      ).toLocaleString()}
                    </TableCell>
                  )}

                  {/* GROWTH RATE */}

                  {isColumnVisible(
                    "growth_rate"
                  ) && (
                    <TableCell>
                      {row.growth_rate}%
                    </TableCell>
                  )}

                  {/* THREE DOT MENU */}

                  <TableCell>

                    <DropdownMenu>

                      <DropdownMenuTrigger
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                      >

                        <DropdownMenuItem
                          onClick={() =>
                            handleEdit(row)
                          }
                        >
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            handleDelete(
                              row.id
                            )
                          }
                        >
                          Remove
                        </DropdownMenuItem>

                      </DropdownMenuContent>

                    </DropdownMenu>

                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>

          </Table>

          </div>
      {/* ======================================
          PAGINATION
      ====================================== */}

      <div className="flex items-center justify-between px-2 py-4">

        <div className="text-sm text-muted-foreground">
          {selectedRows.length} of {totalRows} row(s) selected.
        </div>

        <div className="flex items-center gap-6">

          {/* ROWS PER PAGE */}

          <div className="flex items-center gap-2">

            <span className="text-sm">
              Rows per page
            </span>

            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(
                  Number(event.target.value)
                );

                setPage(1);
                setSelectedRows([]);
              }}
              className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>

          </div>

          {/* PAGE NUMBER */}

          <div className="text-sm whitespace-nowrap">
            Page {page} of {totalPages}
          </div>

          {/* PAGE CONTROLS */}

          <div className="flex items-center gap-2">

            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page === 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              «
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              aria-label="Previous page"
            >
              ‹
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
              aria-label="Next page"
            >
              ›
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0"
              disabled={page >= totalPages}
              onClick={() =>
                setPage(totalPages)
              }
              aria-label="Last page"
            >
              »
            </Button>

          </div>

        </div>

      </div>

      {/* ======================================
          ADD / EDIT DIALOG
      ====================================== */}

      <Dialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              {editingId !== null
                ? "Edit Row"
                : "Add Row"}
            </DialogTitle>

          </DialogHeader>

          <div className="grid gap-4">

            {/* DATE */}

            <div>

              <label className="text-sm font-medium">
                Date
              </label>

              <Input
                type="date"
                value={
                  formData.created_at
                }
                disabled={
                  editingId !== null
                }
                onChange={(event) =>
                  updateField(
                    "created_at",
                    event.target.value
                  )
                }
              />

            </div>

            {/* TOTAL REVENUE */}

            <div>

              <label className="text-sm font-medium">
                Total Revenue
              </label>

              <Input
                type="number"
                value={
                  formData.total_revenue
                }
                onChange={(event) =>
                  updateField(
                    "total_revenue",
                    event.target.value
                  )
                }
              />

            </div>

            {/* ORDERS */}

            <div>

              <label className="text-sm font-medium">
                Orders
              </label>

              <Input
                type="number"
                value={
                  formData.orders
                }
                onChange={(event) =>
                  updateField(
                    "orders",
                    event.target.value
                  )
                }
              />

            </div>

            {/* NEW CUSTOMERS */}

            <div>

              <label className="text-sm font-medium">
                New Customers
              </label>

              <Input
                type="number"
                value={
                  formData.new_customers
                }
                onChange={(event) =>
                  updateField(
                    "new_customers",
                    event.target.value
                  )
                }
              />

            </div>

            {/* ACTIVE ACCOUNTS */}

            <div>

              <label className="text-sm font-medium">
                Active Accounts
              </label>

              <Input
                type="number"
                value={
                  formData.active_accounts
                }
                onChange={(event) =>
                  updateField(
                    "active_accounts",
                    event.target.value
                  )
                }
              />

            </div>

            {/* CANCELLED ORDERS */}

            <div>

              <label className="text-sm font-medium">
                Cancelled Orders
              </label>

              <Input
                type="number"
                value={
                  formData.cancelled_orders
                }
                onChange={(event) =>
                  updateField(
                    "cancelled_orders",
                    event.target.value
                  )
                }
              />

            </div>

            {/* GROWTH RATE */}

            <div>

              <label className="text-sm font-medium">
                Growth Rate
              </label>

              <Input
                type="number"
                step="0.01"
                value={
                  formData.growth_rate
                }
                onChange={(event) =>
                  updateField(
                    "growth_rate",
                    event.target.value
                  )
                }
              />

            </div>

            {/* DIALOG BUTTONS */}

            <div className="flex justify-end gap-2">

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingId(null);
                  setFormData(
                    emptyForm
                  );
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSave}
              >
                {editingId !== null
                  ? "Edit"
                  : "Add Row"}
              </Button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  );
}

export default DashboardTable
