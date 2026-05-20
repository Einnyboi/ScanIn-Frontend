// page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle,
  Clock,
  Ticket,
  QrCode,
  FileText,
  LogOut,
  User,
  RefreshCw,
} from "lucide-react";

import styles from "./student.dashboard.module.css"; // Import CSS Module

interface UserData {
  id: string;
  role: string;
  name: string;
  token?: string;
}

// --- KOMPONEN DYNAMIC QR ---
const DynamicQR = ({ nim, className }: { nim: string; className: string }) => {
  const [qrValue, setQrValue] = useState(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    return JSON.stringify({ nim, class: className, payloadTime: timestamp });
  });
  const [countdown, setCountdown] = useState(15);

  const generateQrData = useCallback(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({
      nim: nim,
      class: className,
      payloadTime: timestamp,
    });
    setQrValue(payload);
  }, [nim, className]);

  const handleManualRefresh = () => {
    generateQrData();
    setCountdown(15);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateQrData();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generateQrData]);

  return (
    <div className={styles.qrContainer}>
      <div className={styles.qrBox}>
        {qrValue ? (
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor={"#FFFFFF"}
            fgColor={"#5C3386"}
            level={"H"}
          />
        ) : (
          <div className={styles.qrPlaceholder}>Memuat...</div>
        )}
      </div>

      <div className={styles.qrTimer}>
        <Clock size={16} className="animate-pulse" />
        <span>Diperbarui dalam {countdown} detik</span>
      </div>

      <button onClick={handleManualRefresh} className={styles.btnRefresh}>
        <RefreshCw size={12} /> Muat ulang sekarang
      </button>
    </div>
  );
};

// --- KOMPONEN UTAMA DASHBOARD ---
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const [userData] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    }
    return null;
  });

  useEffect(() => {
    if (!userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  const schedules = [
    {
      id: 1,
      name: "Basis Data Lanjut",
      time: "08:00 - 10:00",
      room: "B-204",
      status: "active",
      lecturer: "Dr. Ahmad Santoso",
    },
    {
      id: 2,
      name: "Pemrograman Web",
      time: "10:30 - 12:30",
      room: "B-301",
      status: "upcoming",
      lecturer: "Ir. Siti Nurhaliza",
    },
    {
      id: 3,
      name: "Kecerdasan Buatan",
      time: "13:00 - 15:00",
      room: "B-105",
      status: "upcoming",
      lecturer: "Prof. Budi Hartono",
    },
  ];

  const history = [
    { date: "19 Mei 2026", class: "Basis Data Lanjut", status: "Hadir", time: "08:05" },
    { date: "18 Mei 2026", class: "Pemrograman Web", status: "Hadir", time: "10:28" },
    { date: "17 Mei 2026", class: "Kecerdasan Buatan", status: "Terlambat", time: "13:17" },
    { date: "16 Mei 2026", class: "Basis Data Lanjut", status: "Hadir", time: "08:02" },
  ];

  if (!userData) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerProfile}>
            <div className={styles.avatar}>
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className={styles.userName}>
                {userData.role === "student" ? userData.name : "Mahasiswa"}
              </h2>
              <p className={styles.userNim}>NIM: {userData.id}</p>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.btnLogout}>
            <LogOut size={20} />
            <span className={styles.hideOnMobile}>Keluar</span>
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Metrics */}
        <div className={styles.metricsGrid}>
          <button
            onClick={() => navigate("/student/attendance/kehadiran")}
            className={styles.metricCardClickable}
          >
            <div className={styles.metricInner}>
              <div className={styles.iconPurple}>
                <CheckCircle className="text-[#5C3386]" size={24} />
              </div>
              <div>
                <p className={styles.metricLabel}>Kehadiran</p>
                <p className={styles.metricValue}>87%</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/student/attendance/terlambat")}
            className={styles.metricCardClickable}
          >
            <div className={styles.metricInner}>
              <div className={styles.iconYellow}>
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className={styles.metricLabel}>Terlambat</p>
                <p className={styles.metricValue}>2x</p>
              </div>
            </div>
          </button>

          <div className={styles.metricCard}>
            <div className={styles.metricInner}>
              <div className={styles.iconRed}>
                <Ticket className="text-[#7D2228]" size={24} />
              </div>
              <div>
                <p className={styles.metricLabel}>Tiket Aktif</p>
                <p className={styles.metricValue}>1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Jadwal Hari Ini</h3>
          <div className={styles.scheduleList}>
            {schedules.map((schedule) => (
              <div key={schedule.id} className={styles.scheduleItem}>
                <div className={styles.scheduleItemInner}>
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleHeader}>
                      <h4 className={styles.className}>{schedule.name}</h4>
                      {schedule.status === "active" ? (
                        <span className={styles.badgeActive}>Sesi Aktif</span>
                      ) : (
                        <span className={styles.badgeUpcoming}>Belum Mulai</span>
                      )}
                    </div>
                    <p className={styles.scheduleDetails}>
                      {schedule.time} • {schedule.room} • {schedule.lecturer}
                    </p>
                  </div>
                  {schedule.status === "active" && (
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => {
                          setSelectedClass(schedule.name);
                          setShowQR(true);
                        }}
                        className={styles.btnPrimary}
                      >
                        <QrCode size={18} /> Tampilkan QR
                      </button>
                      <button className={styles.btnOutline}>
                        <FileText size={18} />
                        <span className={styles.hideOnMobile}>Ajukan Tiket</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Riwayat Presensi</h3>
          <div className={styles.historyList}>
            {history.map((item, index) => (
              <div key={index} className={styles.historyItem}>
                <div>
                  <p className={styles.className}>{item.class}</p>
                  <p className={styles.userNim}>{item.date}</p>
                </div>
                <div className={styles.historyStatus}>
                  <span className={`${styles.scheduleDetails} ${styles.hideOnMobile}`}>
                    {item.time}
                  </span>
                  {item.status === "Hadir" ? (
                    <span className={styles.badgeActive}>Hadir</span>
                  ) : (
                    <span className={styles.badgeLate}>Terlambat</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal Dinamis */}
      {showQR && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowQR(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedClass}</h3>
              <p className={styles.modalSubtitle}>NIM: {userData.id}</p>
            </div>

            <div className={styles.qrWrapperOuter}>
              <DynamicQR nim={userData.id} className={selectedClass || ""} />
            </div>

            <p className={styles.modalNote}>
              Arahkan QR code ini ke kamera PC ruang kelas. Tangkapan layar tidak berlaku.
            </p>

            <button
              onClick={() => setShowQR(false)}
              className={styles.btnClose}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}