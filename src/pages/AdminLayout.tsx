import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    FileText,
    Ticket,
    LogOut,
} from "lucide-react";

type UserData = {
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
};

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData] = useState<UserData | null>(() => {
        const data = sessionStorage.getItem("userData");
        return data ? (JSON.parse(data) as UserData) : null;
    });

    useEffect(() => {
        if (!userData) {
            navigate("/");
        }
    }, [navigate, userData]);

    const handleLogout = () => {
        sessionStorage.removeItem("userData");
        navigate("/");
    };

    const menuItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/admin/users", icon: Users, label: "Pengguna" },
        { path: "/admin/schedule", icon: Calendar, label: "Jadwal" },
        { path: "/admin/attendance", icon: ClipboardList, label: "Presensi" },
        { path: "/admin/reports", icon: FileText, label: "Laporan" },
        { path: "/admin/tickets", icon: Ticket, label: "Tiket" },
    ];

    if (!userData) return null;

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <div className="w-64 bg-[#5C3386] text-white flex flex-col">
                <div className="p-6 border-b border-white border-opacity-20">
                    <div className="relative isolate flex h-24 items-center justify-center rounded-lg bg-white/12 p-3 shadow-2xl shadow-black/20 ring-1 ring-white/20 before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-white/22 before:blur-xl before:content-['']">
                        <img
                            src="/logo-fti.png"
                            alt="Logo FTI UNTAR"
                            className="max-h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(255,255,255,0.22)]"
                        />
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${isActive
                                    ? "bg-[#7D2228] text-white"
                                    : "text-white hover:bg-white hover:bg-opacity-10"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white border-opacity-20">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}
