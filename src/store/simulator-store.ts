"use client";
import { create } from "zustand";
import type { DentalPlan, Procedure, Schedule, Scenario } from "@/lib/schemas";
import { dentalPlanSchema, procedureSchema, dateSchema, scenarioSchema } from "@/lib/schemas";
import {
  calculateClaims,
  type ClaimsCalculation,
} from "@/lib/insurance/claims";
import {
  optimizeSchedule,
  type OptimizationResult,
} from "@/lib/optimization/optimizer";
import { evaluateSchedule } from "@/lib/optimization/feasibility";

export interface SimulatorInput {
  plan?: DentalPlan;
  procedures?: Procedure[];
  originalSchedule?: Schedule;
}

interface SimulatorState {
  plan: DentalPlan;
  procedures: Procedure[];
  ready: boolean;
  hasPlan: boolean;
  initialData: SimulatorInput;
  validationError?: string;
  originalSchedule: Schedule;
  currentSchedule: Schedule;
  optimizedSchedule?: Schedule;
  calculation: ClaimsCalculation;
  optimization?: OptimizationResult;
  setDate: (procedureId: string, date: string) => void;
  updatePlan: (changes: Partial<DentalPlan>) => void;
  updateProcedure: (procedureId: string, changes: Partial<Procedure>) => void;
  addProcedure: (procedure: Procedure) => void;
  applyOptimized: () => void;
  optimize: () => void;
  reset: () => void;
  initialize: (input: SimulatorInput) => void;
  restoreScenario: (scenario: Scenario) => void;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "00000000-0000-4000-8000-000000000001";
}

function createBlankPlan(): DentalPlan {
  return {
    id: newId(),
    name: "Your dental plan",
    planType: "PPO",
    benefitYearStartMonth: 1,
    benefitYearStartDay: 1,
    usageAsOfDate: new Date().toISOString().slice(0, 10),
    annualMaximumCents: 0,
    alreadyUsedMaximumCents: 0,
    individualDeductibleCents: 0,
    alreadyUsedDeductibleCents: 0,
    deductibleAppliesTo: { preventive: false, basic: false, major: false },
    coverageByClass: { preventive: 0, basic: 0, major: 0 },
    networkRules: {
      outOfNetworkBalanceBilling: false,
      allowedAmountPolicy: "explicit",
    },
    preventiveCountsTowardMax: false,
    isConfirmed: false,
    fieldProvenance: {},
    unknownFields: [],
  };
}

function scheduleFromProcedures(procedures: Procedure[]): Schedule {
  return Object.fromEntries(
    procedures.map((procedure) => [
      procedure.id,
      procedure.fixedDate ?? procedure.earliestDate,
    ]),
  );
}

function workspaceFrom(input: SimulatorInput) {
  const plan = input.plan ?? createBlankPlan();
  const procedures = input.procedures ?? [];
  const originalSchedule = input.originalSchedule ?? scheduleFromProcedures(procedures);
  return {
    plan,
    procedures,
    originalSchedule,
    currentSchedule: originalSchedule,
    calculation: calculateClaims({ plan, procedures, schedule: originalSchedule }),
    optimizedSchedule: undefined,
    optimization: undefined,
    validationError: undefined,
    ready: true,
    hasPlan: Boolean(input.plan),
    initialData: input,
  };
}

const blankWorkspace = workspaceFrom({});
const calculate = (
  plan: DentalPlan,
  procedures: Procedure[],
  schedule: Schedule,
) => calculateClaims({ plan, procedures, schedule });
export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  ...blankWorkspace,
  ready: false,
  initialize: (input) => set(workspaceFrom(input)),
  setDate: (procedureId, date) =>
    set((state) => {
      if (!dateSchema.safeParse(date).success)
        return { validationError: "Choose a valid service date." };
      const schedule = { ...state.currentSchedule, [procedureId]: date };
      const result = evaluateSchedule(state.procedures, schedule);
      if (!result.feasible)
        return { validationError: result.reasons.join(" ") };
      return {
        currentSchedule: schedule,
        calculation: calculate(state.plan, state.procedures, schedule),
        optimizedSchedule: undefined,
        optimization: undefined,
        validationError: undefined,
      };
    }),
  updatePlan: (changes) =>
    set((state) => {
      const parsed = dentalPlanSchema.safeParse({ ...state.plan, ...changes });
      if (!parsed.success)
        return {
          validationError:
            parsed.error.issues[0]?.message ?? "Check the plan details.",
        };
      return {
        plan: parsed.data,
        hasPlan: true,
        calculation: calculate(
          parsed.data,
          state.procedures,
          state.currentSchedule,
        ),
        optimization: undefined,
        optimizedSchedule: undefined,
        validationError: undefined,
      };
    }),
  updateProcedure: (procedureId, changes) =>
    set((state) => {
      const procedures = state.procedures.map((procedure) =>
        procedure.id === procedureId ? { ...procedure, ...changes } : procedure,
      );
      const changed = procedures.find(
        (procedure) => procedure.id === procedureId,
      );
      const parsed = changed && procedureSchema.safeParse(changed);
      if (!parsed || !parsed.success)
        return {
          validationError:
            parsed?.error.issues[0]?.message ?? "Check the procedure details.",
        };
      return {
        procedures,
        calculation: calculate(state.plan, procedures, state.currentSchedule),
        optimization: undefined,
        optimizedSchedule: undefined,
        validationError: undefined,
      };
    }),
  addProcedure: (procedure) =>
    set((state) => {
      const parsed = procedureSchema.safeParse(procedure);
      if (!parsed.success)
        return {
          validationError:
            parsed.error.issues[0]?.message ?? "Check the procedure details.",
        };
      const procedures = [...state.procedures, parsed.data];
      const date = parsed.data.fixedDate ?? parsed.data.earliestDate;
      const originalSchedule = { ...state.originalSchedule, [parsed.data.id]: date };
      const currentSchedule = { ...state.currentSchedule, [parsed.data.id]: date };
      return {
        procedures,
        originalSchedule,
        currentSchedule,
        calculation: calculate(state.plan, procedures, currentSchedule),
        optimization: undefined,
        optimizedSchedule: undefined,
        validationError: undefined,
      };
    }),
  applyOptimized: () => {
    const schedule = get().optimizedSchedule;
    if (schedule)
      set({
        currentSchedule: schedule,
        calculation: calculate(get().plan, get().procedures, schedule),
        validationError: undefined,
      });
  },
  optimize: () => {
    const state = get();
    const result = optimizeSchedule(
      state.plan,
      state.procedures,
      state.currentSchedule,
    );
    set({ optimization: result, optimizedSchedule: result.optimized.schedule });
  },
  reset: () =>
    set(workspaceFrom(get().initialData)),
  restoreScenario: (scenario) =>
    set((state) => {
      const parsed = scenarioSchema.safeParse(scenario);
      if (!parsed.success)
        return { validationError: "This saved scenario is no longer valid." };
      const value = parsed.data;
      const feasible = evaluateSchedule(value.procedureSnapshots, value.currentSchedule);
      if (!feasible.feasible)
        return { validationError: feasible.reasons.join(" ") };
      return {
        ...state,
        ready: true,
        hasPlan: true,
        plan: value.planSnapshot,
        procedures: value.procedureSnapshots,
        originalSchedule: value.originalSchedule,
        currentSchedule: value.currentSchedule,
        optimizedSchedule: value.optimizedSchedule,
        optimization: undefined,
        calculation: calculate(value.planSnapshot, value.procedureSnapshots, value.currentSchedule),
        validationError: undefined,
      };
    }),
}));
