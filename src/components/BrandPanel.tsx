import { useState } from 'react'

export function BrandPanel() {
  const [isLogoMissing, setIsLogoMissing] = useState(false)

  return (
    <section className="brand-panel relative isolate flex min-h-[34vh] items-center overflow-hidden px-5 py-7 text-white sm:min-h-[42vh] sm:px-10 lg:min-h-screen lg:items-end lg:px-14 lg:py-12">
      <div
        className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(46, 24, 78, 0.92), rgba(99, 51, 138, 0.48), rgba(19, 24, 39, 0.78)), url('/untar-campus.jpg')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,transparent,rgba(20,20,30,0.44))]" />

      <div className="brand-copy max-w-2xl">
        <div className="mb-5 flex items-center gap-3 sm:mb-8 sm:gap-4">
          <div className="relative isolate flex h-[68px] w-40 items-center justify-center rounded-xl border border-white/25 bg-white/88 px-3 shadow-xl shadow-black/25 backdrop-blur-md sm:h-[78px] sm:w-48">
            {isLogoMissing ? (
              <span className="text-3xl font-black tracking-[0.08em] text-[#7d2228]">
                FTI
              </span>
            ) : (
              <img
                src="/logo-fti.png"
                alt="Logo FTI Universitas Tarumanagara"
                className="h-32 w-auto object-contain drop-shadow-md sm:h-40"
                onError={() => setIsLogoMissing(true)}
              />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
              Universitas Tarumanagara
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              ScanIn FTI
            </h1>
          </div>
        </div>

        <p className="max-w-xl text-sm font-medium leading-6 text-white/85 sm:text-lg sm:leading-7">
          Sistem presensi digital untuk mahasiswa, pengajar, dan admin FTI
          dengan akses cepat, tampilan jelas, dan alur login yang sederhana.
        </p>

        <div className="mt-5 grid max-w-xl grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3">
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
