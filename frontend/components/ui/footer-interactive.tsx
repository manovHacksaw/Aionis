"use client";

export function SubscribeForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative mt-5 border-b border-zinc-300 pb-3"
    >
      <input
        type="email"
        placeholder="Your email here"
        className="w-full bg-transparent pr-10 text-[14px] text-zinc-700 placeholder:text-zinc-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-700 transition-colors hover:text-black"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 10h13M11 5l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-transform hover:-translate-y-0.5"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 14V4M4 9l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
