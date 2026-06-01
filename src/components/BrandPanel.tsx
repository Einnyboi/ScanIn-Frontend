import { useState } from 'react'

export function BrandPanel() {
  const [isLogoMissing, setIsLogoMissing] = useState(false)

  return (
    <section className="brand-panel relative isolate flex min-h-[220px] items-end overflow-hidden px-4 pb-8 pt-8 text-white sm:min-h-[280px] sm:px-8 sm:pb-10 md:min-h-[320px] md:px-10 md:pb-12 xl:min-h-screen xl:px-14 xl:py-12">
      <div
        className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(46, 24, 78, 0.92), rgba(99, 51, 138, 0.48), rgba(19, 24, 39, 0.78)), url('/untar-campus.jpg')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,transparent,rgba(20,20,30,0.44))]" />

      <div className="brand-copy max-w-2xl">
        <div className="mb-3 flex items-center gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
          <div className="relative isolate flex h-[62px] w-36 items-center justify-center rounded-xl border border-white/25 bg-white/90 px-3 shadow-xl shadow-black/25 backdrop-blur-md sm:h-[74px] sm:w-44 xl:h-[78px] xl:w-48">
            {isLogoMissing ? (
              <span className="text-2xl font-black tracking-[0.08em] text-[#7d2228] sm:text-3xl">
                FTI
              </span>
            ) : (
              <img
                src="/logo-fti.png"
                alt="Logo FTI Universitas Tarumanagara"
                className="h-28 w-auto object-contain drop-shadow-md sm:h-36 xl:h-40"
                onError={() => setIsLogoMissing(true)}
              />
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 sm:text-sm">
              Universitas Tarumanagara
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              ScanIn FTI
            </h1>
          </div>
        </div>

        <p className="max-w-xl text-sm font-medium leading-6 text-white/85 sm:text-base sm:leading-7 xl:text-lg">
          Sistem presensi digital untuk mahasiswa, pengajar, dan admin FTI
          dengan akses cepat, tampilan jelas, dan alur login yang sederhana.
        </p>

        <div className="mt-5 hidden max-w-xl grid-cols-3 gap-2 sm:mt-6 sm:grid xl:mt-8 xl:gap-3">
          {['Presensi real-time', 'Tiket izin', 'Laporan kelas'].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/18 bg-white/12 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
