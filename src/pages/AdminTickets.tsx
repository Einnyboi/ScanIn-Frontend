import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

type Ticket = {
    id: number;
    student: string;
    nim: string;
    class: string;
    lecturer: string;
    date: string;
    sessionDate: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    evidence: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
};

export default function AdminTickets() {
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
        "all"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const tickets: Ticket[] = [
        {
            id: 1,
            student: "Naisya Yuen Ra'af",
            nim: "535240187",
            class: "Basis Data Lanjut",
            lecturer: "Dr. Ahmad Santoso",
            date: "20 Mei 2026",
            sessionDate: "17 Mei 2026",
            reason: "Sistem error saat scan QR code. Sudah mencoba berkali-kali tetapi tidak terdeteksi.",
            status: "pending",
            submittedAt: "20 Mei 2026, 09:15",
            evidence: "Screenshot error",
        },
        {
            id: 2,
            student: "Ahmad Rizki",
            nim: "535240156",
            class: "Pemrograman Web",
            lecturer: "Ir. Siti Nurhaliza",
            date: "19 Mei 2026",
            sessionDate: "18 Mei 2026",
            reason: "Terlambat karena sakit, sudah ada surat keterangan dokter.",
            status: "pending",
            submittedAt: "19 Mei 2026, 14:30",
            evidence: "Surat Dokter",
        },
        {
            id: 3,
            student: "Dewi Lestari",
            nim: "535240178",
            class: "Kecerdasan Buatan",
            lecturer: "Prof. Budi Hartono",
            date: "18 Mei 2026",
            sessionDate: "17 Mei 2026",
            reason: "Lupa scan saat masuk kelas karena terburu-buru.",
            status: "approved",
            submittedAt: "18 Mei 2026, 10:20",
            evidence: "-",
            approvedBy: "Admin User",
            approvedAt: "18 Mei 2026, 15:45",
        },
        {
            id: 4,
            student: "Eko Prasetyo",
            nim: "535240165",
            class: "Sistem Operasi",
            lecturer: "Dr. Ahmad Santoso",
            date: "17 Mei 2026",
            sessionDate: "16 Mei 2026",
            reason: "Terlambat karena macet.",
            status: "rejected",
            submittedAt: "17 Mei 2026, 11:00",
            evidence: "-",
            rejectedBy: "Admin User",
            rejectedAt: "17 Mei 2026, 16:30",
            rejectionReason: "Alasan tidak valid sesuai kebijakan fakultas.",
        },
        {
            id: 5,
            student: "Fitri Handayani",
            nim: "535240189",
            class: "Jaringan Komputer",
            lecturer: "Ir. Siti Nurhaliza",
            date: "16 Mei 2026",
            sessionDate: "15 Mei 2026",
            reason: "Aplikasi crash saat akan scan QR.",
            status: "pending",
            submittedAt: "16 Mei 2026, 08:45",
            evidence: "Screenshot",
        },
    ];

    const filteredTickets = tickets.filter((ticket: Ticket) => {
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesSearch =
            ticket.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.nim.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: Ticket["status"]) => {
        switch (status) {
            case "pending":
                return (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock size={12} />
                        Menunggu
                    </span>
                );
            case "approved":
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle size={12} />
                        Disetujui
                    </span>
                );
            case "rejected":
                return (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <XCircle size={12} />
                        Ditolak
                    </span>
                );
            default:
                return null;
        }
    };

    const handleApprove = (ticketId: number) => {
        if (confirm("Setujui tiket ini?")) {
            alert(`Tiket #${ticketId} telah disetujui`);
        }
    };

    const handleReject = (ticketId: number) => {
        const reason = prompt("Masukkan alasan penolakan:");
        if (reason) {
            alert(`Tiket #${ticketId} telah ditolak dengan alasan: ${reason}`);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Tiket</h1>
                <p className="text-gray-600">Kelola permohonan koreksi kehadiran mahasiswa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Total Tiket</p>
                    <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Menunggu</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        {tickets.filter((t) => t.status === "pending").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Disetujui</p>
                    <p className="text-3xl font-bold text-green-600">
                        {tickets.filter((t) => t.status === "approved").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Ditolak</p>
                    <p className="text-3xl font-bold text-red-600">
                        {tickets.filter((t) => t.status === "rejected").length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${statusFilter === "all"
                                ? "bg-[#5C3386] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <Filter size={16} />
                            Semua
                        </button>
                        <button
                            onClick={() => setStatusFilter("pending")}
                            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "pending"
                                ? "bg-[#5C3386] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Menunggu
                        </button>
                        <button
                            onClick={() => setStatusFilter("approved")}
                            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "approved"
                                ? "bg-[#5C3386] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Disetujui
                        </button>
                        <button
                            onClick={() => setStatusFilter("rejected")}
                            className={`px-4 py-2 rounded-lg transition-colors ${statusFilter === "rejected"
                                ? "bg-[#5C3386] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Ditolak
                        </button>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#5C3386] hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{ticket.student}</h3>
                                    <span className="text-sm text-gray-600">NIM: {ticket.nim}</span>
                                    {getStatusBadge(ticket.status)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                    <p>
                                        <strong>Mata Kuliah:</strong> {ticket.class}
                                    </p>
                                    <p>
                                        <strong>Pengajar:</strong> {ticket.lecturer}
                                    </p>
                                    <p>
                                        <strong>Tanggal Sesi:</strong> {ticket.sessionDate}
                                    </p>
                                    <p>
                                        <strong>Diajukan:</strong> {ticket.submittedAt}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-gray-700">
                                        <strong>Alasan:</strong> {ticket.reason}
                                    </p>
                                    {ticket.evidence !== "-" && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            <strong>Bukti:</strong> {ticket.evidence}
                                        </p>
                                    )}
                                </div>

                                {ticket.status === "approved" && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                                        <p className="text-green-700">
                                            <strong>Disetujui oleh:</strong> {ticket.approvedBy} pada {ticket.approvedAt}
                                        </p>
                                    </div>
                                )}

                                {ticket.status === "rejected" && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                                        <p className="text-red-700 mb-1">
                                            <strong>Ditolak oleh:</strong> {ticket.rejectedBy} pada {ticket.rejectedAt}
                                        </p>
                                        <p className="text-red-700">
                                            <strong>Alasan:</strong> {ticket.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {ticket.status === "pending" && (
                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(ticket.id)}
                                        className="px-4 py-2 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Setujui
                                    </button>
                                    <button
                                        onClick={() => handleReject(ticket.id)}
                                        className="px-4 py-2 border border-[#7D2228] text-[#7D2228] rounded-lg hover:bg-[#7D2228] hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setShowDetailModal(true);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <MessageSquare size={18} />
                                        Detail
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredTickets.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <p className="text-gray-600">Tidak ada tiket ditemukan</p>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedTicket && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Detail Tiket</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Mahasiswa
                                </label>
                                <p className="text-gray-900">{selectedTicket.student}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                                <p className="text-gray-900">{selectedTicket.nim}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mata Kuliah
                                </label>
                                <p className="text-gray-900">{selectedTicket.class}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pengajar</label>
                                <p className="text-gray-900">{selectedTicket.lecturer}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Sesi
                                </label>
                                <p className="text-gray-900">{selectedTicket.sessionDate}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                                <p className="text-gray-900">{selectedTicket.reason}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bukti</label>
                                <p className="text-gray-900">{selectedTicket.evidence}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                            {selectedTicket.status === "pending" && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleApprove(selectedTicket.id);
                                            setShowDetailModal(false);
                                        }}
                                        className="flex-1 px-4 py-3 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors"
                                    >
                                        Setujui
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedTicket.id);
                                            setShowDetailModal(false);
                                        }}
                                        className="flex-1 px-4 py-3 bg-[#7D2228] text-white rounded-lg hover:bg-[#661c22] transition-colors"
                                    >
                                        Tolak
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
