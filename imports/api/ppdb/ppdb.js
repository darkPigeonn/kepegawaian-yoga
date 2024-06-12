import { Mongo } from "meteor/mongo";

export const Registrans = new Mongo.Collection("registrans");
export const VirtualAccounts = new Mongo.Collection("virtualAccounts");
export const PeriodePpdb = new Mongo.Collection("periodePPDB");
export const VirtualAccountsConfig = new Mongo.Collection(
  "virtualAccountsConfig"
);
export const Gelombangs = new Mongo.Collection("gelombangs");
export const PaymentsConfig = new Mongo.Collection("paymentsConfig");
export const RegistransDummy = [
  {
    fullName: "Ahmad Fauzi",
    nis: "20230001",
    address: "Jl. Merdeka No. 1, Jakarta",
    dob: "2008-03-15",
    status: 54,
  },
  {
    fullName: "Siti Nurhaliza",
    nis: "20230002",
    address: "Jl. Sudirman No. 2, Bandung",
    dob: "2007-05-22",
    status: 45,
  },
  {
    fullName: "Budi Santoso",
    nis: "20230003",
    address: "Jl. Gatot Subroto No. 3, Surabaya",
    dob: "2009-09-12",
    status: 38,
  },
  {
    fullName: "Dewi Anggraini",
    nis: "20230004",
    address: "Jl. Diponegoro No. 4, Yogyakarta",
    dob: "2010-01-18",
    status: 50,
  },
  {
    fullName: "Eko Prasetyo",
    nis: "20230005",
    address: "Jl. Ahmad Yani No. 5, Semarang",
    dob: "2008-06-25",
    status: 39,
  },
  {
    fullName: "Fajar Ramadhan",
    nis: "20230006",
    address: "Jl. Sultan Agung No. 6, Medan",
    dob: "2007-11-30",
    status: 46,
  },
  {
    fullName: "Gita Anjani",
    nis: "20230007",
    address: "Jl. Sisingamangaraja No. 7, Palembang",
    dob: "2009-08-05",
    status: 52,
  },
];
