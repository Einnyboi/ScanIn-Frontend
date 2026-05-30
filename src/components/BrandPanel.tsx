import { useState } from 'react'

export function BrandPanel() {
  const [isLogoMissing, setIsLogoMissing] = useState(false)

  return (
    <section className="brand-panel relative isolate flex min-h-[42vh] items-end overflow-hidden px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
      <div
        className="absolute inset-0 -z-20 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(46, 24, 78, 0.92), rgba(99, 51, 138, 0.48), rgba(19, 24, 39, 0.78)), url('/untar-campus.jpg')",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(180deg,transparent,rgba(20,20,30,0.44))]" />

      <div className="brand-copy max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative isolate flex h-[78px] w-48 items-center justify-center rounded-xl border border-white/25 bg-white/85 px-3 shadow-xl shadow-black/25 backdrop-blur-md">
            {isLogoMissing ? (
              <span className="text-3xl font-black tracking-[0.08em] text-[#7d2228]">
                FTI
              </span>
            ) : (
              <img
                src="/logo-fti.png"
                alt="Logo FTI Universitas Tarumanagara"
                className="h-40 w-auto object-contain drop-shadow-md"
                onError={() => setIsLogoMissing(true)}
              />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
              Universitas Tarumanagara
            </p>
            <h1 className="mt-1 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              ScanIn FTI
            </h1>
          </div>
        </div>

        <p className="max-w-xl text-base font-medium leading-7 text-white/85 sm:text-lg">
          Sistem presensi digital untuk mahasiswa, pengajar, dan admin FTI
          dengan akses cepat, tampilan jelas, dan alur login yang sederhana.
        </p>

        <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
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
