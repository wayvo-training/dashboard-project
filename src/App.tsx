import { useState } from "react";

import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardCards from "./components/dashboard/DashboardCards";
import DashboardChart from "./components/dashboard/DashboardChart";
import DashboardTable from "./components/dashboard/DashboardTable";
import Welcome from "./components/dashboard/Welcome";
import BugReportForm from "@/components/common/BugReportForm";

type Section =
  | "welcome"
  | "overview"
  | "analytics"
  | "table"
  | "bug-report";

function App() {
  const [section, setSection] =
    useState<Section>("welcome");

  return (
    <DashboardLayout
      activeSection={section}
      onSectionChange={setSection}
    >
      {section === "welcome" && (
        <Welcome />
      )}

      {section === "overview" && (
        <DashboardCards />
      )}

      {section === "analytics" && (
        <DashboardChart />
      )}

      {section === "table" && (
        <DashboardTable />
      )}
      
      {section === "bug-report" && <BugReportForm />}
    </DashboardLayout>
  );
}

export default App;