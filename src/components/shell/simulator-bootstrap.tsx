"use client";

import { useEffect } from "react";
import type { SimulatorInput } from "@/store/simulator-store";
import { useSimulatorStore } from "@/store/simulator-store";

/** Hydrates the shared simulator from either the signed-in account or the public preview. */
export function SimulatorBootstrap({
  input,
  children,
}: {
  input?: SimulatorInput;
  children: React.ReactNode;
}) {
  const initialize = useSimulatorStore((state) => state.initialize);

  useEffect(() => {
    initialize(input ?? {});
  }, [initialize, input]);

  return children;
}
