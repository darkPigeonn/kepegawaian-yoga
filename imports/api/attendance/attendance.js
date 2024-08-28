import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

import moment from "moment";
import SimpleSchema from "simpl-schema";

SimpleSchema.extendOptions([
    "autoform",
    "index",
    "denyInsert",
    "denyUpdate",
    "defaultValue",
]);

// SimpleSchema.setDefaultMessages({
//     initialLanguage: "en",
//     messages: {
//         en: {
//         uploadError: "{{ value }}", //File-upload
//         },
//     },
// });

export const StaffsAttendance = new Mongo.Collection("staffsAttendance");
export const Permits = new Mongo.Collection("permits");
export const MonthlyAttendance = new Mongo.Collection("monthlyAttendances");
export const ClockShifts = new Mongo.Collection("clockShifts");
export const ScheduleAttendance = new Mongo.Collection("scheduleAttendance");
export const Partner = new Mongo.Collection( 'partners');
export const ConfigAttendanceUser = new Mongo.Collection(
  "configAttendanceUser"
);


export const statusPermits = [
  { code: 10, label: "Menunggu Persetujuan" },
  { code: 20, label: "Diterima" },
  { code: 99, label: "Ditolak" },
];