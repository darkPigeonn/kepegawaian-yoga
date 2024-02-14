import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from 'meteor/momentjs:moment';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

export const UnitKaryas = new Mongo.Collection("unitKaryas");
export const Tarekats = new Mongo.Collection("tarekats");


export const AssetChronicles = new Mongo.Collection('assetChronicles');
export const AssetDocuments = new Mongo.Collection('assetDocuments');
export const FixedAssets = new Mongo.Collection('fixedAssets',  { idGeneration: 'MONGO' } );
export const DocumentPublishers = new Mongo.Collection("documentPublishers");
export const Vehicles = new Mongo.Collection('vehicles');

export const AssetDocumentRequests = new Mongo.Collection(
  "assetDocumentRequests"
);

export const AssetDocumentStatus = [
  {
    id: 10,
    label: "Ready"
  },
  {
    id: 20,
    label: "Dipinjam"
  },
  {
    id: 30,
    label: "Hilang"
  },
]

export const RequestStatuses = [
  {
    id: 10,
    label: "Menunggu Validasi",
  },
  {
    id: 20,
    label: "Menunggu Persetujuan",
  },
  {
    id: 30,
    label: "Sudah Disetujui",
  },
  {
    id: 70,
    label: "Siap Diambil",
  },
  {
    id: 71,
    label: "Menunggu Pengembalian",
  },
  {
    id: 80,
    label: "Selesai",
  },
  {
    id: 90,
    label: "Tertolak",
  },
  ,
  {
    id: 91,
    label: "Invalid",
  },
];

export const AssetInactiveStatus = [
  {
    id: 1,
    label: "Rusak",
  },
  {
    id: 2,
    label: "Hibah",
  },
  {
    id: 3,
    label: "Dijual",
  },
];

export const FixedAssetsCategories = [
  {
    id: 11,
    label: "Tanah",
    category: "fixedAssets",
  },
  {
    id: 12,
    label: "Bangunan",
    category: "fixedAssets",
  },
];

export const VehicleCategories = [
  {
    id: 21,
    label: "Mobil",
    category: "vehicles",
  },
  {
    id: 22,
    label: "Sepeda Motor",
    category: "vehicles",
  },
];

export const CurrentAssetsCategories = [
  {
    id: 31,
    label: "Emas & Perhiasan",
    category: "currentAssets",
  },
  {
    id: 32,
    label: "Saham, Obligasi, atau Surat Berharga lainnya",
    category: "currentAssets",
  },
];

export const ParokiAssetsCategories = [
  {
    id: 41,
    label: "elektronik",
    category: "parokiAssets",
  },
  {
    id: 42,
    label: "furniture",
    category: "parokiAssets",
  },
  {
    id: 43,
    label: "perlengkapan liturgi",
    category: "parokiAssets",
  },
  {
    id: 44,
    label: "perlengkapan rumah tangga",
    category: "parokiAssets",
  },
  {
    id: 45,
    label: "perlengkapan keamanan",
    category: "parokiAssets",
  },
  {
    id: 46,
    label: "peralatan medis",
    category: "parokiAssets",
  },
  {
    id: 49,
    label: "lain-lain",
    category: "parokiAssets",
  },
];

// Akta/Sertifikat
// Surat kuasa
// Perjanjian

export const AssetDocumentOptions = [
  {
    id: "1",
    label: "SHM",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "2",
    label: "SHGB",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "10",
    label: "SIPT Jangka Pendek",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "3",
    label: "SIPT Jangka Menengah",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "20",
    label: "SIPT Jangka Panjang",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "4",
    label: "Letter C",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "5",
    label: "Petok D",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "6",
    label: "Eigendom Verponding",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  //  batas kepemilikan milik sendiri
  {
    id: "7",
    label: "Perjanjian Pinjam/Pakai",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    type: 4,
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "8",
    label: "Perjanjian Sewa",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    type: 5,
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "9",
    label: "SHM-SRS",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  
  
  {
    id: "11",
    label: "Akta Jual Beli",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "12",
    label: "Akta Hibah",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "13",
    label: "Akta Pelepasan Hak Atas Tanah",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "14",
    label: "Akta Kuasa Menjual",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "15",
    label: "Ikatan Jual Beli",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "16",
    label: "Akta Perjanjian Sewa",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "17",
    label: "Akta Kuasa Membalik Nama",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "18",
    label: "Ijin Gangguan (HO)",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },
  {
    id: "19",
    label: "Sertifikat Kepemilikan Lama",
    category: "Dokumen Peralihan Hak",
    assetCategory: "fixedAssets",
  },

  {
    id: "21",
    label: "BPKB",
    category: "Dokumen Penyerta Kendaraan",
    assetCategory: "vehicles",
  },
  {
    id: "22",
    label: "STNK",
    category: "Dokumen Penyerta Kendaraan",
    assetCategory: "vehicles",
  },
  {
    id: "23",
    label: "IMB",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    assetType: "bangunan",
    documentPelengkapType: ["kepemilikan"]
  },
  {
    id: "25",
    label: "SSPT-PBB",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    assetType: "tanah",
    documentPelengkapType: ["pembiayaan"]
  },
  {
    id: "26",
    label: "SSPD-PBB",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    assetType: "tanah",
    documentPelengkapType: ["pembiayaan"]
  },
  {
    id: "27",
    label: "Putusan",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    assetType: "tanah",
    documentPelengkapType: ["persengketaan"]
  },
  {
    id: "28",
    label: "Surat Panggilan",
    category: "Dokumen Kepemilikan",
    assetCategory: "fixedAssets",
    assetType: "tanah",
    documentPelengkapType: ["persengketaan"]
  }
];

export const AssetsDocumentTypeOptions = [
  {
    id: "1",
    label: "Autentik",
  },
  {
    id: "2",
    label: "Fotokopi Legalisir",
  },
  {
    id: "3",
    label: "Fotokopi",
  },
  {
    id: "4",
    label: "Digital",
  },
];

export const PermitTypeOptions = [
  {
    id: "23",
    label: "IMB",
    category: "Dokumen Penyerta Pembangunan",
    assetCategory: "fixedAssets",
  },
  {
    id: "24",
    label: "Ijin Operasional",
    category: "Dokumen Penyerta Pembangunan",
    assetCategory: "fixedAssets",
  },
];

export const OrganizationDocumentTypeOptions = [
  {
    id: 1,
    label: "Akta Pendirian",
    category: ["unitKarya"]
  },
  {
    id: 2,
    label: "Akta Perubahan",
    category: ["unitKarya", "keuskupan"]
  },
  {
    id: 3,
    label: "AD/ART",
    category: ["unitKarya"]
  },
  {
    id: 4,
    label: "SK Menkumham",
    category: ["unitKarya", "paroki", "keuskupan"]
  },
  {
    id: 5,
    label: "BNRI",
    category: ["unitKarya", "paroki", "keuskupan"]
  },
  {
    id: 6,
    label: "Dekrit Pendirian",
    category: ["unitKarya", "paroki", "keuskupan", "tarekat"]
  },
  {
    id: 7,
    label: "Conventio Scripta",
    category: ["tarekat"]
  },
  {
    id: 8,
    label: "Bulla",
    category: ["unitKarya", "keuskupan"]
  }, 
  {
    id: 9,
    label: "SK Keuskupan",
    category: ["keuskupan"]
  }, 
];

export const DioceseDocumentTypeOptions = [
  {
    id: 1,
    label: "Bulla & Terjemahannya",
  },
  {
    id: 2,
    label: "SK Dirjen Agraria",
  },
];

export const AktaPeralihanHakTypeOptions = [];

export const JenisPerolehanAssetOptions = [
  {
    id: 1,
    label: "Jual/Beli",
    type: "1"
  },
  {
    id: 2,
    label: "Hibah",
    type: "1"
  },
  {
    id: 3,
    label: "Warisan",
    type: "1"
  },
  {
    id: 4,
    label: "Pinjam Pakai",
    type: "2"
  },
  {
    id: 5,
    label: "Sewa",
    type: "2"
  },
];

export const ParokiAssetsStatuses = [
  {
    id: 10,
    label: "efektif",
  },
  {
    id: 20,
    label: "rusak",
  },
  {
    id: 30,
    label: "keluar",
  },
  {
    id: 31,
    label: "Keluar Dipinjam",
  },
  {
    id: 32,
    label: "Keluar Diservis",
  },
  {
    id: 40,
    label: "Untuk Didonasikan",
  },
  {
    id: 41,
    label: "Untuk Dijual",
  },
  ,
  {
    id: 99,
    label: "Tidak Diketahui",
  },
];

export const TemporaryDocumentStorageLocations = [
  {
    _id: "A1",
    label: "A1",
    name: "A1",
    note: "",
  },
  {
    _id: "A2",
    label: "A2",
    name: "A2",
    note: "",
  },
  {
    _id: "A3",
    label: "A3",
    name: "A3",
    note: "",
  },
  {
    _id: "A4",
    label: "A4",
    name: "A4",
    note: "",
  },
  {
    _id: "B1",
    label: "B1",
    name: "B1",
    note: "",
  },
  {
    _id: "B2",
    label: "B2",
    name: "B2",
    note: "",
  },
  {
    _id: "B3",
    label: "B3",
    name: "B3",
    note: "",
  },
  {
    _id: "B4",
    label: "B4",
    name: "B4",
    note: "",
  },
  {
    _id: "C1",
    label: "C1",
    name: "C1",
    note: "",
  },
  {
    _id: "C2",
    label: "C2",
    name: "C2",
    note: "",
  },
  {
    _id: "C3",
    label: "C3",
    name: "C3",
    note: "",
  },
  {
    _id: "C4",
    label: "C4",
    name: "C4",
    note: "",
  },
];

export const FormStatuses = [
  {
    id: 10,
    label: "Menunggu Aksi",
  },
  {
    id: 70,
    label: "Disetujui",
  },
  {
    id: 80,
    label: "Selesai",
  },
  {
    id: 90,
    label: "Tertolak",
  },
];