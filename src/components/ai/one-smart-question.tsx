"use client";

import { useState } from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SmartQuestion } from "@/lib/schemas";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function OneSmartQuestion({
  question,
  onAnswer,
}: {
  question?: SmartQuestion;
  onAnswer: (value: number) => void;
}) {
  const [answered, setAnswered] = useState(false);
  if (!question) return null;
  const isPercentage = question.field.includes("coverageByClass");
  return (
    <Card className="border-primary/30 bg-secondary/25 p-5">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
        <Sparkles size={13} /> One smart question
      </p>
      <h2 className="mt-3 font-serif text-xl">{question.question}</h2>
      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{question.why}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {question.plausibleValues.map((value) => (
          <Button
            key={value}
            type="button"
            variant={value === question.currentValue ? "default" : "outline"}
            onClick={() => {
              onAnswer(value);
              setAnswered(true);
            }}
          >
            {isPercentage ? `${value}%` : money(value)}
            {value === question.currentValue ? " · current" : ""}
          </Button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <HelpCircle size={12} />
        {answered
          ? "Confirmed. The engine recalculated with your answer."
          : question.recommendedScheduleChanges
            ? `This answer can change the recommended dates (worst-case regret ${money(question.worstCaseRegretCents)}).`
            : `This answer changes the estimate by up to ${money(question.sensitivityCents)} under the checked schedules.`}
      </p>
    </Card>
  );
}

