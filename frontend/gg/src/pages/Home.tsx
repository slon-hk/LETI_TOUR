import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useReveal } from '@/hooks/useReveal'

// ─── Feature cards data ───────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    accent: '#05336e',
    title: 'Виртуальный тур',
    desc: 'Прогуляйтесь по кампусу ЛЭТИ в формате 360° панорам с интерактивными маркерами и картой.',
    to: '/tour',
    cta: 'Начать тур',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    accent: '#bb8d54',
    title: 'История ЛЭТИ',
    desc: '138 лет от Технического училища Александра III до ведущего технического университета России.',
    to: '/history',
    cta: 'Читать историю',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    accent: '#059669',
    title: 'Музей Попова',
    desc: 'Мемориальный музей изобретателя радио А.С. Попова с уникальными историческими экспонатами.',
    to: '/tour',
    cta: 'Посетить музей',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const featuresRef = useReveal(100)
  const ctaRef = useReveal()

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      <Header />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-leti">

        {/* Ambient gradient orbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div
            className="anim-float absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)' }}
          />
          <div
            className="anim-float absolute -bottom-48 -right-32 w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(187,141,84,0.13) 0%, transparent 65%)',
              animationDelay: '2.8s',
            }}
          />
          <div
            className="anim-pulse-soft absolute top-1/3 right-1/3 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)' }}
          />
        </div>

        {/* Large emblem watermark */}
        <div
          aria-hidden
          className="anim-float absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ animationDelay: '1.2s', opacity: 0.055 }}
        >
          <img
            src="/logo-sin-krug.svg"
            alt=""
            className="w-[480px] h-[480px] md:w-[580px] md:h-[580px]"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Hero text */}
        <div className="relative z-10 px-6 pt-28 pb-8 max-w-6xl mx-auto w-full">
          <p
            className="anim-fade-up text-xs sm:text-sm font-bold uppercase tracking-[0.25em] mb-6"
            style={{ color: '#bb8d54', animationDelay: '0ms' }}
          >
            СПбГЭТУ «ЛЭТИ» · Санкт-Петербург
          </p>

          <h1
            className="anim-fade-up text-5xl sm:text-6xl md:text-7xl xl:text-[88px] font-black text-white leading-[1.03] tracking-tight mb-8"
            style={{ animationDelay: '80ms' }}
          >
            Колыбель<br />
            <span style={{ color: '#bb8d54' }}>электро-<br />техники</span>
          </h1>

          <p
            className="anim-fade-up text-base sm:text-lg md:text-xl text-blue-200 max-w-xl leading-relaxed mb-10"
            style={{ animationDelay: '200ms' }}
          >
            Первый в Европе гражданский электротехнический университет.
            Основан в 1886 году.
            Исследуйте историю через виртуальные панорамы.
          </p>

          <div
            className="anim-fade-up flex flex-col sm:flex-row gap-4"
            style={{ animationDelay: '300ms' }}
          >
            <Link
              to="/tour"
              className="group inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl text-sm sm:text-base text-white transition-all duration-300 hover:-translate-y-1"
              style={{ background: '#bb8d54', boxShadow: '0 8px 32px -8px rgba(187,141,84,0.45)' }}
            >
              Начать виртуальный тур
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl text-sm sm:text-base text-white border border-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              История ЛЭТИ
            </Link>
          </div>

          {/* Stats */}
          <div
            className="anim-fade-up grid grid-cols-3 gap-4 sm:gap-12 border-t border-white/10 pt-8 mt-16"
            style={{ animationDelay: '430ms' }}
          >
            {([
              { n: '1886', t: 'год основания' },
              { n: '138+', t: 'лет истории' },
              { n: '1', t: 'нобелевский лауреат' },
            ] as const).map(s => (
              <div key={s.n}>
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">{s.n}</div>
                <div className="text-blue-300/80 text-[10px] sm:text-sm mt-1 uppercase tracking-widest leading-snug">
                  {s.t}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          aria-hidden
          className="anim-float absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-2.5 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div ref={featuresRef} className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="reveal group bg-white dark:bg-slate-800 rounded-3xl p-8
                  border border-gray-100 dark:border-slate-700
                  hover:shadow-2xl hover:-translate-y-2
                  transition-all duration-500 cursor-default"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6
                    transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: f.accent }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-6 text-sm">{f.desc}</p>
                <Link
                  to={f.to}
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 hover:gap-3"
                  style={{ color: f.accent }}
                >
                  {f.cta}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ POPOV CALLOUT ════════════════════ */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div ref={ctaRef} className="reveal">
            <div className="relative bg-leti rounded-3xl overflow-hidden p-8 md:p-14">

              {/* Background decorations */}
              <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="anim-float absolute -bottom-24 -right-24 w-72 h-72 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(187,141,84,0.2) 0%, transparent 70%)' }}
                />
                <div
                  className="anim-pulse-soft absolute -top-24 left-1/3 w-96 h-96 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
                />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src="/logo-sin-krug.svg"
                    alt="ЛЭТИ"
                    className="w-20 h-20 md:w-28 md:h-28"
                    style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                  />
                </div>

                <div className="flex-1">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
                    style={{ color: '#bb8d54' }}
                  >
                    Музей А.С. Попова
                  </p>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                    Изобретатель радио<br className="hidden md:block" />
                    работал здесь
                  </h3>
                  <p className="text-blue-200 leading-relaxed mb-8 max-w-lg text-sm sm:text-base">
                    В 1897 году Александр Попов продемонстрировал беспроводный телеграф
                    в стенах этого института. Посетите мемориальный музей в виртуальном туре.
                  </p>
                  <Link
                    to="/tour"
                    className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ background: '#bb8d54', boxShadow: '0 4px 20px -4px rgba(187,141,84,0.5)' }}
                  >
                    Открыть виртуальный тур
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
