import {
  BarChart3,
  Database,
  LayoutDashboard,
} from "lucide-react";

function Welcome() {
  return (
    <div className="w-full px-6 py-10 lg:px-10">

      {/* Welcome */}
      <div className="max-w-4xl">

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to ECOMMERCE ANALYTICS
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          A centralized view of your ecommerce performance,
          designed to help you monitor key metrics, understand
          trends, and explore your business data.
        </p>
      </div>

      {/* Explore */}
      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          Explore your dashboard
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose a section from the sidebar to get started.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          {/* Overview */}
          <div className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <LayoutDashboard className="h-5 w-5" />
              </div>

              <span className="text-xs text-muted-foreground">
                01
              </span>
            </div>

            <h3 className="text-lg font-semibold">
              Overview
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Get a quick view of revenue, orders, customers,
              and overall business performance.
            </p>

          </div>

          {/* Analytics */}
          <div className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <BarChart3 className="h-5 w-5" />
              </div>

              <span className="text-xs text-muted-foreground">
                02
              </span>
            </div>

            <h3 className="text-lg font-semibold">
              Analytics
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Analyze performance trends and understand how
              your ecommerce metrics change over time.
            </p>

          </div>

          {/* Data */}
          <div className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                <Database className="h-5 w-5" />
              </div>

              <span className="text-xs text-muted-foreground">
                03
              </span>
            </div>

            <h3 className="text-lg font-semibold">
              Data Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore detailed records with sorting, filtering,
              pagination, and data management tools.
            </p>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Welcome;