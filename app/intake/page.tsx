"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

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

export default function IntakePage() {
  const searchParams = useSearchParams();
  const initialGoal = searchParams.get("goal") ?? "";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );
  const [isComplete, setIsComplete] = useState(false);

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

    const isLastQuestion = currentQuestion === questions.length - 1;

    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setCurrentQuestion((previousQuestion) => previousQuestion + 1);
  }

  function handleBack() {
    if (currentQuestion === 0) {
      return;
    }

    setCurrentQuestion((previousQuestion) => previousQuestion - 1);
  }

  function handleEditAnswers() {
    setCurrentQuestion(0);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Howlsy
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to build your plan.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Here&apos;s what Howlsy knows so far.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-medium text-slate-400">Your goal</p>

            <p className="mt-2 text-xl font-semibold">
              {initialGoal || "No goal provided"}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <p className="text-sm font-medium text-slate-400">
                  {item.question}
                </p>

                <p className="mt-3 leading-7 text-slate-100">
                  {answers[index]}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleEditAnswers}
              className="rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Edit answers
            </button>

            <button
              type="button"
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Build my plan
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          Howlsy
        </p>

        <div className="mb-8">
          <p className="text-sm font-medium text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-medium text-slate-400">Your goal</p>

          <p className="mt-2 text-xl font-semibold text-white">
            {initialGoal || "No goal provided"}
          </p>
        </div>

        <div className="mt-10">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
            {question.question}
          </h1>

          <textarea
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            className="mt-6 min-h-44 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            placeholder={question.placeholder}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="rounded-2xl border border-slate-700 px-6 py-4 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!currentAnswer.trim()}
            className="flex-1 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentQuestion === questions.length - 1
              ? "Review answers"
              : "Continue"}
          </button>
        </div>
      </section>
    </main>
  );
}