import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const Jubileum = new Mongo.Collection("jubileum", {
  idGeneration: "MONGO",
});
export const Rehan = new Mongo.Collection("rehan", { idGeneration: "MONGO" });

export const KevikepanStruktur = new Mongo.Collection("kevikepanStrukturs");
export const ChronicleKevikepans = new Mongo.Collection("chronicleKevikepans");

export const ParokiKevikepans = new Mongo.Collection("parokiKevikepans");

export const IntermarriageRequests = new Mongo.Collection(
  "intermarriageRequests"
);

export const OrganizationDocuments = new Mongo.Collection(
  "organizationDocuments"
);

export const Kevikepans = [
  {
    id: 1,
    kevikepan: "Blora",
    province: "Jawa Timur"
  },
  {
    id: 2,
    kevikepan: "Mojokerto",
    province: "Jawa Timur"
  },
  {
    id: 3,
    kevikepan: "Surabaya Barat",
    province: "Jawa Timur"
  },
  {
    id: 4,
    kevikepan: "Surabaya Utara",
    province: "Jawa Timur"
  },
  {
    id: 5,
    kevikepan: "Surabaya Selatan",
    province: "Jawa Timur"
  },
  {
    id: 6,
    kevikepan: "Kediri",
    province: "Jawa Timur"
  },
  {
    id: 7,
    kevikepan: "Blitar",
    province: "Jawa Timur"
  },
  {
    id: 8,
    kevikepan: "Madiun",
    province: "Jawa Timur"
  },
];

export const ChronicleKevikepanCategories = [
  {
    _id: 1,
    name: "Kegiatan Romo Vikep",
  },
  {
    _id: 2,
    name: "Kegiatan Forum Pastoral Kevikepan",
  },
  {
    _id: 3,
    name: "Kegiatan Forum Pastoral Serumpun",
  },
  {
    _id: 4,
    name: "Forum Kolegalita Imam",
  },
  {
    _id: 5,
    name: "Kegiatan Kevikepan Lainnya",
  },
];

export const MarriageType = [
  { id: 1, label: "Katolik Dengan Katolik" },
  { id: 2, label: "Katolik Dengan Protestan" },
  { id: 3, label: "Katolik Dengan Buddha" },
  { id: 4, label: "Katolik Dengan Hindu" },
  { id: 5, label: "Katolik Dengan Islam" },
  { id: 6, label: "Katolik Dengan Konghucu" },
  { id: 7, label: "Katolik Dengan Lainnya" },
];

export const MarriageLicense = [
  {
    id: 1,
    label: "Dispensasi Pernikahan",
  },
  {
    id: 2,
    label: "Pernikahan Beda Gereja",
  },
  {
    id: 3,
    label: "Pernikahan Beda Agama (Benedictio)",
  },
];

export const Religion = [
  { id: 1, label: "Katolik" },
  { id: 2, label: "Protestan" },
  { id: 3, label: "Buddha" },
  { id: 4, label: "Islam" },
  { id: 5, label: "Hindu" },
  { id: 6, label: "Konghucu" },
  { id: 7, label: "Kepercayaan" },
  { id: 8, label: "Katekumen" },
];

export const Pastors = [
  {
    _id: "1",
    fullname: "Pastor Coba 1",
  },
  {
    _id: "2",
    fullname: "Pastor Coba 2",
  },
  {
    _id: "3",
    fullname: "Pastor Coba 3",
  },
  {
    _id: "4",
    fullname: "Pastor Coba 4",
  },
  {
    _id: "5",
    fullname: "Pastor Coba 5",
  },
  {
    _id: "6",
    fullname: "Pastor Coba 6",
  },
  {
    _id: "7",
    fullname: "Pastor Coba 7",
  },
];
