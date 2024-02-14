import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import moment from "moment";
import { FilesCollection } from "meteor/ostrio:files";

import SimpleSchema from "simpl-schema";

SimpleSchema.extendOptions([
  "autoform",
  "index",
  "denyInsert",
  "denyUpdate",
  "defaultValue",
]);

// SimpleSchema.setDefaultMessages({
//   initialLanguage: "en",
//   messages: {
//     en: {
//       uploadError: "{{ value }}", //File-upload
//     },
//   },
// });

export const StaffsAttendance = new Mongo.Collection("staffsAttendance");
export const MonthlyAttendance = new Mongo.Collection("monthlyAttendances");
export const ClockShifts = new Mongo.Collection("clockShifts");
export const ScheduleAttendance = new Mongo.Collection("scheduleAttendance");
export const ConfigAttendanceUser = new Mongo.Collection(
  "configAttendanceUser"
);
export const Letters = new Mongo.Collection("letters");
export const ConfigCategoriesLetters = new Mongo.Collection(
  "configCategoriesLetters"
);
export const CodesLetters = new Mongo.Collection("codeLetters");
export const Dispositions = new Mongo.Collection("dispositions");
export const DispositionsConfig = new Mongo.Collection("dispositionsConfig");
export const Draft = new Mongo.Collection("draft");
// export const Proposals = new Mongo.Collection("proposals");
export const Divisions = new Mongo.Collection("divisions");
export const Permits = new Mongo.Collection("permits");
export const Chronicles = new Mongo.Collection("chronicles", {idGeneration: 'MONGO'});
export const Partner = new Mongo.Collection( 'partners');
export const CategoriesParentsWorkPrograms = [
  {
    _id: 0,
    label: "-- Silahkan Pilih Kategori --",
  },
  {
    _id: "1",
    label: "Bidang",
  },
  {
    _id: "2",
    label: "Seksi",
  },
  {
    _id: "3",
    label: "Wilayah",
  },
  {
    _id: "4",
    label: "Lingkungan",
  },
];

export const Bidangs = [
  {
    _id: "1",
    label: "Bidang Sumber",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "2",
    label: "Bidang Formatio",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "3",
    label: "Bidang Kerasulan Khusus",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "4",
    label: "Bidang Kerasulan Umum",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "5",
    label: "Rumpun ANIMASI dan Formasi HIDUP KRISTIANI",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "6",
    label: "Litbang Pastoral",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "7",
    label: "Lembaga Pengabdian Gereja Bagi Masyarakat",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
  {
    _id: "8",
    label: "Aksi Puasa Pembangunan",
    categoryId: 1,
    categoryLabel: "Bidang",
  },
];

export const Komisi = [
  {
    _id: 1,
    label: "Komisi Katekese",
    bidangId: 1,
    bidangLabel: "Bidang Sumber",
  },
  {
    _id: 2,
    label: "Komisi Liturgi",
    bidangId: 1,
    bidangLabel: "Bidang Sumber",
  },
  {
    _id: 3,
    label: "Komisi Kitab Suci",
    bidangId: 1,
    bidangLabel: "Bidang Sumber",
  },
  {
    _id: 4,
    label: "Komisi Keluarga",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 5,
    label: "Komisi Anak",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 6,
    label: "Komisi Remaja",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 7,
    label: "Komisi OMK",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 7,
    label: "Komisi Lansia",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 8,
    label: "Pastoral Difabel",
    bidangId: 2,
    bidangLabel: "Bidang Formatio",
  },
  {
    _id: 9,
    label: "Komisi Animasi Panggilan dan Karya Misioner",
    bidangId: 3,
    bidangLabel: "Bidang Kerasulan Khusus",
  },
  {
    _id: 10,
    label: "Komisi Pendidikan",
    bidangId: 3,
    bidangLabel: "Bidang Kerasulan Khusus",
  },
  {
    _id: 11,
    label: "Komisi Komsos",
    bidangId: 3,
    bidangLabel: "Bidang Kerasulan Khusus",
  },
  {
    _id: 12,
    label: "Komisi PSE",
    bidangId: 4,
    bidangLabel: "Bidang Kerasulan Umum",
  },
  {
    _id: 13,
    label: "Komisi Kerawam dan HAK (PHUBB)",
    bidangId: 4,
    bidangLabel: "Bidang Kerasulan Umum",
  },
  {
    _id: 14,
    label: "PPM (Pelayanan Pastoral Mahasiswa)",
    bidangId: 5,
    bidangLabel: "Rumpun ANIMASI dan Formasi HIDUP KRISTIANI",
  },
  {
    _id: 15,
    label: "KKI (Karya Kepausan Indonesia)",
    bidangId: 5,
    bidangLabel: "Rumpun ANIMASI dan Formasi HIDUP KRISTIANI",
  },
  {
    _id: 16,
    label: "YOCAT Indonesia",
    bidangId: 5,
    bidangLabel: "Rumpun ANIMASI dan Formasi HIDUP KRISTIANI",
  },
  {
    _id: 17,
    label: "Bidang Sosial Kemasyarakatan",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 18,
    label: "Bidang Budaya",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 19,
    label: "Bidang Ekonomi",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 20,
    label: "Bidang Ekologi",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 21,
    label: "Bidang Pendidikan",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 21,
    label: "Bidang Teknologi",
    bidangId: 6,
    bidangLabel: "Litbang Pastoral",
  },
  {
    _id: 22,
    label: "LKD (Lembaga Karya Dharma)",
    bidangId: 7,
    bidangLabel: "Lembaga Pengabdian Gereja Bagi Masyarakat",
  },
  {
    _id: 23,
    label: "KARINA",
    bidangId: 7,
    bidangLabel: "Lembaga Pengabdian Gereja Bagi Masyarakat",
  },
  {
    _id: 24,
    label: "SGPP dan Perlindungan Anak",
    bidangId: 7,
    bidangLabel: "Lembaga Pengabdian Gereja Bagi Masyarakat",
  },
  {
    _id: 25,
    label: "Proposal APP",
    bidangId: 8,
    bidangLabel: "Aksi Puasa Pembangunan",
  },
  {
    _id: 26,
    label: "LPJ APP",
    bidangId: 8,
    bidangLabel: "Aksi Puasa Pembangunan",
  },
];

export const KlasifikasiSubject = [
  {
    id: 1,
    label: "Kronik Tenaga Pastoral",
  },
  {
    id: 2,
    label: "Kronik Komisi/Unit",
  },
  {
    id: 3,
    label: "Kronik Sekretaris Puspas",
  },
  {
    id: 4,
    label: "Kronik Vikpas",
  },
];

export const KlasifikasiAktifitas = [
  {
    id: 1,
    label: "Program Rutin",
  },
  {
    id: 2,
    label: "Program Ardas",
  },
  {
    id: 3,
    label: "Program Khas Komisi",
  },
  {
    id: 4,
    label: "Program Insidentil",
  },
];

export const KlasifikasiLingkup = [
  {
    id: 1,
    label: "Paroki",
  },
  {
    id: 2,
    label: "Kevikepan",
  },
  {
    id: 3,
    label: "Komisi",
  },
  {
    id: 4,
    label: "Rumpun Bidang",
  },
  {
    id: 5,
    label: "Koordinasi Karya Pastoral",
  },
  {
    id: 6,
    label: "Unit Pastoral",
  },
  {
    id: 7,
    label: "Pusat Pastoral",
  },
  {
    id: 8,
    label: "Keuskupan Surabya",
  },
  {
    id: 9,
    label: "Regional (Region Jawa)",
  },
  {
    id: 10,
    label: "Nasional (Indonesia/KWI)",
  },
  {
    id: 11,
    label: "Internasional / Kepausan",
  },
  {
    id: 12,
    label: "Pemerintahan",
  },
  {
    id: 13,
    label: "Lembaga Mitra",
  },
];

export const DataDosen = {
  _id: 1,
  profile: [{
      "label": "Nama*",
      "value": "Petrus Canisius Edi Laksito"
    },
    {
      "label": "Tempat Lahir*",
      "value": "Nganjuk"
    },
    {
      "label": "Tanggal Lahir*",
      "value": "30 November 1967"
    },
    {
      "label": "Jenis Kelamin*",
      "value": "Male"
    },
    {
      "label": "NIK*",
      "value": "3578053011670006"
    },
    {
      "label": "Alamat sesuai KTP",
      "value": "Jl. Dr. Sutomo No.17 Surabaya"
    },
    {
      "label": "Alamat Domisili",
      "value": "Seminari Tinggi Providentia Dei, Jl. Kalisari Selatan 9, Pakuwon City"
    },
    {
      "label": "Telepon",
      "value": "081283842434"
    },
    {
      "label": "email",
      "value": "nanglik@gmail.com; edilaksito@widyayuwana.ac.id  "
    },
    {
      "label": "Agama*",
      "value": "Katolik"
    },
    {
      "label": "Kewarganegaraan*",
      "value": "Indonesia"
    },
    {
      "label": "Tanggal Mulai jadi Dosen IMAVI",
      "value": "4 Agustus 2018"
    },
    {
      "label": "Status Dosen di IMAVI #",
      "value": "Dosen Biasa"
    },
    {
      "label": "Tanggal Mulai Status Dosen",
      "value": "?"
    },
    {
      "label": "NIDN/NIDK",
      "value": "0730116704"
    },
    {
      "label": "Tanggal Mulai jadi Dosen di Lembaga Lain",
      "value": "10 Desember 2015"
    },
    {
      "label": "Status Dosen di Lembaga Lain",
      "value": "Dosen Tetap di STKIP Widya Yuwana Madiun"
    },
    {
      "label": "Tanggal Mulai Status Dosen di Lembaga Lain",
      "value": ""
    },
    {
      "label": "Jabatan",
      "value": "Lektor"
    },
    {
      "label": "Tanggal Mulai",
      "value": "7 Juli 2020"
    },
    {
      "label": "Kepangkatan",
      "value": "Penata Muda Tingkat I - III/b"
    },
    {
      "label": "Tanggal Mulai",
      "value": "1 Mei 2021"
    }
  ],
  education: [{
      "jenjang": "S1",
      "bidang": "Filsafat-Teologi",
      "univ": "STFT Widya Sasana, Malang",
      "tahun": "1992",
      "judulTa": "Identitas Manusia di Alam Barat dan Alam Timur. Sebuah Studi Perbandingan"
    },
    {
      "jenjang": "S2 (Lokal)",
      "bidang": "Filsafat-Teologi",
      "univ": "STFT Widya Sasana, Malang",
      "tahun": "1995",
      "judulTa": "Poustinia: Padang Gurun Hati. Jalan Spiritual Catherine de Hueck Doherty"
    },
    {
      "jenjang": "Licentiate",
      "bidang": "Teologi Dogmatik",
      "univ": "Università della Santa Croce, Roma",
      "tahun": "2011",
      "judulTa": "La visione personalistica del male di Karol Wojtyla"
    },
    {
      "jenjang": "S3",
      "bidang": "Teologi Dogmatik",
      "univ": "University of Santo Tomas, Manila",
      "tahun": "2015",
      "judulTa": "The church as a Mystery of Communion in the Light of the Economic-Trinitarian and Anthropological Fundamentals of Lumen Gentium, Nos. 2-4"
    }
  ],
  researchInterests: [{
      id: 1,
      value: 'Teologi Dogmatik'
    },
    {
      id: 2,
      value: 'Sejarah Teologi'
    },
    {
      id: 3,
      value: 'Spiritualitas',
    }, {
      id: 4,
      value: 'Sejarah dan Pastoral Gereja Lokal (Surabaya)'
    }
  ],
  sertifications: [{
      "jenis": "Sertifikasi Dosen",
      "bidang": "Agama Katolik",
      "number": "22107304206292",
      "sk": "22-001001-0735",
      "year": "2022",
      "owner": "Kemendikbudristek",
      "result": ""
    },
    {
      "jenis": "Pekerti",
      "bidang": "Teknik Instruksional",
      "number": "",
      "sk": "306/PKT.6/PT/LL7.1/2020",
      "year": "2020",
      "owner": "LL Dikti Wilayah VII",
      "result": ""
    },
    {
      "jenis": "Tes Kemampuan Kognitif",
      "bidang": "Skolastik Dasar",
      "number": "b0febb",
      "sk": "",
      "year": "2022",
      "owner": "Fakultas Psikologi Unair",
      "result": ""
    },
    {
      "jenis": "Academic English Proficiency Test",
      "bidang": "Bahasa Inggris",
      "number": "2022016915",
      "sk": "",
      "year": "2022",
      "owner": "Pusat Bahasa Fakultas Ilmu Budaya UGM",
      "result": "262"
    }
  ],
  formatio: [{
      "jenjang": "Seminari Menengah",
      "place": "Santo Vincentius A Paulo Garum Blitar",
      "period": "1980-1987"
    },
    {
      "jenjang": "Tahun Rohani",
      "place": "Tahun Rohani Interdiosesan Malang",
      "period": "1987-1988"
    },
    {
      "jenjang": "Seminari Tinggi",
      "place": "Seminari Tinggi Interdiosesan Santo Giovanni Malang",
      "period": "1988-1995"
    },

    {
      "jenjang": "Tanggal Tahbisan Diakon",
      "place": "9 Agustus 1995",
      "period": ""
    },
    {
      "jenjang": "Tempat Tahbisan Diakon",
      "place": "Katedral Hati Kudus Yesus Surabaya",
      "period": ""
    },
    {
      "jenjang": "Tanggal Tahbisan Imamat",
      "place": "9 Januari 1996",
      "period": ""
    },
    {
      "jenjang": "Tempat Tahbisan Imamat",
      "place": "Katedral Hati Kudus Yesus Surabaya",
      "period": ""
    },
    {
      "jenjang": "Tanggal Kaul Kekal",
      "place": "-",
      "period": ""
    },
    {
      "jenjang": "Tempat Kaul Kekal",
      "place": "-",
      "period": ""
    },
    {
      "jenjang": "Afiliasi Keuskupan/Tarekat",
      "place": "Imam Diosesan Keuskupan Surabaya"
    }
  ],
  pastoral: [{
      "name": "Diakonat",
      "place": "Paroki Santo Mateus Pare",
      "period": "Agustus 1995 - Januari 1996",
      "note": "-"
    },
    {
      "name": "Pastor Rekan",
      "place": "Paroki Santo Mateus Pare",
      "period": "Januari 1996 - September 1996",
      "note": ""
    },
    {
      "name": "Pastor Mahasiswa",
      "place": "Surabaya",
      "period": "1996-2000",
      "note": ""
    },
    {
      "name": "Moderator ",
      "place": "PMKRI Sanctus Lucas Cabang Surabaya",
      "period": "1996-2000",
      "note": ""
    },
    {
      "name": "Pastor Rekan",
      "place": "Paroki Santa Maria Tak Bercela Surabaya",
      "period": "1996-2000",
      "note": ""
    },
    {
      "name": "Rektor",
      "place": "Seminari Menengah Santo Vincentius A Paulo Garum Blitar",
      "period": "2000-2007",
      "note": ""
    },
    {
      "name": "Ketua Perwakilan Seminari",
      "place": "Yayasan Yohannes Gabriel",
      "period": "2001-2007",
      "note": ""
    },
    {
      "name": "Vikaris Jendral",
      "place": "Keuskupan Surabaya",
      "period": "2007-2009",
      "note": "Tugas belajar (2009-2011)"
    },
    {
      "name": "Rektor",
      "place": "Seminari Tinggi Providentia Dei ",
      "period": "2011-2013",
      "note": "Tugas belajar (2013-2015)"
    },
    {
      "name": "Rektor",
      "place": "Seminari Tinggi Providentia Dei ",
      "period": "2015-2018",
      "note": ""
    },
    {
      "name": "Moderator ",
      "place": "PMKRI Sanctus Lucas Cabang Surabaya",
      "period": "2015-2018",
      "note": ""
    },
    {
      "name": "Dosen",
      "place": "STKIP Widya Yuwana Madiun",
      "period": "2015-sekarang",
      "note": ""
    },
    {
      "name": "Dosen",
      "place": "IMAVI",
      "period": "2018-sekarang",
      "note": ""
    },
    {
      "name": "Vice Praeses",
      "place": "IMAVI",
      "period": "2018-sekarang",
      "note": ""
    },
    {
      "name": "Formator ",
      "place": "Seminari Tinggi Providentia Dei ",
      "period": "2018-sekarang",
      "note": ""
    },
    {
      "name": "Pastor Rekan",
      "place": "Paroki Santo Marinus Yohanes, Stasi Yohanes Gabriel Perboyre",
      "period": "2020-sekarang"
    }
  ]


}