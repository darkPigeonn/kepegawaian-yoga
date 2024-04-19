import { Mongo } from "meteor/mongo";

export const Employee = new Mongo.Collection("employees");

export const educationCategory = [
  { code: 10, label: "SD" },
  { code: 20, label: "SMP" },
  { code: 30, label: "SMU" },
  { code: 31, label: "SMA" },
  { code: 32, label: "SMK" },
  { code: 33, label: "STM" },
  { code: 34, label: "SPG" },
  { code: 35, label: "SMPS" },
  { code: 36, label: "SMEA" },
  { code: 37, label: "D1" },
  { code: 38, label: "D2" },
  { code: 39, label: "D3" },
  { code: 40, label: "S1" },
  { code: 50, label: "S2" },
  { code: 60, label: "S3" },
];

export const EmployeeStatus = [
  { label: "Pegawai Tetap Yayasan (PTY)", code: "pty" },
  { label: "Pegawai Tetap Perwakilan (PTP)", code: "ptp" },
  { label: "Pegawai Tidak Tetap (PTT)", code: "ptt" },
  { label: "Resign", code: "resign" },
  { label: "Pensiun", code: "pensiun" },
  { label: "Salah Unit Kerja", code: "suk" },
];

export const EmployeeGolongan = [
  { label: "I/a	Juru Muda", code: "I/a" },
  { label: "I/b	Juru Muda Tingkat I", code: "I/b" },
  { label: "I/c	Juru", code: "I/c" },
  { label: "I/d	Juru Tingkat I", code: "I/d" },
  { label: "II/a	Pengatur Muda", code: "II/a" },
  { label: "II/b	Pengatur Muda Tingkat I", code: "II/b" },
  { label: "II/c	Pengatur", code: "II/c" },
  { label: "II/d	Pengatur Tingkat I", code: "II/d" },
  { label: "III/a	Penata Muda", code: "III/a" },
  { label: "III/b	Penata Muda Tingkat I", code: "III/b" },
  { label: "III/c	Penata", code: "III/c" },
  { label: "III/d	Penata Tingkat I", code: "III/d" },
  { label: "IV/a	Pembina", code: "IV/a" },
  { label: "IV/b	Pembina Tingkat I", code: "IV/b" },
];
