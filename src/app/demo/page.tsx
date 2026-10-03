import { Workspace } from "@/components/shell/workspace";
import { Dashboard } from "@/components/shell/dashboard";
export default function Page() {
  return (
    <Workspace guest>
      <Dashboard />
    </Workspace>
  );
}
