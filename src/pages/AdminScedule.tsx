import { useState } from "react";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, Users } from "lucide-react";

type Schedule = {
    id: number;
    course: string;
    lecturer: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    capacity: number;
    enrolled: number;
};

export default function AdminSchedule() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const schedules = [
        {
            id: 1,
            course: "Basis Data Lanjut",
            lecturer: "Dr. Ahmad Santoso",
            day: "Senin",
            startTime: "08:00",
            endTime: "10:00",
            room: "B-204",
            capacity: 30,
            enrolled: 28,
        },
        {
            id: 2,
            course: "Pemrograman Web",
            lecturer: "Ir. Siti Nurhaliza",
            day: "Senin",
            startTime: "10:30",
            endTime: "12:30",
            room: "B-301",
            capacity: 30,
            enrolled: 25,
        },
        {
            id: 3,
            course: "Kecerdasan Buatan",
            lecturer: "Prof. Budi Hartono",
            day: "Senin",
            startTime: "13:00",
            endTime: "15:00",
            room: "B-105",
            capacity: 25,
            enrolled: 22,
        },
        {
            id: 4,
            course: "Sistem Operasi",
            lecturer: "Dr. Ahmad Santoso",
            day: "Selasa",
            startTime: "08:00",
            endTime: "10:00",
            room: "B-203",
            capacity: 30,
            enrolled: 27,
        },
        {
            id: 5,
            course: "Jaringan Komputer",
            lecturer: "Ir. Siti Nurhaliza",
            day: "Rabu",
            startTime: "10:00",
            endTime: "12:00",
            room: "B-305",
            capacity: 28,
            enrolled: 26,
        },
    ];

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const handleEdit = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setShowEditModal(true);
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Jadwal</h1>
                <p className="text-gray-600">Kelola jadwal perkuliahan</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Total Jadwal</p>
                    <p className="text-3xl font-bold text-gray-900">{schedules.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Mata Kuliah</p>
                    <p className="text-3xl font-bold text-[#5C3386]">15</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Ruangan Aktif</p>
                    <p className="text-3xl font-bold text-green-600">8</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Pengajar Aktif</p>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
            </div>

            {/* Add Button */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Tambah Jadwal
                </button>
            </div>

            {/* Schedule by Day */}
            <div className="space-y-6">
                {days.map((day) => {
                    const daySchedules = schedules.filter((s) => s.day === day);
                    if (daySchedules.length === 0) return null;

                    return (
                        <div key={day} className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={24} className="text-[#5C3386]" />
                                {day}
                            </h3>
                            <div className="space-y-3">
                                {daySchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-[#5C3386] transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                    {schedule.course}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={16} />
                                                        <span>{schedule.lecturer}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} />
                                                        <span>
                                                            {schedule.startTime} - {schedule.endTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={16} />
                                                        <span>{schedule.room}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-[#5C3386] h-2 rounded-full"
                                                                style={{
                                                                    width: `${(schedule.enrolled / schedule.capacity) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-600">
                                                            {schedule.enrolled}/{schedule.capacity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Schedule Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tambah Jadwal Baru</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mata Kuliah
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pengajar</label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent">
                                        <option>Pilih Pengajar</option>
                                        <option>Dr. Ahmad Santoso</option>
                                        <option>Ir. Siti Nurhaliza</option>
                                        <option>Prof. Budi Hartono</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent">
                                        <option>Senin</option>
                                        <option>Selasa</option>
                                        <option>Rabu</option>
                                        <option>Kamis</option>
                                        <option>Jumat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jam Mulai
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jam Selesai
                                    </label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ruangan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: B-204"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas</label>
                                    <input
                                        type="number"
                                        placeholder="30"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Schedule Modal */}
            {showEditModal && selectedSchedule && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Jadwal</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mata Kuliah
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={selectedSchedule.course}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pengajar</label>
                                    <select
                                        defaultValue={selectedSchedule.lecturer}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    >
                                        <option>Dr. Ahmad Santoso</option>
                                        <option>Ir. Siti Nurhaliza</option>
                                        <option>Prof. Budi Hartono</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                                    <select
                                        defaultValue={selectedSchedule.day}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    >
                                        <option>Senin</option>
                                        <option>Selasa</option>
                                        <option>Rabu</option>
                                        <option>Kamis</option>
                                        <option>Jumat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jam Mulai
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue={selectedSchedule.startTime}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jam Selesai
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue={selectedSchedule.endTime}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ruangan</label>
                                    <input
                                        type="text"
                                        defaultValue={selectedSchedule.room}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas</label>
                                    <input
                                        type="number"
                                        defaultValue={selectedSchedule.capacity}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
