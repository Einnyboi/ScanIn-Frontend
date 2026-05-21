import { Download, TrendingUp, TrendingDown, FileText } from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function AdminReports() {
    const monthlyData = [
        { month: "Jan", hadir: 850, terlambat: 45, alpha: 25 },
        { month: "Feb", hadir: 820, terlambat: 55, alpha: 30 },
        { month: "Mar", hadir: 880, terlambat: 40, alpha: 20 },
        { month: "Apr", hadir: 860, terlambat: 50, alpha: 28 },
        { month: "May", hadir: 840, terlambat: 48, alpha: 22 },
    ];

    const classPerformance = [
        { class: "Basis Data Lanjut", percentage: 89 },
        { class: "Pemrograman Web", percentage: 85 },
        { class: "Kecerdasan Buatan", percentage: 92 },
        { class: "Sistem Operasi", percentage: 87 },
        { class: "Jaringan Komputer", percentage: 91 },
    ];

    const statusDistribution = [
        { name: "Hadir", value: 84, color: "#22c55e" },
        { name: "Terlambat", value: 11, color: "#f59e0b" },
        { name: "Tidak Hadir", value: 5, color: "#ef4444" },
    ];

    const reports = [
        {
            id: 1,
            title: "Laporan Kehadiran Bulanan - Mei 2026",
            description: "Ringkasan kehadiran semua kelas untuk bulan Mei",
            date: "20 Mei 2026",
            type: "monthly",
        },
        {
            id: 2,
            title: "Laporan Kinerja Per Kelas - Semester Genap",
            description: "Analisis performa kehadiran per mata kuliah",
            date: "15 Mei 2026",
            type: "class",
        },
        {
            id: 3,
            title: "Laporan Mahasiswa Bermasalah",
            description: "Daftar mahasiswa dengan kehadiran di bawah 75%",
            date: "10 Mei 2026",
            type: "student",
        },
        {
            id: 4,
            title: "Laporan Penggunaan Sistem - April 2026",
            description: "Statistik penggunaan sistem presensi digital",
            date: "1 Mei 2026",
            type: "system",
        },
    ];

    const renderPieLabel = (entry: { name: string; value: number }) => `${entry.name}: ${entry.value}%`;

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
                <p className="text-gray-600">Statistik dan laporan sistem presensi</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Kehadiran Rata-rata</p>
                        <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">84%</p>
                    <p className="text-sm text-green-600 mt-1">+2.5% dari bulan lalu</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Keterlambatan</p>
                        <TrendingDown className="text-yellow-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">11%</p>
                    <p className="text-sm text-yellow-600 mt-1">-1.2% dari bulan lalu</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Ketidakhadiran</p>
                        <TrendingUp className="text-red-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">5%</p>
                    <p className="text-sm text-red-600 mt-1">+0.8% dari bulan lalu</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-sm">Total Sesi</p>
                        <FileText className="text-blue-600" size={20} />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">245</p>
                    <p className="text-sm text-gray-600 mt-1">Bulan ini</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Trend */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Tren Kehadiran Bulanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hadir" fill="#5C3386" name="Hadir" />
                            <Bar dataKey="terlambat" fill="#f59e0b" name="Terlambat" />
                            <Bar dataKey="alpha" fill="#ef4444" name="Alpha" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Class Performance */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Performa Per Mata Kuliah</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={classPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="class" angle={-15} textAnchor="end" height={80} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#5C3386"
                                strokeWidth={3}
                                name="Persentase (%)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Status Distribution */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Distribusi Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderPieLabel}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Classes */}
                <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Peringkat Kehadiran Per Kelas</h3>
                    <div className="space-y-4">
                        {classPerformance
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((item, index) => (
                                <div key={item.class}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0
                                                    ? "bg-yellow-500"
                                                    : index === 1
                                                        ? "bg-gray-400"
                                                        : index === 2
                                                            ? "bg-orange-600"
                                                            : "bg-gray-300"
                                                    }`}
                                            >
                                                {index + 1}
                                            </div>
                                            <span className="font-medium text-gray-900">{item.class}</span>
                                        </div>
                                        <span className="font-bold text-[#5C3386]">{item.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-[#5C3386] h-2 rounded-full transition-all"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Laporan Tersedia</h3>
                    <button className="px-4 py-2 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors flex items-center gap-2">
                        <FileText size={18} />
                        Generate Laporan Baru
                    </button>
                </div>
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-[#5C3386] transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">{report.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                    <p className="text-xs text-gray-500">Dibuat: {report.date}</p>
                                </div>
                                <button className="ml-4 px-4 py-2 border border-[#5C3386] text-[#5C3386] rounded-lg hover:bg-[#5C3386] hover:text-white transition-colors flex items-center gap-2">
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
