"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getHello } from "@/lib/api";

const features = [
  {
    title: "Fast by default",
    description:
      "Server-rendered pages and streaming responses keep the first paint quick, even on slow connections.",
  },
  {
    title: "Built to scale",
    description:
      "A typed API layer and a component library that stay predictable as the product grows.",
  },
  {
    title: "Simple to run",
    description:
      "One command to develop, one to build, and sensible defaults everywhere in between.",
  },
];

export default function Home() {
  const [hello, setHello] = useState(null);
  useEffect(() => {
    getHello().then((res) => setHello(res))
  }, []);

  return (
    <>
      <header className="w-full border-b border-black/[.08] dark:border-white/[.12]">
        <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Northbound
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="#features"
              className="hidden text-zinc-600 transition-colors hover:text-foreground sm:block dark:text-zinc-400"
            >
              Features
            </a>
            <a
              href="#contact"
              className="rounded-full bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Now in early access
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Ship your product without the busywork.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Northbound gives your team a single place to plan, build, and
            release — so you spend your time on the work that actually moves the
            product forward. {hello}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contact"
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started free
            </a>
            <a
              href="#features"
              className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 text-base font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.14] dark:hover:bg-white/[.06]"
            >
              See how it works
            </a>
          </div>
        </section>

        <section
          id="features"
          className="border-t border-black/[.08] dark:border-white/[.12]"
        >
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-20 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <h2 className="text-base font-semibold tracking-tight">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="border-t border-black/[.08] dark:border-white/[.12]"
        >
          <div className="mx-auto w-full max-w-5xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight">
              Want early access?
            </h2>
            <p className="mt-3 max-w-lg text-zinc-600 dark:text-zinc-400">
              Leave your email and we&apos;ll be in touch when your workspace is
              ready.
            </p>
            <form className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="h-12 flex-1 rounded-full border border-black/[.12] bg-transparent px-5 text-base outline-none placeholder:text-zinc-400 focus:border-foreground dark:border-white/[.18]"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90"
              >
                Request access
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[.08] dark:border-white/[.12]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
          <p>© 2026 Northbound. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
