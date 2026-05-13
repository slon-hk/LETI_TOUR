import { Header } from '@/components/layout/Header'
import { useReveal } from '@/hooks/useReveal'

// ─── Timeline data ────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    year: '1886',
    tag: 'Основание',
    tagColor: '#05336e',
    title: 'Основание Технического училища',
    description:
      '3 июня Александр III утвердил устав Технического училища Почтово-телеграфного ведомства — первого в России гражданского специализированного вуза в области электротехники. Официальное открытие — 4 (16) сентября 1886 года.',
  },
  {
    year: '1891',
    tag: 'Реформа',
    tagColor: '#059669',
    title: 'Преобразование в Электротехнический институт',
    description:
      'Училище преобразовано в Электротехнический институт с расширенным 4-летним планом. В 1893 году профессор И.И. Боргман основал первую в России кафедру теоретической электротехники.',
  },
  {
    year: '1899',
    tag: 'Статус',
    tagColor: '#7c3aed',
    title: 'Статус высшего учебного заведения',
    description:
      'Институт получил статус высшего учебного заведения с 5-летним планом — выпускники стали получать степень «инженер-электрик». Тогда же открылась первая в России лаборатория электрохимии.',
  },
  {
    year: '1903',
    tag: 'Архитектура',
    tagColor: '#b45309',
    title: 'Главный корпус на Аптекарском острове',
    description:
      'Завершено строительство главного корпуса по проекту архитектора А.Н. Векшинского — здания, которое по сей день является архитектурной доминантой университетского городка.',
  },
  {
    year: '1905',
    tag: 'Наука',
    tagColor: '#0891b2',
    title: 'А.С. Попов — первый выборный директор',
    description:
      'Изобретатель радио Александр Попов избран директором института. Ещё в 1897 году именно здесь он представил коллегам доклад о беспроводном телеграфе, а в 1901-м занял кафедру физики.',
  },
  {
    year: '1916',
    tag: 'Общество',
    tagColor: '#db2777',
    title: 'Женщины в институте',
    description:
      'Женщины получили право поступать в институт — одно из первых высших технических учебных заведений России, открывших двери для женского образования.',
  },
  {
    year: '1924',
    tag: 'Имя',
    tagColor: '#05336e',
    title: 'Рождение аббревиатуры ЛЭТИ',
    description:
      'После переименования Петрограда в Ленинград институт стал Ленинградским электротехническим институтом — ЛЭТИ. Под этой аббревиатурой университет вошёл в историю отечественной науки.',
  },
  {
    year: '1941–45',
    tag: 'Война',
    tagColor: '#991b1b',
    title: 'Годы блокады и войны',
    description:
      'Более 1 200 сотрудников, преподавателей и студентов ушли на фронт. В условиях блокады Ленинграда учёные ЛЭТИ поддерживали оборону. Профессор Алексеев координировал сварочные работы на «Дороге жизни». В феврале 1942 года состоялся выпуск 30 инженеров.',
  },
  {
    year: '1952',
    tag: 'Будущее',
    tagColor: '#059669',
    title: 'ЛЭТИ оканчивает Жорес Алфёров',
    description:
      'В этом году институт окончил Жорес Иванович Алфёров — будущий Нобелевский лауреат по физике (2000). Его открытия в области полупроводниковых гетероструктур легли в основу современных лазеров, солнечных батарей и LED-технологий.',
  },
  {
    year: '1957',
    tag: 'Арктика',
    tagColor: '#0891b2',
    title: 'Вклад в атомный ледокол «Ленин»',
    description:
      'Учёные ЛЭТИ участвовали в создании первого в мире атомного ледокола «Ленин», открывшего новую эру в освоении Арктики.',
  },
  {
    year: '1967',
    tag: 'Награда',
    tagColor: '#b45309',
    title: 'Орден Ленина',
    description:
      'За выдающийся вклад в подготовку инженерных кадров и развитие науки институт награждён орденом Ленина — высшей государственной наградой СССР.',
  },
  {
    year: '1992',
    tag: 'Университет',
    tagColor: '#7c3aed',
    title: 'Статус технического университета',
    description:
      'Институт стал Санкт-Петербургским государственным электротехническим университетом «ЛЭТИ» им. В.И. Ульянова (Ленина) — одним из ведущих технических вузов России.',
  },
  {
    year: '1995',
    tag: 'Мир',
    tagColor: '#059669',
    title: 'Признание ЮНЕСКО · IEEE Milestone',
    description:
      'В год столетия изобретения радио ЮНЕСКО официально признало вклад А.С. Попова, а университету был присвоен статус IEEE Milestone — международного знака отличия в области электротехники.',
  },
  {
    year: '2000',
    tag: 'Нобель',
    tagColor: '#b45309',
    title: 'Нобелевская премия выпускника',
    description:
      'Жорес Алфёров, выпускник 1952 года, получил Нобелевскую премию по физике за фундаментальные исследования гетероструктур в полупроводниках и разработку быстрых опто- и микроэлектронных компонентов.',
  },
  {
    year: 'Сегодня',
    tag: '138 лет',
    tagColor: '#05336e',
    title: 'Живая традиция инноваций',
    description:
      'СПбГЭТУ «ЛЭТИ» — один из старейших и авторитетнейших технических университетов России. Более 100 000 выпускников, сотни научных школ и живая традиция инноваций, берущая начало от первой в Европе школы электриков.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const timelineRef = useReveal(60)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      {/* ── Hero banner ── */}
      <div className="relative bg-leti overflow-hidden pt-28 pb-16 px-6">
        {/* Orbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="anim-float absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
          />
          <div
            className="anim-float absolute -bottom-20 left-1/4 w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(187,141,84,0.12) 0%, transparent 70%)',
              animationDelay: '2s',
            }}
          />
        </div>

        {/* Vertical logo watermark */}
        <div
          aria-hidden
          className="anim-float absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ opacity: 0.06, animationDelay: '0.8s' }}
        >
          <img
            src="/logo-leti-sin-rus-vertik-2017.svg"
            alt=""
            className="h-44"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            className="anim-fade-up text-xs font-bold uppercase tracking-[0.25em] mb-4"
            style={{ color: '#bb8d54', animationDelay: '0ms' }}
          >
            СПбГЭТУ «ЛЭТИ»
          </p>
          <h1
            className="anim-fade-up text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
            style={{ animationDelay: '80ms' }}
          >
            История университета
          </h1>
          <p
            className="anim-fade-up text-blue-200 text-base sm:text-lg"
            style={{ animationDelay: '180ms' }}
          >
            138 лет от первой электротехнической школы Европы до ведущего технического университета России
          </p>
        </div>
      </div>

      {/* ── Timeline ── */}
      <main className="py-16 px-6 max-w-3xl mx-auto">
        {/* Connecting line */}
        <div
          ref={timelineRef}
          className="relative border-l-2 border-blue-100 dark:border-slate-800 ml-5"
        >
          {TIMELINE.map((item, index) => (
            <div key={index} className="reveal mb-10 ml-10 relative">
              {/* Timeline dot */}
              <div
                className="absolute -left-[49px] top-5 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-md transition-transform duration-300 hover:scale-150"
                style={{ background: item.tagColor }}
              />

              {/* Card */}
              <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                <div
                  className="h-1 w-full"
                  style={{ background: item.tagColor, opacity: 0.7 }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <span
                      className="text-2xl sm:text-3xl font-black tabular-nums leading-none"
                      style={{ color: item.tagColor }}
                    >
                      {item.year}
                    </span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                      style={{ background: item.tagColor, opacity: 0.85 }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-800 dark:text-slate-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
