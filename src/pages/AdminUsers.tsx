import { useState } from "react";
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react";

export default function AdminUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "student" | "lecturer" | "admin">("all");
    const [showAddModal, setShowAddModal] = useState(false);

    const users = [
        {
            id: 1,
            name: "Naisya Yuen Ra'af",
            idNumber: "535240187",
            role: "student",
            email: "naisya@student.untar.ac.id",
            status: "active",
        },
        {
            id: 2,
            name: "Ahmad Rizki",
            idNumber: "535240156",
            role: "student",
            email: "ahmad@student.untar.ac.id",
            status: "active",
        },
        {
            id: 3,
            name: "Dr. Ahmad Santoso",
            idNumber: "198503152010121001",
            role: "lecturer",
            email: "ahmad.santoso@untar.ac.id",
            status: "active",
        },
        {
            id: 4,
            name: "Ir. Siti Nurhaliza",
            idNumber: "198704232012122002",
            role: "lecturer",
            email: "siti.n@untar.ac.id",
            status: "active",
        },
        {
            id: 5,
            name: "Admin User",
            idNumber: "ADM001",
            role: "admin",
            email: "admin@untar.ac.id",
            status: "active",
        },
    ];

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.idNumber.includes(searchTerm);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "student":
                return (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Mahasiswa
                    </span>
                );
            case "lecturer":
                return (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Pengajar
                    </span>
                );
            case "admin":
                return (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Admin
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
                <p className="text-gray-600">Kelola data mahasiswa, pengajar, dan admin</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Total Pengguna</p>
                    <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Mahasiswa</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {users.filter((u) => u.role === "student").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Pengajar</p>
                    <p className="text-3xl font-bold text-green-600">
                        {users.filter((u) => u.role === "lecturer").length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <p className="text-gray-600 text-sm mb-1">Admin</p>
                    <p className="text-3xl font-bold text-purple-600">
                        {users.filter((u) => u.role === "admin").length}
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIM/NIP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setRoleFilter("all")}
                            className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === "all"
                                    ? "bg-[#5C3386] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setRoleFilter("student")}
                            className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === "student"
                                    ? "bg-[#5C3386] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Mahasiswa
                        </button>
                        <button
                            onClick={() => setRoleFilter("lecturer")}
                            className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === "lecturer"
                                    ? "bg-[#5C3386] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Pengajar
                        </button>
                        <button
                            onClick={() => setRoleFilter("admin")}
                            className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === "admin"
                                    ? "bg-[#5C3386] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Admin
                        </button>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-3 bg-[#5C3386] text-white rounded-lg hover:bg-[#4a2a6b] transition-colors flex items-center gap-2 w-full md:w-auto"
                    >
                        <Plus size={20} />
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                    NIM/NIP/ID
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nama</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.idNumber}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Aktif
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-8 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserPlus className="text-[#5C3386]" />
                            Tambah Pengguna Baru
                        </h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent">
                                    <option value="student">Mahasiswa</option>
                                    <option value="lecturer">Pengajar</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NIM/NIP/ID
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Default
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3386] focus:border-transparent"
                                />
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
        </div>
    );
}
