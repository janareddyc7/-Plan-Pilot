import { EmptyState } from "@/components/shell/empty-state";
export default function Page() {
  return (
    <EmptyState
      title="Saved scenarios"
      description="Scenario saving will become available with the calculation engine. No scenarios have been saved in this preview."
    />
  );
}
