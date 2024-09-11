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
