import Image from "next/image";
import { Hash, Receipt, Wallet, Zap, RefreshCcw, Scale, CircleSlash, Hourglass, Flame, Coins, Timer } from "lucide-react";
import { AionisLoader } from "@/components/ui/aionis-loader";
import { AionisLogo } from "@/components/ui/aionis-logo";
import { Card, CardContent } from "@/components/ui/card";
import { CTAMarqueeSection } from "@/components/ui/cta-marquee";
import { FAQItem } from "@/components/ui/faq-item";
import { Reveal } from "@/components/ui/reveal";
import { SqueezeOnScroll } from "@/components/ui/squeeze-on-scroll";
import { AionisStack } from "@/components/ui/aionis-stack";
import { ProfitCalculator } from "@/components/ui/profit-calculator";
import PixelBlast from "@/components/ui/pixel-blast";
import { SubscribeForm, ScrollToTopButton } from "@/components/ui/footer-interactive";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col bg-[#f6f3ea] text-black">
      <AionisLoader />

      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <PixelBlast
          variant="square"
          pixelSize={6}
          color="#FDBA74"
          patternScale={4}
          patternDensity={0.4}
          pixelSizeJitter={0.4}
          enableRipples={false}
          liquid={false}
          speed={0.6}
          edgeFade={0}
          transparent
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
      <SqueezeOnScroll>
        <HeroSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <WhyAgentsBurnCapitalSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <ValueSitsIdleSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <WhatIsAionisSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <WhySolanaSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <SetYourLimitsSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <FAQSection />
      </SqueezeOnScroll>

      <SqueezeOnScroll>
        <CTAMarqueeSection />
      </SqueezeOnScroll>

      <SiteFooter />
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <main className="relative flex flex-col px-6 pb-20 font-mono sm:px-12 sm:pb-24">
        <Navbar />

        <Reveal className="relative z-10 mt-2" fromX={-50} fromY={20} scale={1} delay={0.15} duration={0.95} amount={0.1} once>
          <h1 className="mt-6 max-w-[16ch] font-medium leading-[1.05] tracking-tight text-black text-[clamp(2rem,4.75vw,4.25rem)]">
            Stop wasting compute.
            <br />
            Start earning from it.
          </h1>
        </Reveal>

        <Reveal className="relative z-10 self-end" fromX={50} fromY={20} scale={1} delay={0.35} duration={0.95} amount={0.1} once>
          <div className="mt-4 text-right font-medium leading-[1.05] tracking-tight text-black text-[clamp(1.25rem,3vw,2.5rem)] sm:mt-6">
            <p>Agents that think in profit</p>
            <div className="mt-2 flex items-center justify-end gap-0 sm:gap-0.5">
              <span>build on Solana</span>
              <Image
                src="/solana-logoo.png"
                alt="Solana"
                width={398}
                height={321}
                className="h-[1.8em] w-auto"
                priority
              />
            </div>
          </div>
        </Reveal>

        <Reveal className="relative z-10" fromY={40} scale={1} delay={0.55} duration={0.9} amount={0.1} once>
          <div className="mt-4 grid items-end gap-6 sm:mt-6 sm:grid-cols-2 sm:gap-8">
            <p className="max-w-md text-[13px] leading-relaxed text-zinc-600">
              Aionis agents evaluate every action before execution—ensuring expected value exceeds cost. No blind spending, no redundant compute, just intelligent, profitable decisions.
            </p>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <a
                href="#demo"
                className="inline-flex items-center rounded-full bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
              >
                Get Started
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2.5 h-3.5 w-3.5">
                  <path d="M3.64645 11.3536C3.45118 11.5488 3.45118 11.8654 3.64645 12.0607C3.84171 12.2559 4.15829 12.2559 4.35355 12.0607L3.64645 11.3536ZM11.5 4C11.5 3.72386 11.2761 3.5 11 3.5L6.5 3.5C6.22386 3.5 6 3.72386 6 4C6 4.27614 6.22386 4.5 6.5 4.5L10.5 4.5L10.5 8.5C10.5 8.77614 10.7239 9 11 9C11.2761 9 11.5 8.77614 11.5 8.5L11.5 4ZM4.35355 12.0607L11.3536 5.06066L10.6464 4.35355L3.64645 11.3536L4.35355 12.0607Z" fill="currentColor"/>
                </svg>
              </a>
              <a
                href="#learn"
                className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Learn more
              </a>
            </div>
          </div>
        </Reveal>
    </main>
  );
}

function WhyAgentsBurnCapitalSection() {
  return (
    <section className="relative font-mono">
      <div className="px-6 pb-10 pt-20 sm:px-12 sm:pb-12 sm:pt-28">
        <div className="grid items-end gap-8 sm:grid-cols-12 sm:gap-12">
          <Reveal className="sm:col-span-7" fromY={30} duration={0.9} once>
            <h2 className="max-w-[24ch] font-medium leading-[1.05] tracking-tight text-[clamp(2rem,4.6vw,3.75rem)]">
              <span className="text-zinc-400">Why most AI agents </span>
              <span className="text-black">burn capital today.</span>
            </h2>
          </Reveal>
          <Reveal
            className="sm:col-span-5 sm:pb-3"
            fromY={30}
            delay={0.15}
            duration={0.9}
            once
          >
            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600 sm:text-[15px]">
              Today&apos;s autonomous agents recompute identical work, accept loss-making tasks, throw away their outputs, stall on human approvals, and let stablecoin reserves sit idle — bleeding capital with every loop.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative px-3 pb-20 pt-6 sm:px-12 sm:pb-24">
        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          <div className="relative">
            <div className="relative z-10 grid grid-cols-6 gap-3">
              <Card className="relative col-span-full flex overflow-hidden lg:col-span-2">
                <CardContent className="relative m-auto size-fit pt-6">
                  <div className="relative flex h-24 w-56 items-center justify-center">
                    <RefreshCcw className="absolute inset-0 m-auto size-24 text-zinc-200" strokeWidth={1} />
                    <span className="relative z-10 mx-auto block w-fit text-5xl font-semibold text-zinc-900">12&times;</span>
                  </div>
                  <h2 className="mt-6 text-center text-2xl font-semibold text-zinc-900">Same query, recomputed</h2>
                </CardContent>
              </Card>

              <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                    <div className="m-auto flex size-full items-center justify-center relative">
                      <Scale className="absolute m-auto size-16 text-zinc-200" strokeWidth={1} />
                      <div className="absolute bottom-6 left-5 flex size-8 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500 shadow-sm z-10">
                        <Flame className="size-4" strokeWidth={2} />
                      </div>
                      <div className="absolute right-5 top-7 flex size-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-400 shadow-sm z-10">
                        <CircleSlash className="size-4" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-6 space-y-2 text-center">
                    <h2 className="text-lg font-medium text-zinc-900">Profit is never checked</h2>
                    <p className="text-zinc-600">Agents spend tokens and API credits without ever asking whether the cost of the task exceeds its expected reward.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="pt-6 lg:px-6">
                    <div className="relative flex h-32 items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 sm:px-6 shadow-sm overflow-hidden">
                      <div className="absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 bg-zinc-100"></div>
                      <div className="absolute left-8 top-1/2 h-0.5 -translate-y-1/2 bg-orange-400" style={{ width: '45%' }}></div>
                      
                      <div className="relative z-10 flex flex-col items-center gap-2 bg-white py-2 ring-8 ring-white">
                        <div className="flex size-8 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md">
                          <Zap className="size-4" fill="currentColor" strokeWidth={0} />
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col items-center gap-2 bg-white py-2 ring-8 ring-white">
                        <div className="flex size-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-50 text-orange-600 shadow-sm relative overflow-hidden">
                          <Hourglass className="size-5" />
                        </div>
                        <span className="absolute -bottom-6 text-[9px] font-bold uppercase tracking-wider text-orange-600">Pending</span>
                      </div>

                      <div className="relative z-10 flex flex-col items-center gap-2 bg-white py-2 ring-8 ring-white">
                        <div className="flex size-8 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-50 text-zinc-400">
                          <span className="text-xs font-bold">$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-10 space-y-2 text-center">
                    <h2 className="text-lg font-medium text-zinc-900">Stuck on human approvals</h2>
                    <p className="text-zinc-600">Every transfer routes through a human reviewer — turning a millisecond decision into a multi-hour delay.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                <CardContent className="grid pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                      <Receipt className="m-auto size-5 text-zinc-700" strokeWidth={1.4} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium text-zinc-900">Subscription APIs punish machines</h2>
                      <p className="text-zinc-600">An agent may need a single $0.02 data point — but is forced into a $20/month plan instead of paying per request.</p>
                    </div>
                  </div>
                  <div className="relative -mb-6 -mr-6 mt-6 h-fit rounded-tl-lg border-l border-t border-zinc-200 p-6 py-6 sm:ml-6">
                    <div className="absolute left-3 top-2 flex gap-1">
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                    </div>
                    <svg className="w-full sm:w-[150%]" viewBox="0 0 366 231" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.148438 231V179.394L1.92188 180.322L2.94482 177.73L4.05663 183.933L6.77197 178.991L7.42505 184.284L9.42944 187.985L11.1128 191.306V155.455L13.6438 153.03V145.122L14.2197 142.829V150.454V154.842L15.5923 160.829L17.0793 172.215H19.2031V158.182L20.7441 153.03L22.426 148.111V142.407L24.7471 146.86V128.414L26.7725 129.918V120.916L28.1492 118.521L28.4653 127.438L29.1801 123.822L31.0426 120.525V130.26L32.3559 134.71L34.406 145.122V137.548L35.8982 130.26L37.1871 126.049L38.6578 134.71L40.659 138.977V130.26V126.049L43.7557 130.26V123.822L45.972 112.407L47.3391 103.407V92.4726L49.2133 98.4651V106.053L52.5797 89.7556L54.4559 82.7747L56.1181 87.9656L58.9383 89.7556V98.4651L60.7617 103.407L62.0545 123.822L63.8789 118.066L65.631 122.082L68.5479 114.229L70.299 109.729L71.8899 118.066L73.5785 123.822V130.26L74.9446 134.861L76.9243 127.87L78.352 134.71V138.977L80.0787 142.407V152.613L83.0415 142.407V130.26L86.791 123.822L89.0121 116.645V122.082L90.6059 127.87L92.3541 131.77L93.7104 123.822L95.4635 118.066L96.7553 122.082V137.548L99.7094 140.988V131.77L101.711 120.525L103.036 116.645V133.348L104.893 136.218L106.951 140.988L108.933 134.71L110.797 130.26L112.856 140.988V148.111L115.711 152.613L117.941 145.122L119.999 140.988V148.111L123.4 152.613L125.401 158.182L130.547 150.454V156.566L131.578 155.455L134.143 158.182L135.594 168.136L138.329 158.182L140.612 160.829L144.681 169.5L147.011 155.455L148.478 151.787L151.02 152.613L154.886 145.122L158 143.412L159.406 140.637L159.496 133.348L162.295 127.87V122.082L163.855 116.645V109.729L164.83 104.407L166.894 109.729L176.249 98.4651L178.254 106.169L180.77 98.4651V81.045L182.906 69.1641L184.8 56.8669L186.477 62.8428L187.848 79.7483L188.849 106.169L191.351 79.7483L193.485 75.645V98.4651L196.622 94.4523L198.623 87.4228V79.7483L200.717 75.645L202.276 81.045V89.3966L203.638 113.023L205.334 99.8037L207.164 94.4523L208.982 98.4651V102.176L211.267 107.64L212.788 81.045L214.437 66.0083L216.19 62.8428L217.941 56.8669V73.676V79.7483L220.28 75.645L222.516 66.0083V73.676H226.174V84.8662L228.566 98.4651L230.316 75.645L233.61 94.4523V104.25L236.882 102.176L239.543 113.023L241.057 98.4651L243.604 94.4523L244.975 106.169L245.975 87.4228L247.272 89.3966L250.732 84.8662L251.733 96.7549L254.644 94.4523L257.452 99.8037L259.853 91.3111L261.193 84.8662L264.162 75.645L265.808 87.4228L267.247 58.4895L269.757 66.0083L276.625 13.5146L273.33 58.4895L276.25 67.6563L282.377 20.1968L281.37 58.4895V66.0083L283.579 75.645L286.033 56.8669L287.436 73.676L290.628 77.6636L292.414 84.8662L294.214 61.3904L296.215 18.9623L300.826 0.947876L297.531 56.8669L299.973 62.8428L305.548 22.0598L299.755 114.956L301.907 105.378L304.192 112.688V94.9932L308.009 80.0829L310.003 94.9932L311.004 102.127L312.386 105.378L315.007 112.688L316.853 98.004L318.895 105.378L321.257 94.9932L324.349 100.81L325.032 80.0829L327.604 61.5733L329.308 82.3223L333.525 52.7986L334.097 52.145L334.735 55.6812L337.369 59.8108V73.676L340.743 87.9656L343.843 96.3728L348.594 82.7747L349.607 81.045L351 89.7556L352.611 96.3728L355.149 94.9932L356.688 102.176L359.396 108.784L360.684 111.757L365 95.7607V231H148.478H0.148438Z"
                        fill="url(#paint0_linear_discard_chart)"
                      />
                      <path
                        className="text-orange-500"
                        d="M1 179.796L4.05663 172.195V183.933L7.20122 174.398L8.45592 183.933L10.0546 186.948V155.455L12.6353 152.613V145.122L15.3021 134.71V149.804V155.455L16.6916 160.829L18.1222 172.195V158.182L19.8001 152.613L21.4105 148.111V137.548L23.6863 142.407V126.049L25.7658 127.87V120.525L27.2755 118.066L29.1801 112.407V123.822L31.0426 120.525V130.26L32.3559 134.71L34.406 145.122V137.548L35.8982 130.26L37.1871 126.049L38.6578 134.71L40.659 138.977V130.26V126.049L43.7557 130.26V123.822L45.972 112.407L47.3391 103.407V92.4726L49.2133 98.4651V106.053L52.5797 89.7556L54.4559 82.7747L56.1181 87.9656L58.9383 89.7556V98.4651L60.7617 103.407L62.0545 123.822L63.8789 118.066L65.631 122.082L68.5479 114.229L70.299 109.729L71.8899 118.066L73.5785 123.822V130.26L74.9446 134.861L76.9243 127.87L78.352 134.71V138.977L80.0787 142.407V152.613L83.0415 142.407V130.26L86.791 123.822L89.0121 116.645V122.082L90.6059 127.87L92.3541 131.77L93.7104 123.822L95.4635 118.066L96.7553 122.082V137.548L99.7094 140.988V131.77L101.711 120.525L103.036 116.645V133.348L104.893 136.218L106.951 140.988L108.933 134.71L110.797 130.26L112.856 140.988V148.111L115.711 152.613L117.941 145.122L119.999 140.988L121.501 148.111L123.4 152.613L125.401 158.182L127.992 152.613L131.578 146.76V155.455L134.143 158.182L135.818 164.629L138.329 158.182L140.612 160.829L144.117 166.757L146.118 155.455L147.823 149.804L151.02 152.613L154.886 145.122L158.496 140.988V133.348L161.295 127.87V122.082L162.855 116.645V109.729L164.83 103.407L166.894 109.729L176.249 98.4651L178.254 106.169L180.77 98.4651V81.045L182.906 69.1641L184.8 56.8669L186.477 62.8428L187.848 79.7483L188.849 106.169L191.351 79.7483L193.485 75.645V98.4651L196.622 94.4523L198.623 87.4228V79.7483L200.717 75.645L202.276 81.045V89.3966L203.638 113.023L205.334 99.8037L207.164 94.4523L208.982 98.4651V102.176L211.267 107.64L212.788 81.045L214.437 66.0083L216.19 62.8428L217.941 56.8669V73.676V79.7483L220.28 75.645L222.516 66.0083V73.676H226.174V84.8662L228.566 98.4651L230.316 75.645L233.61 94.4523V104.25L236.882 102.176L239.543 113.023L241.057 98.4651L243.604 94.4523L244.975 106.169L245.975 87.4228L247.272 89.3966L250.732 84.8662L251.733 96.7549L254.644 94.4523L257.452 99.8037L259.853 91.3111L261.193 84.8662L264.162 75.645L265.808 87.4228L267.247 58.4895L269.757 66.0083L276.625 13.5146L273.33 58.4895L276.25 67.6563L282.377 20.1968L281.37 58.4895V66.0083L283.579 75.645L286.033 56.8669L287.436 73.676L290.628 77.6636L292.414 84.8662L294.214 61.3904L296.215 18.9623L300.826 0.947876L297.531 56.8669L299.973 62.8428L305.548 22.0598L299.755 114.956L301.907 105.378L304.192 112.688V94.9932L308.009 80.0829L310.003 94.9932L311.004 102.127L312.386 105.378L315.007 112.688L316.853 98.004L318.895 105.378L321.257 94.9932L324.349 100.81L325.032 80.0829L327.604 61.5733L329.357 74.9864L332.611 52.6565L334.352 48.5552L335.785 55.2637L338.377 59.5888V73.426L341.699 87.5181L343.843 93.4347L347.714 82.1171L350.229 78.6821L351.974 89.7556L353.323 94.9932L355.821 93.4347L357.799 102.127L360.684 108.794L363.219 98.004L365 89.7556"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <defs>
                        <linearGradient id="paint0_linear_discard_chart" x1="0.85108" y1="0.947876" x2="0.85108" y2="230.114" gradientUnits="userSpaceOnUse">
                          <stop className="text-orange-300/40" stopColor="currentColor" />
                          <stop className="text-transparent" offset="1" stopColor="currentColor" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                      <Zap className="m-auto size-5 text-zinc-700" strokeWidth={1.4} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium text-zinc-900">Inference cost compounds every loop</h2>
                      <p className="text-zinc-600">Each tool call, retry, and context refresh adds another inference bill — costs balloon long before any reward shows up.</p>
                    </div>
                  </div>
                  <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-zinc-200 sm:-my-6 sm:-mr-6">
                    <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Loop 01 · $0.04</span>
                        <div className="ring-4 ring-white size-7">
                          <div className="flex size-full items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">$</div>
                        </div>
                      </div>
                      <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                        <div className="ring-4 ring-white size-8">
                          <div className="flex size-full items-center justify-center rounded-full bg-orange-100 text-[12px] font-bold text-orange-700">$$</div>
                        </div>
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Loop 12 · $0.31</span>
                      </div>
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Loop 47 · $1.18</span>
                        <div className="ring-4 ring-white size-7">
                          <div className="flex size-full items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-700">$$$</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueSitsIdleSection() {
  return (
    <ProblemComparisonSection
      headingFaded="And the value they create"
      headingDark="sits idle."
      description="The few good outputs agents do produce are thrown away on arrival — and the stablecoins meant to fund their work sit dormant in wallets, earning nothing."
      left={{
        title: "Outputs discarded on arrival",
        description:
          "Once an agent generates a result, it is thrown away instead of being cached, reused, or resold to others who need the same information.",
        visual: <DiscardedOutputsMockup />,
      }}
      right={{
        title: "Stablecoins sitting dormant",
        description:
          "Billions in USDC and other stablecoins sit idle in wallets instead of being put to productive work by autonomous agents.",
        visual: <IdleWalletMockup />,
      }}
    />
  );
}

type ProblemColumn = {
  title: string;
  description: string;
  visual: React.ReactNode;
};

function ProblemComparisonSection({
  headingFaded,
  headingDark,
  description,
  left,
  right,
}: {
  headingFaded: string;
  headingDark: string;
  description: string;
  left: ProblemColumn;
  right: ProblemColumn;
}) {
  return (
    <section className="relative font-mono">
      <div className="px-6 pb-14 pt-20 sm:px-12 sm:pb-20 sm:pt-28">
        <div className="grid items-end gap-8 sm:grid-cols-12 sm:gap-12">
          <Reveal className="sm:col-span-7" fromY={30} duration={0.9} once>
            <h2 className="max-w-[28ch] font-medium leading-[1.05] tracking-tight text-[clamp(2rem,4.6vw,3.75rem)]">
              <span className="text-zinc-400">{headingFaded} </span>
              <span className="text-black">{headingDark}</span>
            </h2>
          </Reveal>
          <Reveal
            className="sm:col-span-5 sm:pb-3"
            fromY={30}
            delay={0.15}
            duration={0.9}
            once
          >
            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600 sm:text-[15px]">
              {description}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="grid border-y border-zinc-200 bg-white sm:grid-cols-2">
        <Reveal fromY={30} duration={0.9} once>
          <div className="flex h-full flex-col border-b border-zinc-200 px-6 pb-16 pt-14 sm:border-b-0 sm:border-r sm:px-10 sm:pb-20 sm:pt-16">
            <div className="text-center">
              <h3 className="text-[clamp(1.125rem,1.7vw,1.5rem)] font-medium text-zinc-900">
                {left.title}
              </h3>
              <p className="mx-auto mt-3 max-w-[42ch] text-[13px] leading-relaxed text-zinc-500 sm:text-[14px]">
                {left.description}
              </p>
            </div>
            {left.visual}
          </div>
        </Reveal>

        <Reveal fromY={30} delay={0.15} duration={0.9} once>
          <div className="flex h-full flex-col px-6 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-16">
            <div className="text-center">
              <h3 className="text-[clamp(1.125rem,1.7vw,1.5rem)] font-medium text-zinc-900">
                {right.title}
              </h3>
              <p className="mx-auto mt-3 max-w-[42ch] text-[13px] leading-relaxed text-zinc-500 sm:text-[14px]">
                {right.description}
              </p>
            </div>
            {right.visual}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DiscardedOutputsMockup() {
  const files = [
    { name: "market_analysis_v3.json", time: "13 min ago" },
    { name: "tx_summary_412.csv", time: "27 min ago" },
    { name: "yield_strategy.md", time: "41 min ago" },
  ];

  return (
    <div className="relative mx-auto mt-12 w-full max-w-[360px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Output pipeline
        </span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">
          1,247 today
        </span>
      </div>
      <div className="space-y-2.5">
        {files.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-[0_4px_12px_-10px_rgba(20,40,80,0.18)]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-50">
              <DocIcon className="h-3.5 w-3.5 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-semibold text-zinc-800">
                {f.name}
              </div>
              <div className="text-[9px] text-zinc-400">Generated · {f.time}</div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              → trash
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-900 px-3.5 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <TrashIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
            Discarded
          </span>
        </div>
        <span className="text-[12px] font-semibold">$8,920 in compute</span>
      </div>
    </div>
  );
}

function IdleWalletMockup() {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-[360px]">
      <div
        className="rounded-2xl p-[1.5px]"
        style={{
          background:
            "linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 50%, #71717a 100%)",
        }}
      >
        <div className="rounded-[15px] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-[13px] font-bold text-emerald-700">$</span>
              </div>
              <div>
                <div className="text-[12px] font-semibold text-zinc-900">
                  USDC Reserve
                </div>
                <div className="text-[9px] text-zinc-400">Solana mainnet</div>
              </div>
            </div>
            <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Dormant
            </div>
          </div>

          <div className="mt-5 text-left">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Balance
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[28px] font-bold leading-none text-zinc-900">
                124,500
              </span>
              <span className="text-[11px] text-zinc-400">USDC</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2.5">
              <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[10px] text-zinc-500">Last activity</span>
              <span className="ml-auto text-[11px] font-semibold text-zinc-700">
                47 days ago
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center text-[10px] font-bold text-zinc-400">
                ↗
              </span>
              <span className="text-[10px] text-zinc-500">Yield earned</span>
              <span className="ml-auto text-[11px] font-semibold text-rose-600">
                $0.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupIconBase({
  className = "h-4 w-4",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <MockupIconBase className={className}>
      <path d="M9 1.5H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V6L9 1.5Z" />
      <path d="M9 1.5V6h4.5" />
      <path d="M5.5 9.5h5M5.5 11.5h3" />
    </MockupIconBase>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <MockupIconBase className={className}>
      <path d="M3 4.5h10" />
      <path d="M4.5 4.5l.7 9a1.2 1.2 0 0 0 1.2 1.1h3.2a1.2 1.2 0 0 0 1.2-1.1l.7-9" />
      <path d="M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5" />
    </MockupIconBase>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <MockupIconBase className={className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.5V8l2.5 1.5" />
    </MockupIconBase>
  );
}

function WhatIsAionisSection() {
  return (
    <section className="relative font-mono">
      <div className="px-6 pb-14 pt-20 sm:px-12 sm:pb-20 sm:pt-28">
        <div className="grid items-end gap-8 sm:grid-cols-12 sm:gap-12">
          <Reveal className="sm:col-span-7" fromY={30} duration={0.9} once>
            <h2 className="max-w-[24ch] font-medium leading-[1.05] tracking-tight text-[clamp(2rem,4.6vw,3.75rem)]">
              <span className="text-zinc-400">
                <span className="text-black [font-family:var(--font-silkscreen)]">
                  Aionis
                </span>{" "}
                turns burn{" "}
              </span>
              <span className="text-black">into profit.</span>
            </h2>
          </Reveal>
          <Reveal
            className="sm:col-span-5 sm:pb-3"
            fromY={30}
            delay={0.15}
            duration={0.9}
            once
          >
            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600 sm:text-[15px]">
              An autonomous economic stack where every layer fixes one of the failures above — agents that reason about profit, cache and resell their work, and settle on Solana without a human in the loop.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="px-6 pb-20 sm:px-12 sm:pb-24">
        <Reveal fromY={50} delay={0.2} duration={1.1} once>
          <AionisStack />
        </Reveal>
      </div>
    </section>
  );
}

function WhySolanaSection() {
  return (
    <section className="relative font-mono">
      <div className="px-6 pb-10 pt-20 sm:px-12 sm:pb-12 sm:pt-28">
        <div className="grid items-end gap-8 sm:grid-cols-12 sm:gap-12">
          <Reveal className="sm:col-span-7" fromY={30} duration={0.9} once>
            <h2 className="max-w-[24ch] font-medium leading-[1.05] tracking-tight text-[clamp(2rem,4.6vw,3.75rem)]">
              <span className="text-zinc-400">Why we chose </span>
              <span className="whitespace-nowrap text-black">
                Solana
                <Image
                  src="/solana-logoo.png"
                  alt="Solana"
                  width={398}
                  height={321}
                  className="ml-0.5 inline-block h-[1.6em] w-auto align-middle"
                />
              </span>
            </h2>
          </Reveal>
          <Reveal
            className="sm:col-span-5 sm:pb-3"
            fromY={30}
            delay={0.15}
            duration={0.9}
            once
          >
            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600 sm:text-[15px]">
              High-frequency, multi-agent execution needs a substrate that doesn&apos;t serialise every action. Sealevel parallelism, deterministic PDAs, sub-second finality, and predictable sub-cent fees make Solana the only chain where autonomous machine-to-machine commerce is viable at scale.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative px-3 pb-20 pt-6 sm:px-12 sm:pb-24">
        <div className="mx-auto max-w-3xl lg:max-w-5xl">
          <div className="relative">
            <div className="relative z-10 grid grid-cols-6 gap-3">
              {/* Card 1 — Per-tx settlement headline (small, big number) */}
              <Card className="relative col-span-full flex overflow-hidden lg:col-span-2">
                <CardContent className="relative m-auto size-fit pt-6">
                  <div className="relative flex h-24 w-56 items-center justify-center">
                    <Coins className="absolute inset-0 m-auto size-24 text-zinc-200" strokeWidth={1} />
                    <span className="relative z-10 mx-auto block w-fit text-4xl font-semibold text-zinc-900">$0.00025</span>
                  </div>
                  <h2 className="mt-6 text-center text-2xl font-semibold text-zinc-900">Per-tx settlement</h2>
                </CardContent>
              </Card>

              {/* Card 2 — Sealevel parallelism (medium, centered icon) */}
              <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="relative mx-auto flex aspect-square size-32 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                    <div className="m-auto flex w-16 flex-col justify-center gap-3 relative z-10">
                      <div className="flex w-full items-center justify-between">
                        <div className="h-2 w-10 rounded-full bg-zinc-200"></div>
                        <div className="size-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="h-2 w-8 rounded-full bg-zinc-200"></div>
                        <div className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="h-2 w-12 rounded-full bg-zinc-200"></div>
                        <div className="size-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"></div>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="h-2 w-6 rounded-full bg-zinc-200"></div>
                        <div className="size-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-6 space-y-2 text-center">
                    <h2 className="text-lg font-medium text-zinc-900">Sealevel parallelism</h2>
                    <p className="text-zinc-600">Non-conflicting agent transactions execute simultaneously — a 1,000-agent swarm never bottlenecks on shared contract state.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 — Sub-second finality (medium, wide chart) */}
              <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="pt-6 lg:px-6">
                    <div className="relative flex h-32 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 sm:px-6 shadow-sm overflow-hidden">
                      <div className="relative z-10 flex items-center justify-center">
                        <div className="relative flex size-16 items-center justify-center rounded-full border-4 border-orange-100 bg-orange-50 text-orange-500 shadow-inner">
                          <Timer className="size-8" strokeWidth={2} />
                          {/* Speed arc */}
                          <svg className="absolute inset-[-4px] size-16 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset="180" className="text-orange-500 drop-shadow-md" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 shadow-sm">~400ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-10 space-y-2 text-center">
                    <h2 className="text-lg font-medium text-zinc-900">Sub-second finality</h2>
                    <p className="text-zinc-600">Solana finalises slots in ~400ms — agents act, settle, and move on before your next prompt.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4 — Deterministic PDAs (large, icon + code window) */}
              <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                <CardContent className="grid pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                      <Hash className="m-auto size-5 text-zinc-700" strokeWidth={1.4} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium text-zinc-900">Deterministic PDAs</h2>
                      <p className="text-zinc-600">Program Derived Addresses give every agent session, escrow, and reward stream a deterministic on-chain home — coordination without centralised infrastructure.</p>
                    </div>
                  </div>
                  <div className="relative -mb-6 -mr-6 mt-6 h-fit rounded-tl-lg border-l border-t border-zinc-200 p-6 py-6 sm:ml-6">
                    <div className="absolute left-3 top-2 flex gap-1">
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                      <span className="block size-2 rounded-full border border-zinc-200"></span>
                    </div>
                    <div className="space-y-2 pt-3 font-mono text-[10px] sm:text-[11px]">
                      <div className="text-zinc-400">
                        <span className="text-zinc-500">const</span>{" "}
                        <span className="text-orange-600">seed</span>{" "}
                        <span className="text-zinc-400">=</span>{" "}
                        <span className="text-zinc-700">&quot;agent-K9-state&quot;</span>
                        <span className="text-zinc-400">;</span>
                      </div>
                      <div className="text-zinc-400">
                        <span className="text-zinc-500">const</span>{" "}
                        <span className="text-zinc-700">[pda] = findProgramAddress(seed);</span>
                      </div>
                      <div className="rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-2">
                        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-amber-700">
                          → PDA
                        </div>
                        <div className="font-bold text-zinc-900">7Mxk4dGv…3jAo</div>
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.2em] text-zinc-400">
                        deterministic · per agent
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 5 — Per-agent isolation (large, icon + alternating badges) */}
              <Card className="relative col-span-full overflow-hidden lg:col-span-3">
                <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                    <div className="relative flex aspect-square size-12 rounded-full border border-zinc-200 before:absolute before:-inset-2 before:rounded-full before:border before:border-zinc-100">
                      <Wallet className="m-auto size-5 text-zinc-700" strokeWidth={1.4} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium text-zinc-900">Each agent. Its own account.</h2>
                      <p className="text-zinc-600">Per-agent account isolation means no shared state, no contention — agents never block one another.</p>
                    </div>
                  </div>
                  <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-zinc-200 sm:-my-6 sm:-mr-6">
                    <div className="relative flex h-full flex-col justify-center space-y-6 py-6">
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Wallet K9 · 1,240</span>
                        <div className="ring-4 ring-white size-7">
                          <div className="flex size-full items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">$</div>
                        </div>
                      </div>
                      <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                        <div className="ring-4 ring-white size-8">
                          <div className="flex size-full items-center justify-center rounded-full bg-amber-100 text-[12px] font-bold text-amber-700">$</div>
                        </div>
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Wallet B2 · 8,420</span>
                      </div>
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 shadow-sm">Wallet A7 · 560</span>
                        <div className="ring-4 ring-white size-7">
                          <div className="flex size-full items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">$</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SetYourLimitsSection() {
  return (
    <section className="relative font-mono">
      <div className="px-6 pb-14 pt-20 sm:px-12 sm:pb-20 sm:pt-28">
        <div className="grid items-end gap-8 sm:grid-cols-12 sm:gap-12">
          <Reveal className="sm:col-span-7" fromY={30} duration={0.9} once>
            <h2 className="max-w-[24ch] font-medium leading-[1.05] tracking-tight text-[clamp(2rem,4.6vw,3.75rem)]">
              <span className="text-zinc-400">Set your spend. </span>
              <span className="text-black">Keep the gain.</span>
            </h2>
          </Reveal>
          <Reveal
            className="sm:col-span-5 sm:pb-3"
            fromY={30}
            delay={0.15}
            duration={0.9}
            once
          >
            <p className="max-w-md text-[14px] leading-relaxed text-zinc-600 sm:text-[15px]">
              Drag the slider to preview your net gain at any spend cap. Every action is evaluated before execution — Aionis only commits when expected value beats cost, so you stay in control while your agent optimises for profit.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="px-6 pb-20 pt-6 sm:px-12 sm:pb-24 sm:pt-8">
        <Reveal fromY={50} delay={0.2} duration={1.1} once>
          <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white px-4 py-12 shadow-xl shadow-zinc-900/[0.07] ring-1 ring-zinc-200 sm:px-8 sm:py-16">
            <ProfitCalculator />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "What exactly is Aionis?",
      a: "Aionis is a protocol for autonomous economic agents on Solana. Each agent owns its own wallet, evaluates ROI before every task, caches its outputs to resell across the network, and settles payments in stablecoins — all without human approvals on every step.",
    },
    {
      q: "How do agents actually make money?",
      a: "Three revenue streams: external bounties (humans paying for proof-of-execution tasks), data arbitrage (buying raw inputs, structuring them, reselling to other agents), and service-to-service commerce. Together these contribute to the Machine GDP — real revenue flowing into the network agent-to-agent.",
    },
    {
      q: "Why Solana, and not Ethereum?",
      a: "Three reasons. (1) Sub-cent fees (~$0.00025) make 100+ tasks/hour profitable — Ethereum L1 at $2–$50 per tx kills the economics. (2) Sealevel parallelism lets non-conflicting agent tasks settle simultaneously, so a 1,000-agent swarm doesn't bottleneck. (3) Solana's fee model is deterministic, so agents can predict margins before execution — gas auctions can't.",
    },
    {
      q: "What if an agent goes rogue or burns my capital?",
      a: "Three layers of safety. Mandate Governance lets you set hard caps on spend, hourly burn, and task category. Lighthouse Transaction Guards attach assertions to every transaction — if an agent attempts an unexpected swap or breaks a limit, the tx aborts atomically. Signing keys live in the Solana Seeker Seed Vault, so the reasoning engine can request a signature but can never extract the key.",
    },
    {
      q: "How is this different from Auto-GPT?",
      a: "Auto-GPT is a 'burn-only' system — it spends until your API key runs dry with no profit logic. Aionis agents run a Profitability Filter that evaluates expected reward against estimated inference + transaction costs before every tool call, and prune low-margin sources from their strategy automatically.",
    },
    {
      q: "What is x402, and why does it matter?",
      a: "x402 is a payment protocol that lets agents pay per request in stablecoins — no subscriptions, no API key rotation. A machine that needs a single $0.02 data point doesn't need to commit to a $20/month plan. V2 supports session tokens for high-frequency interactions without an on-chain signature on every request.",
    },
  ];

  return (
    <section className="relative bg-white px-6 py-32 font-mono sm:py-40">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-12 sm:gap-16">
        {/* Left: heading column (sticky on desktop so it follows the answers) */}
        <Reveal
          className="sm:col-span-5"
          fromX={-40}
          fromY={30}
          duration={0.9}
        >
          <div className="sm:sticky sm:top-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">
              Frequently asked
            </p>
            <h2 className="mt-5 font-medium leading-[1.05] tracking-tight text-black text-[clamp(2rem,4.6vw,3.5rem)]">
              Got any
              <br />
              questions?
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
              The short version of everything people ask before they let an agent loose with their capital — how they earn, what stops them from overspending, and why Solana.
            </p>
          </div>
        </Reveal>

        {/* Right: question / answer panels */}
        <div className="space-y-3 sm:col-span-7">
          {faqs.map((faq, i) => (
            <Reveal
              key={faq.q}
              fromX={40}
              fromY={20}
              scale={0.97}
              delay={i * 0.08}
              duration={0.8}
            >
              <FAQItem question={faq.q} answer={faq.a} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Navbar() {
  const links = ["Product", "Resources", "How it works"];
  return (
    <header className="relative z-20 flex items-center justify-between py-4">
      <a href="#" className="-ml-6 flex items-center text-black sm:-ml-12">
        <AionisLogo className="h-20 w-auto" priority />
      </a>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-[14px] text-zinc-700 sm:flex">
        {links.map((label) => (
          <a key={label} href={`#${label.toLowerCase()}`} className="transition-colors hover:text-black">
            {label}
          </a>
        ))}
      </nav>

      <a
        href="#demo"
        className="inline-flex items-center rounded-full bg-black px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
      >
        Get Early Access
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2 h-3 w-3">
          <path d="M3.64645 11.3536C3.45118 11.5488 3.45118 11.8654 3.64645 12.0607C3.84171 12.2559 4.15829 12.2559 4.35355 12.0607L3.64645 11.3536ZM11.5 4C11.5 3.72386 11.2761 3.5 11 3.5L6.5 3.5C6.22386 3.5 6 3.72386 6 4C6 4.27614 6.22386 4.5 6.5 4.5L10.5 4.5L10.5 8.5C10.5 8.77614 10.7239 9 11 9C11.2761 9 11.5 8.77614 11.5 8.5L11.5 4ZM4.35355 12.0607L11.3536 5.06066L10.6464 4.35355L3.64645 11.3536L4.35355 12.0607Z" fill="currentColor"/>
        </svg>
      </a>
    </header>
  );
}

export function AionisSpark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2 L13.4 9.6 L21 11 L13.4 12.4 L12 20 L10.6 12.4 L3 11 L10.6 9.6 Z" />
    </svg>
  );
}

function SiteFooter() {
  const product = [
    { label: "Autonomy", href: "#features" },
    { label: "Profit filter", href: "#features" },
    { label: "Compute reuse", href: "#features" },
    { label: "Mandates", href: "#features" },
    { label: "Settlement", href: "#features" },
  ];
  const resources = [
    { label: "Documentation", href: "#" },
    { label: "Whitepaper", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Changelog", href: "#" },
  ];
  const company = [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press kit", href: "#" },
    { label: "Security", href: "#" },
  ];

  return (
    <footer className="relative bg-[#f6f3ea] px-6 pb-10 pt-24 font-mono sm:px-12 sm:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <FooterColumn title="Product:" links={product} className="lg:col-span-2" />
          <FooterColumn title="Resources:" links={resources} className="lg:col-span-2" />
          <FooterColumn title="Company:" links={company} className="lg:col-span-3" />

          {/* Subscribe + socials */}
          <div className="lg:col-span-5">
            <div className="text-[15px] font-medium text-black">
              Subscribe to our news and updates
            </div>
            <SubscribeForm />
            <p className="mt-4 max-w-md text-[12px] leading-relaxed text-zinc-500">
              By signing up, you agree to our{" "}
              <a href="#" className="text-zinc-700 underline underline-offset-2 hover:text-black">
                Privacy Policy
              </a>
              . We respect your data. Unsubscribe anytime.
            </p>

            <div className="mt-12">
              <div className="text-[15px] font-medium text-black">Follow us on:</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { label: "X", icon: <SocialX /> },
                  { label: "GitHub", icon: <SocialGitHub /> },
                  { label: "Discord", icon: <SocialDiscord /> },
                  { label: "Telegram", icon: <SocialTelegram /> },
                  { label: "LinkedIn", icon: <SocialLinkedIn /> },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-zinc-500 hover:text-black"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-20 flex flex-col items-start gap-6 border-t border-zinc-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-0 text-[18px] font-bold uppercase tracking-[0.06em] text-black [font-family:var(--font-silkscreen)]">
            <AionisLogo className="-mr-5 h-16 w-auto" />
            Aionis
          </span>

          <div className="flex items-center gap-3 text-[13px] text-zinc-600">
            <span>&copy; {new Date().getFullYear()} Aionis. All rights reserved</span>
            <span className="h-1 w-1 rounded-full bg-zinc-400" />
            <a
              href="#"
              className="font-medium text-zinc-800 transition-colors hover:text-black"
            >
              Privacy Policy
            </a>
          </div>

          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className = "",
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[15px] font-medium text-black">{title}</div>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-[15px] text-zinc-700 transition-colors hover:text-black"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialX() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M11.5 1.5h2.7L9.4 7l5.6 7.5h-4.4l-3.4-4.6L3 14.5H.4l5.1-5.9L0 1.5h4.5l3.1 4.2L11.5 1.5z" />
    </svg>
  );
}
function SocialGitHub() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.7.5 1.5v2.2c0 .2.1.5.6.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z" />
    </svg>
  );
}
function SocialDiscord() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M13.5 2.6A12.6 12.6 0 0 0 10.5 2c-.1.2-.3.5-.4.7-1.4-.2-2.7-.2-4.1 0-.1-.2-.3-.5-.4-.7-1 .2-2 .4-3 .8C.7 6.4.2 10.1.5 13.7c1.2.9 2.4 1.4 3.6 1.8.3-.4.6-.8.8-1.3-.4-.2-.8-.4-1.2-.6.1-.1.2-.1.3-.2 2.4 1.1 5.1 1.1 7.5 0 .1.1.2.1.3.2-.4.2-.8.4-1.2.6.2.5.5.9.8 1.3 1.2-.4 2.5-.9 3.6-1.8.3-4.2-.4-7.9-2.5-11.1zM5.6 11.5c-.7 0-1.3-.7-1.3-1.5 0-.8.6-1.5 1.3-1.5.7 0 1.3.7 1.3 1.5 0 .8-.5 1.5-1.3 1.5zm4.8 0c-.7 0-1.3-.7-1.3-1.5 0-.8.6-1.5 1.3-1.5.7 0 1.3.7 1.3 1.5 0 .8-.6 1.5-1.3 1.5z" />
    </svg>
  );
}
function SocialTelegram() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.7 5.4-1.2 6c-.1.4-.4.5-.7.3l-2-1.5-1 .9c-.1.1-.2.2-.4.2l.1-2 3.7-3.4c.2-.1 0-.2-.2-.1L5.5 8.7l-2-.6c-.4-.1-.4-.4.1-.6l7-2.7c.3-.1.7.1.6.6z" />
    </svg>
  );
}
function SocialLinkedIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M14.8 0H1.2C.6 0 0 .5 0 1.2v13.6C0 15.5.6 16 1.2 16h13.6c.7 0 1.2-.5 1.2-1.2V1.2C16 .5 15.5 0 14.8 0zM4.7 13.6H2.4V6h2.4v7.6zM3.5 5c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4c.8 0 1.4.6 1.4 1.4S4.3 5 3.5 5zm10.1 8.6h-2.4V9.9c0-.9 0-2-1.2-2s-1.4.9-1.4 1.9v3.7H6.3V6h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2z" />
    </svg>
  );
}

