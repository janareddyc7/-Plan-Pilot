"use client";
import { create } from "zustand";
import type { DentalPlan, Procedure, Schedule } from "@/lib/schemas";
import { dentalPlanSchema, procedureSchema, dateSchema } from "@/lib/schemas";
import { devFixture } from "@/lib/demo/dev-fixture";
import {
  calculateClaims,
  type ClaimsCalculation,
} from "@/lib/insurance/claims";
import {
  optimizeSchedule,
  type OptimizationResult,
} from "@/lib/optimization/optimizer";
import { evaluateSchedule } from "@/lib/optimization/feasibility";

interface SimulatorState {
  plan: DentalPlan;
  procedures: Procedure[];
  validationError?: string;
  originalSchedule: Schedule;
  currentSchedule: Schedule;
  optimizedSchedule?: Schedule;
  calculation: ClaimsCalculation;
  optimization?: OptimizationResult;
  setDate: (procedureId: string, date: string) => void;
  updatePlan: (changes: Partial<DentalPlan>) => void;
  updateProcedure: (procedureId: string, changes: Partial<Procedure>) => void;
  applyOptimized: () => void;
  optimize: () => void;
  reset: () => void;
}
const calculate = (
  plan: DentalPlan,
  procedures: Procedure[],
  schedule: Schedule,
) => calculateClaims({ plan, procedures, schedule });
export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  plan: devFixture.plan,
  procedures: devFixture.procedures,
  originalSchedule: devFixture.originalSchedule,
  currentSchedule: devFixture.originalSchedule,
  calculation: calculate(
    devFixture.plan,
    devFixture.procedures,
    devFixture.originalSchedule,
  ),
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
    set({
      plan: devFixture.plan,
      procedures: devFixture.procedures,
      currentSchedule: devFixture.originalSchedule,
      calculation: calculate(
        devFixture.plan,
        devFixture.procedures,
        devFixture.originalSchedule,
      ),
      optimizedSchedule: undefined,
      optimization: undefined,
      validationError: undefined,
    }),
}));
