export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          Howlsy
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Don&apos;t know how?
          <span className="block text-cyan-400">Easy.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Tell Howlsy what you want to do, and get guided through it step by
          step.
        </p>
      </div>
    </main>
  );
}