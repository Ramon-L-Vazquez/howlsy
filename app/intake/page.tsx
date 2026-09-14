"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HowlsyLogo } from "@/components/brand/howlsy-logo";
import { saveProject } from "@/lib/project-store";
import type { HowlsyProject } from "@/types/project";

const questions = [
  {
    id: "context",
    question: "Tell Howlsy a little more about what you want to accomplish.",
    placeholder:
      "Add measurements, symptoms, location, constraints, or anything else Howlsy should know...",
  },
  {
    id: "experience",
    question: "How much experience do you have with this type of task?",
    placeholder:
      "For example: none, beginner, some experience, or very experienced...",
  },
  {
    id: "constraints",
    question: "Are there any limits Howlsy should work around?",
    placeholder:
      "For example: budget, tools you do not have, time limits, safety concerns, or materials you already own...",
  },
];

function IntakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialGoal = searchParams.get("goal") ?? "";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const question = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  function updateAnswer(value: string) {
    setAnswers((previousAnswers) => {
      const updatedAnswers = [...previousAnswers];
      updatedAnswers[currentQuestion] = value;
      return updatedAnswers;
    });
  }

  function handleContinue() {
    if (!currentAnswer.trim()) {
      return;
    }

    const isLastQuestion =
      currentQuestion === questions.length - 1;

    if (isLastQuestion) {
      setGenerationError(null);
      setIsComplete(true);
      return;
    }

    setCurrentQuestion(
      (previousQuestion) => previousQuestion + 1
    );
  }

  function handleBack() {
    if (currentQuestion === 0) {
      return;
    }

    setCurrentQuestion(
      (previousQuestion) => previousQuestion - 1
    );
  }

  function handleEditAnswers() {
    setGenerationError(null);
    setCurrentQuestion(0);
    setIsComplete(false);
  }

  async function handleBuildPlan() {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal: initialGoal,
          context: answers[0],
          experience: answers[1],
          constraints: answers[2],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Howlsy is temporarily unable to generate a plan because the AI service limit has been reached. Please try again shortly."
          );
        }

        if (response.status === 401) {
          throw new Error(
            "Howlsy could not connect to the AI service. Please check the server configuration and try again."
          );
        }

        throw new Error(
          "Howlsy could not build your project plan. Please try again."
        );
      }

      const project = (await response.json()) as HowlsyProject;

      saveProject(project);

      router.push("/project");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while Howlsy was building your plan.";

      setGenerationError(message);
      setIsGenerating(false);
    }
  }

  if (isComplete) {
    return (
      <main className="howlsy-background min-h-screen text-[var(--foreground)]">
        <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-16 sm:px-8">
          <HowlsyLogo
            markClassName="h-11 w-11"
            showTagline
          />

          <div className="mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Project intake complete
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Ready to build your plan.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-muted)] sm:text-lg">
              Review what Howlsy knows before the AI turns it into a structured,
              step-by-step project.
            </p>
          </div>

          <div className="howlsy-surface mt-10 rounded-[var(--radius-large)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
              Your goal
            </p>

            <p className="mt-3 text-xl font-semibold">
              {initialGoal || "No goal provided"}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {questions.map((item, index) => (
              <div
                key={item.id}
                className="howlsy-surface rounded-[var(--radius-large)] p-6"
              >
                <p className="text-sm font-medium text-[var(--foreground-muted)]">
                  {item.question}
                </p>

                <p className="mt-3 leading-7 text-[var(--foreground)]">
                  {answers[index]}
                </p>
              </div>
            ))}
          </div>

          {generationError && (
            <div
              role="alert"
              className="mt-6 rounded-[var(--radius-medium)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-5 py-4"
            >
              <p className="font-semibold text-[var(--danger)]">
                Howlsy couldn&apos;t build the plan.
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {generationError}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleEditAnswers}
              disabled={isGenerating}
              className="howlsy-interactive rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 font-semibold text-[var(--foreground-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Edit answers
            </button>

            <button
              type="button"
              onClick={handleBuildPlan}
              disabled={isGenerating}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-bright)] disabled:cursor-wait disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-foreground)]/30 border-t-[var(--accent-foreground)]"
                  />
                  Howlsy is building your plan...
                </>
              ) : generationError ? (
                <>
                  Try again
                  <span aria-hidden="true">↻</span>
                </>
              ) : (
                <>
                  Build my plan
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>

          {isGenerating && (
            <p
              aria-live="polite"
              className="mt-4 text-center text-sm text-[var(--foreground-subtle)]"
            >
              Howlsy is organizing the steps, tools, materials, safety notes,
              time, and cost for your project.
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="howlsy-background min-h-screen text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-16 sm:px-8">
        <HowlsyLogo
          markClassName="h-11 w-11"
          showTagline
        />

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-[var(--foreground-muted)]">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <p className="text-sm text-[var(--foreground-subtle)]">
              {Math.round(
                ((currentQuestion + 1) / questions.length) * 100
              )}
              %
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-interactive)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) / questions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="howlsy-surface mt-8 rounded-[var(--radius-large)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
            Your goal
          </p>

          <p className="mt-3 text-xl font-semibold">
            {initialGoal || "No goal provided"}
          </p>
        </div>

        <div className="mt-10">
          <h1 className="max-w-3xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
            {question.question}
          </h1>

          <textarea
            value={currentAnswer}
            onChange={(event) =>
              updateAnswer(event.target.value)
            }
            className="howlsy-surface mt-6 min-h-44 w-full resize-none rounded-[var(--radius-large)] px-5 py-4 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--accent)] sm:px-6"
            placeholder={question.placeholder}
            autoFocus
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="howlsy-interactive rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 font-semibold text-[var(--foreground-muted)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!currentAnswer.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {currentQuestion === questions.length - 1
              ? "Review answers"
              : "Continue"}

            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </main>
  );
}

function IntakeLoading() {
  return (
    <main className="howlsy-background flex min-h-screen items-center justify-center text-[var(--foreground)]">
      <div className="text-center">
        <HowlsyLogo
          markClassName="mx-auto h-12 w-12"
          className="justify-center"
        />

        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
          Loading intake...
        </p>
      </div>
    </main>
  );
}

export default function IntakePage() {
  return (
    <Suspense fallback={<IntakeLoading />}>
      <IntakeContent />
    </Suspense>
  );
}