import { Mongo } from "meteor/mongo";
import { Index, MinimongoEngine, MongoDBEngine } from "meteor/easy:search";
import moment from "moment";
import _ from "underscore";
import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";

import { PeriodeStudis } from "./collections.js";
import { bakulFiles } from "./collections-files.js";
import { profilePics } from "./collections-files.js";
import { rpsUploads } from "./collections-files.js";
import { studentUploads } from "./collections-files.js";
import { taImages } from "./collections-files.js";

SimpleSchema.extendOptions(["autoform", "index", "denyInsert", "denyUpdate"]);

export const Meetings = new Mongo.Collection("meetings");

MeetingsSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Nama/Nomor Pertemuan",
  },
  description: {
    type: String,
    label: "Deskripsi Pertemuan",
    optional: true,
  },
  ujianId: {
    type: String,
    label: "Ujian ID",
    optional: true,
  },
  datePublish: Date,
  psId: {
    type: String,
    optional: true,
  },
  amkId: String,
  amkName: String,
  bakuls: {
    type: Array,
    label: "Materi Kuliah", // <- Optional,
    optional: true,
  },
  "bakuls.$": {
    type: Object,
    label: "Materi Kuliah", // <- Optional
    optional: true,
  },
  "bakuls.$.title": {
    type: String,
    label: "Judul",
    optional: true,
  },
  "bakuls.$.timestamp": {
    type: Date,
    label: "Tanggal Upload",
    optional: true,
    autoValue: function () {
      return new Date();
    },
    autoform: {
      type: "hidden",
    },
  },
  "bakuls.$.description": {
    type: String,
    label: "Deskripsi",
    optional: true,
    autoform: {
      rows: 3,
    },
  },
  "bakuls.$.file": {
    type: String,
    optional: true,
    label: "Upload File",
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "bakulFiles",
        insertConfig: {
          // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: "ddp",
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true,
        },
      },
    },
  },
  boardMessages: {
    type: Array,
    label: "Percakapan dalam pertemuan",
    optional: true,
  },
  "boardMessages.$": {
    type: Object,
    optional: true,
  },
  "boardMessages.$._id": {
    type: String,
    optional: true,
    label: "ID",
  },
  "boardMessages.$.name": {
    type: String,
    optional: true,
    label: "Nama Peserta",
  },
  "boardMessages.$.userId": {
    type: String,
    optional: true,
    label: "ID Peserta",
  },
  "boardMessages.$.email": {
    type: String,
    optional: true,
    label: "Email Peserta",
  },
  "boardMessages.$.message": {
    type: String,
    optional: true,
    label: "Isi pesan",
  },
  "boardMessages.$.role": {
    type: String,
    optional: true,
    label: "Peran User",
  },
  "boardMessages.$.timestamp": {
    type: Date,
    optional: true,
    label: "timestamp",
  },
  "boardMessages.$.acknowledged": {
    type: Boolean,
    optional: true,
    label: "Acknowledged",
  },
  "boardMessages.$.thread": {
    type: Array,
    optional: true,
  },
  "boardMessages.$.thread.$": {
    type: Object,
    optional: true,
  },
  "boardMessages.$.thread.$.name": {
    type: String,
    optional: true,
    label: "Nama Peserta",
  },
  "boardMessages.$.thread.$.userId": {
    type: String,
    optional: true,
    label: "ID Peserta",
  },
  "boardMessages.$.thread.$.email": {
    type: String,
    optional: true,
    label: "Email Peserta",
  },
  "boardMessages.$.thread.$.message": {
    type: String,
    optional: true,
    label: "Isi pesan",
  },
  "boardMessages.$.timestamp": {
    type: Date,
    optional: true,
    label: "timestamp",
  },
});

// Meetings.attachSchema( MeetingsSchema );

export const MataKuliahs = new Mongo.Collection("mataKuliahs");

MataKuliahsSchema = new SimpleSchema({
  name: {
    type: String,
    label: "nama mata kuliah",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  nameEn: {
    type: String,
    label: "nama mata kuliah (English)",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  code: {
    type: String,
    optional: true,
    label: "KODE mata kuliah",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  tingkat: {
    type: Number,
    optional: true,
    label: "tingkat terkait",
    allowedValues: [1, 2, 3, 4, 5, 6],
  },
  jumlahSKS: {
    type: Number,
    label: "Jumlah SKS",
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  // "tingkatId": {
  //   type: Number,
  //   label: "",
  //   optional: true
  // },
});

MataKuliahs.attachSchema(MataKuliahsSchema);

export const scoringOptions = [
  {
    value: 1,
    label: "Tugas + Quiz + UTS + UAS",
  },
  {
    value: 2,
    label: "Tugas + UTS + UAS",
  },
  {
    value: 3,
    label: "Quiz + UTS + UAS",
  },
  {
    value: 4,
    label: "UTS + UAS",
  },
];

export const hariKuliahs = [
  {
    value: 1,
    label: "Senin",
  },
  {
    value: 2,
    label: "Selasa",
  },
  {
    value: 3,
    label: "Rabu",
  },
  {
    value: 4,
    label: "Kamis",
  },
  {
    value: 5,
    label: "Jumat",
  },
  // {
  //   value: 6,
  //   label: "Sabtu"
  // },
];

export const tingkatOptions = [
  {
    value: 0,
    label: "Mahasiswa Pendengar",
  },
  {
    value: 1,
    label: "Filosofan 1",
  },
  {
    value: 2,
    label: "Filosofan 2",
  },
  {
    value: 3,
    label: "Teologan 1",
  },
  {
    value: 4,
    label: "Teologan 2",
  },
  {
    value: 5,
    label: "Teologan 3",
  },
  {
    value: 6,
    label: "Teologan 4",
  },
  {
    value: 7,
    label: "Diakonat",
  },
  {
    value: 30,
    label: "Alumnus",
  },
  {
    value: 90,
    label: "Dropout",
  },
];

export const ActiveMatkuls = new Mongo.Collection("activeMatkuls");

export const AcmatkulIndex = new EasySearch.Index({
  collection: ActiveMatkuls,
  fields: ["name", "matkulName", "dosenName"],
  engine: new EasySearch.Minimongo(),
});

ActiveMatkulsSchema = new SimpleSchema({
  name: {
    type: String,
    label: "nama mata kuliah ini",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  matkulId: {
    type: String,
    optional: true,
    label: "Mata kuliah",
    autoform: {
      type: "select2",
      options: function () {
        return MataKuliahs.find().map(function (c) {
          let theLabel = c.name + " - " + c.code;
          return { label: theLabel, value: c._id };
        });
      },
    },
  },
  matkulName: {
    type: String,
    optional: true,
    label: "Nama mata kuliah",
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      // let matkulId = this.siblingField("matkulId");
      // let thisMatkul = MataKuliahs.findOne({
      //   "_id": matkulId.value
      // });
      // if ( matkulId.isSet ) {
      // return thisMatkul.name;
      // } else {
      // this.unset();
      // }
    },
  },
  code: {
    type: String,
    optional: true,
    label: "KODE mata kuliah",
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let matkulId = this.siblingField("matkulId");
    //   let thisMatkul = MataKuliahs.findOne({
    //     "_id": matkulId.value
    //   });
    //   // if ( matkulId.isSet ) {
    //     return thisMatkul.code;
    //   // } else {
    //   //   this.unset();
    //   // }
    // }
  },
  psId: {
    type: String,
    optional: true,
    label: "tahun akademik",
    autoform: {
      // type: "hidden"
      type: "select2",
      options: function () {
        return PeriodeStudis.find().map(function (c) {
          // let theLabel = c.name + " - " + c.code;
          return { label: c.name, value: c._id };
        });
      },
    },
    //   autoValue: function(){
    //     let activePs = PeriodeStudis.findOne({
    //       "status": true
    //     });
    //     return activePs._id;
    //   }
  },
  psName: {
    type: String,
    optional: true,
    label: "Nama tahun akademik",
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let psId = this.siblingField("psId");
    //   let thisPs = PeriodeStudis.findOne({
    //     "_id": psId.value
    //   });
    //   if ( this.isInsert  ){
    //     let activePs = PeriodeStudis.findOne({
    //       "status": true
    //     });
    //     return activePs.name;
    //   } else if ( psId.isSet ) {
    //     return thisPs.name;
    //   } else {
    //     this.unset();
    //   }
    // }
  },
  dosenId: {
    type: String,
    optional: true,
    label: "dosen",
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  dosenName: {
    type: String,
    optional: true,
    label: "Nama dosen",
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      // let dosenId = this.siblingField("dosenId");
      // let thisdosen = Meteor.users.findOne({
      //   "_id": dosenId.value
      // });
      // if ( dosenId.isSet ) {
      // return thisdosen.fullname;
      // } else {
      //   this.unset();
      // }
    },
  },
  venue: {
    type: String,
    optional: true,
    label: "Ruang Kelas",
  },
  tingkat: {
    type: Array,
    optional: true,
    label: "Tingkat",
  },
  "tingkat.$": {
    type: Number,
    optional: true,
    label: "Tingkat",
    autoform: {
      options: tingkatOptions,
      // type: "select2",
    },
  },
  scheduleDay: {
    type: Number,
    optional: true,
    label: "Hari Kuliah",
    autoform: {
      type: "select2",
      options: function () {
        return hariKuliahs.map(function (c) {
          return { label: c.label, value: c.value };
        });
      },
    },
  },
  scheduleTime: {
    type: String,
    optional: true,
    label: "Waktu/Jam Kuliah",
  },
  jumlahSKS: {
    type: Number,
    label: "Jumlah SKS",
    optional: true,
  },
  scoringScheme: {
    type: Number,
    label: "Sistem Penilaian",
    optional: true,
    defaultValue: 1,
    autoform: {
      options: scoringOptions,
    },
  },
  note: {
    type: String,
    label: "Catatan",
    optional: true,
    autoform: {
      rows: 3,
    },
  },
  students: {
    type: Array,
    optional: true,
  },
  "students.$": {
    type: Object,
    optional: true,
  },
  "students.$.studentId": {
    type: String,
    optional: true,
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: { $in: ["student"] },
          })
          .map(function (c) {
            let theLabel = c.fullname + " - " + c.tingkat;
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "students.$.name": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let studentId = this.siblingField("studentId");
    //   let thisstudent = Meteor.users.findOne({
    //     "_id": studentId.value
    //   });
    //   if ( studentId.isSet && typeof thisstudent.fullname === "string" ) {
    //     return thisstudent.fullname;
    //   } else {
    //     this.unset();
    //   }
    // }
  },
  "students.$.fullname": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let studentId = this.siblingField("studentId");
    //   let thisstudent = Meteor.users.findOne({
    //     "_id": studentId.value
    //   });
    //   if ( studentId.isSet && typeof thisstudent.fullname === "string" ) {
    //     return thisstudent.fullname;
    //   } else {
    //     this.unset();
    //   }
    // }
  },
  "students.$.tingkat": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    // let studentId = this.siblingField("studentId");
    // let thisstudent = Meteor.users.findOne({
    //   "_id": studentId.value
    // });
    // if ( typeof thisstudent.tingkat === "string" ) {
    //   return thisstudent.tingkat;
    // } else {
    //   this.unset();
    // }
    // }
  },
  "students.$.sts": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.sas": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },

  scores: {
    type: Array,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$": {
    type: Object,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.studentId": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.fullname": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.tugas": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.quiz": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.uts": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.uas": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.sts": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.sas": {
    type: Number,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "scores.$.notes": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },

  ujians: {
    type: Array,
    optional: true,
  },
  "ujians.$": {
    type: Object,
    optional: true,
  },
  "ujians.$._id": {
    type: String,
    optional: true,
    label: "ID ujian sheet",
  },
  syllabus: {
    type: Array,
    optional: true,
  },
  "syllabus.$": {
    type: Object,
    optional: true,
  },
  "syllabus.$.topic": {
    type: String,
    optional: true,
    label: "Topik",
  },
  "syllabus.$.description": {
    type: String,
    optional: true,
    label: "Bahasan",
    autoform: {
      rows: 3,
    },
  },
  "syllabus.$.note": {
    type: String,
    optional: true,
    label: "Pelaksanaan",
    autoform: {
      rows: 3,
    },
  },
  rps: {
    type: Object,
    optional: true,
  },
  "rps.description": {
    type: String,
    optional: true,
    label: "deskripsi mata kuliah",
    autoform: {
      rows: 3,
    },
  },
  "rps.objective": {
    type: String,
    optional: true,
    label: "Capaian Pembelajaran",
    autoform: {
      rows: 3,
    },
  },
  "rps.readings": {
    type: String,
    optional: true,
    label: "sumber pustaka",
    autoform: {
      rows: 3,
    },
  },
  "rps.activities": {
    type: String,
    optional: true,
    label: "sumber pustaka",
    autoform: {
      rows: 3,
    },
  },
  "rps.tasks": {
    type: String,
    optional: true,
    label: "Rincian tugas",
    autoform: {
      rows: 3,
    },
  },
  "rps.assessment": {
    type: String,
    optional: true,
    label: "kriteria penilaian hasil belajar",
    autoform: {
      rows: 3,
    },
    // defaultValue: '<table style="width: 100%;" class="table table-bordered"><tbody><tr><td style="width: 50.0000%;">tugas</td><td style="width: 50.0000%;"></td></tr><tr><td style="width: 50.0000%;">test/quiz</td><td style="width: 50.0000%;"></td></tr><tr><td style="width: 50.0000%;">uts</td><td style="width: 50.0000%;"><br></td></tr><tr><td style="width: 50.0000%;">uas</td><td style="width: 50.0000%;"><br></td></tr><tr><td style="width: 50.0000%;">total</td><td style="width: 50.0000%;">100</td></tr></tbody></table>'
  },
  "rps.approach": {
    type: String,
    optional: true,
    label: "Rincian Kegiatan",
    autoform: {
      rows: 3,
    },
  },
  "rps.enrichmentReferences": {
    type: String,
    optional: true,
    label: "referensi pengayaan",
    autoform: {
      rows: 3,
    },
  },
  "rps.validations": {
    type: Object,
    optional: true,
    label: "Validasi",
  },
  "rps.validations.preparedBy": {
    type: String,
    optional: true,
    label: "Dipersiapkan oleh",
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "rps.validations.assessedBy": {
    type: String,
    optional: true,
    label: "Diperiksa oleh",
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "rps.validations.approvedBy": {
    type: String,
    optional: true,
    label: "Disetujui oleh",
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "rps.upload": {
    type: String,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "rpsUploads",
        // uploadTemplate: 'uploadField', // <- Optional
        // previewTemplate: 'uploadPreview', // <- Optional
        insertConfig: {
          // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: "ddp",
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true,
        },
      },
    },
  },
  bakuls: {
    type: Array,
    label: "Materi Kuliah", // <- Optional,
    optional: true,
  },
  "bakuls.$": {
    type: Object,
    label: "Materi Kuliah", // <- Optional
    optional: true,
  },
  "bakuls.$.title": {
    type: String,
    label: "Judul",
    optional: true,
  },
  "bakuls.$.timestamp": {
    type: Date,
    label: "Tanggal Upload",
    optional: true,
    autoValue: function () {
      return new Date();
    },
    autoform: {
      type: "hidden",
    },
  },
  "bakuls.$.description": {
    type: String,
    label: "Deskripsi",
    optional: true,
    autoform: {
      rows: 3,
    },
  },
  "bakuls.$.file": {
    type: String,
    optional: true,
    label: "Upload File",
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "bakulFiles",
        insertConfig: {
          // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: "ddp",
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true,
        },
      },
    },
  },

  meetings: {
    type: Array,
    optional: true,
  },
  "meetings.$": {
    type: Object,
    optional: true,
  },
  "meetings.$.mId": {
    type: String,
    optional: true,
  },
  "meetings.$.name": {
    type: String,
    optional: true,
  },

  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  displayOrder: {
    type: Number,
    optional: true,
    defaultValue: 0,
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
});

ActiveMatkuls.attachSchema(ActiveMatkulsSchema);

export const ujianTypeOptions = [
  {
    value: 1,
    label: "Tugas",
  },
  {
    value: 2,
    label: "Quiz/test",
  },
  {
    value: 3,
    label: "UTS",
  },
  {
    value: 4,
    label: "UAS",
  },
];

export const Ujians = new Mongo.Collection("ujians");

UjiansSchema = new SimpleSchema({
  name: {
    type: String,
    label: "nama ujian",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  dateStart: {
    type: Date,
    label: "Tanggal Mulai",
  },
  dateEnd: {
    type: Date,
    label: "Tanggal Selesai",
  },
  time: {
    type: String,
    label: "Waktu Ujian",
    autoform: {},
  },
  typeUjian: {
    type: Number,
    label: "Tipe Ujian",
    autoform: {
      options: ujianTypeOptions,
    },
  },
  instructionUjian: {
    type: String,
    label: "Perintah pengerjaan ujian",
    autoform: {
      rows: 2,
    },
  },
  soalUjian: {
    type: String,
    label: "Soal Ujian",
    autoform: {
      rows: 3,
    },
  },
  note: {
    type: String,
    optional: true,
    label: "Catatan",
    autoform: {
      rows: 3,
    },
  },
  activeMatkulId: {
    type: String,
    optional: true,
    label: "ID mata kuliah",
    autoform: {
      type: "hidden",
    },
  },
  activeMatkulName: {
    type: String,
    optional: true,
    label: "Nama mata kuliah",
    autoform: {
      type: "hidden",
    },
  },
  matkulId: {
    type: String,
    optional: true,
    label: "ID mata kuliah",
    autoform: {
      type: "hidden",
    },
  },
  matkulName: {
    type: String,
    optional: true,
    label: "Nama mata kuliah",
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let matkulId = this.siblingField("matkulId");
    //   let thisMatkul = MataKuliahs.findOne({
    //     "_id": matkulId.value
    //   });
    //   if ( matkulId.isSet ) {
    //     return thisMatkul.name;
    //   } else {
    //     this.unset();
    //   }
    // }
  },
  psId: {
    type: String,
    optional: true,
    label: "ID tahun akademik",
    autoform: {
      type: "hidden",
    },
  },
  psName: {
    type: String,
    optional: true,
    label: "Nama tahun akademik",
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      let psId = this.siblingField("psId");
      let thisPs = PeriodeStudis.findOne({
        _id: psId.value,
      });
      if (psId.isSet) {
        return thisPs.name;
      } else {
        this.unset();
      }
    },
  },
  uploadStatus: {
    type: Boolean,
    optional: true,
    label: "Apakah ujian ini menerima unggahan dokumen?",
    defaultValue: false,
    autoform: {
      type: "boolean-radios",
      trueLabel: "Ya",
      falseLabel: "Tidak",
    },
  },
  dosenId: {
    type: String,
    optional: true,
    label: "ID dosen",
    autoform: {
      type: "hidden",
    },
  },
  dosenName: {
    type: String,
    optional: true,
    label: "Nama dosen",
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      let dosenId = this.siblingField("dosenId");
      let thisdosen = Meteor.users.findOne({
        _id: dosenId.value,
      });
      if (dosenId.isSet) {
        return thisdosen.fullname;
      } else {
        this.unset();
      }
    },
  },
  students: {
    type: Array,
    optional: true,
  },
  "students.$": {
    type: Object,
    optional: true,
  },
  "students.$.studentId": {
    type: String,
    optional: true,
    label: "student",
  },
  "students.$.fullname": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.answer": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.dateSubmitted": {
    type: Date,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.dateGraded": {
    type: Date,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.score": {
    type: Number,
    optional: true,
  },
  "students.$.grader": {
    type: String,
    optional: true,
  },
  "students.$.scoreWM": {
    type: Number,
    optional: true,
  },
  "students.$.note": {
    type: String,
    optional: true,
    autoform: {
      type: "hidden",
    },
  },
  "students.$.attempt": {
    type: Number,
    defaultValue: 0,
  },
  "students.$.timePassed": {
    type: Number,
    defaultValue: 0,
  },
  "students.$.ujianFile": {
    type: Array,
    label: "Jawaban", // <- Optional,
    optional: true,
  },
  "students.$.ujianFile.$": {
    type: Object,
    label: "Jawaban", // <- Optional
    optional: true,
  },
  "students.$.ujianFile.$.title": {
    type: String,
    label: "Judul",
    optional: true,
  },
  "students.$.ujianFile.$.timestamp": {
    type: Date,
    label: "Tanggal Upload",
    optional: true,
    autoValue: function () {
      return new Date();
    },
    autoform: {
      type: "hidden",
    },
  },
  "students.$.ujianFile.$.editedId": {
    type: String,
    label: "editedId",
    optional: true,
  },
  "students.$.ujianFile.$.editedJson": {
    type: String,
    label: "editedJson",
    optional: true,
  },
  "students.$.ujianFile.$.description": {
    type: String,
    label: "Deskripsi",
    optional: true,
    autoform: {
      rows: 3,
    },
  },
  "students.$.ujianFile.$.fileId": {
    type: String,
    optional: true,
    label: "Upload File",
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "bakulFiles",
        insertConfig: {
          // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: "ddp",
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true,
        },
      },
    },
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
});

Ujians.attachSchema(UjiansSchema);

export const predicateOptions = [
  {
    value: 1,
    label: "Summa Cum Laude",
  },
  {
    value: 2,
    label: "Magna Cum Laude",
  },
  {
    value: 3,
    label: "Cum Laude",
  },
  {
    value: 4,
    label: "Bene Probatus",
  },
  {
    value: 5,
    label: "Probatus",
  },
  {
    value: 6,
    label: "Non Probatus",
  },
];

export const TugasAkhirs = new Mongo.Collection("tugasAkhirs");

TugasAkhirsSchema = new SimpleSchema({
  studentId: {
    type: String,
    label: "Student",
    autoform: {
      type: "select2",
      options: function () {
        return Meteor.users
          .find({
            roles: { $nin: ["formator", "superadmin", "admin", "dosen"] },
          })
          .map(function (c) {
            let theLabel =
              c.username + " ( " + c.fullname + " )" + " - " + c.tingkat;
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  noPokok: {
    type: String,
    label: "Nomor Pokok",
    optional: true,
    autoform: {
      type: "hidden",
    },
    // autoValue: function(){
    //   let thisStudentId = this.siblingField("studentId").value;
    //   let thisStudent = Meteor.users.findOne({
    //     "_id": thisStudentId
    //   });
    //   let noPokok = thisStudent.noPokok;
    //   if (noPokok) {
    //     return noPokok;
    //   } else {
    //     return "N/A"
    //   }
    // }
  },
  psId: {
    type: String,
    label: "Periode Studi",
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      let activePs = PeriodeStudis.findOne({
        status: true,
      });
      return activePs._id;
    },
  },
  noID: {
    type: String,
    label: "nomor seri tugas akhir",
    optional: true,
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  title: {
    type: String,
    label: "Judul tugas akhir",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    },
  },
  date: {
    type: Date,
    label: "Tanggal",
    optional: true,
  },
  venue: {
    type: String,
    label: "Tempat Ujian",
    optional: true,
  },
  score1: {
    type: Number,
    label: "Nilai penguji 1",
    optional: true,
  },
  score2: {
    type: Number,
    label: "Nilai penguji 2",
    optional: true,
  },
  relativeScore: {
    type: Number,
    label: "Nilai Relatif",
    optional: true,
  },
  predicate: {
    type: String,
    label: "Predikat",
    optional: true,
    allowedValues: [
      "Summa Cum Laude",
      "Magna Cum Laude",
      "Cum Laude",
      "Bene Probatus",
      "Probatus",
      "Non Probatus",
    ],
  },
  revisionStatus: {
    type: Boolean,
    label: "Revisi",
    optional: true,
    autoform: {
      type: "boolean-radios",
      trueLabel: "Dengan Revisi",
      falseLabel: "Tanpa Revisi",
    },
  },
  panitiaPenguji: {
    type: Array,
    label: "Panitia Penguji",
    optional: true,
  },
  "panitiaPenguji.$": {
    type: Object,
    label: "Panitia Penguji",
    optional: true,
  },
  "panitiaPenguji.$.userId": {
    type: String,
    label: "Dosen",
    optional: true,
    autoform: {
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "panitiaPenguji.$.jabatan": {
    type: String,
    label: "Jabatan",
    optional: true,
    allowedValues: ["ketua", "sekretaris", "anggota"],
  },
  dosenPembimbing: {
    type: Array,
    label: "Dosen Pembimbing",
    optional: true,
  },
  "dosenPembimbing.$": {
    type: Object,
    label: "Dosen Pembimbing",
    optional: true,
  },
  "dosenPembimbing.$.userId": {
    type: String,
    label: "Dosen",
    optional: true,
    autoform: {
      options: function () {
        return Meteor.users
          .find({
            roles: "dosen",
          })
          .map(function (c) {
            let theLabel = c.username + " ( " + c.fullname + " )";
            return { label: theLabel, value: c._id };
          });
      },
    },
  },
  "dosenPembimbing.$.jabatan": {
    type: String,
    label: "Jabatan",
    optional: true,
    allowedValues: [
      "Pembimbing Tunggal",
      "Pembimbing I",
      "Pembimbing II",
      "Pembimbing III",
    ],
  },
  picture: {
    type: String,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "fileUpload",
        collection: "taImages",
        // uploadTemplate: 'uploadField', // <- Optional
        // previewTemplate: 'uploadPreview', // <- Optional
        insertConfig: {
          // <- Optional, .insert() method options, see: https://github.com/VeliovGroup/Meteor-Files/wiki/Insert-(Upload)
          meta: {},
          isBase64: false,
          transport: "ddp",
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true,
        },
      },
    },
  },
});

TugasAkhirs.attachSchema(TugasAkhirsSchema);

export const Announcements = new Mongo.Collection("announcements");

AnnouncementsSchema = new SimpleSchema({
  activeMatkulId: {
    type: String,
    label: "Mata Kuliah Aktif",
    optional: true,
    autoform: {
      type: "select2",
      options: function () {
        return ActiveMatkuls.find().map(function (c) {
          return { label: c.name, value: c._id };
        });
      },
    },
  },
  title: {
    type: String,
    label: "Judul",
    optional: true,
  },
  description: {
    type: String,
    label: "Deskripsi",
    autoform: {
      rows: 3,
    },
  },
  dateStart: {
    type: Date,
    label: "Tanggal Mulai",
    optional: true,
    defaultValue: new Date(),
  },
  dateEnd: {
    type: Date,
    label: "Tanggal Berakhir",
    optional: true,
    defaultValue: null,
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
});

// Announcements.attachSchema(AnnouncementsSchema);

export const Curricula = new Mongo.Collection("curricula");

// CurriculaSchema = new SimpleSchema({
//   "matkuls": {
//     type: Array,
//     label: "Mata Kuliah",
//     optional: true,
//   },
//     "matkuls.$": {
//       type: Object,
//       label: "Mata Kuliah",
//       optional: true,
//     },
//     "matkuls.$.mkId": {
//       type: String,
//       label: "Mata Kuliah",
//       optional: true,
//       autoform: {
//         type: "select2",
//         options: function(){
//           return MataKuliahs.find().map(function (c) {
//             return {label: c.name, value: c._id};
//           });
//         }
//       },
//     },
//     "matkuls.$.code": {
//       type: String,
//       label: "KODE Mata Kuliah",
//       optional: true,
//       autoform: {
//         type: "hidden",
//       },
//     },
//     "matkuls.$.name": {
//       type: String,
//       label: "Nama Mata Kuliah",
//       optional: true,
//       autoform: {
//         type: "hidden",
//       },
//     },
//     "matkuls.$.nameEn": {
//       type: String,
//       label: "Nama Mata Kuliah English",
//       optional: true,
//       autoform: {
//         type: "hidden",
//       },
//     },
//     "matkuls.$.order": {
//       type: Number,
//       label: "Urutan",
//       optional: true,
//     },
//   "name": {
//     type: String,
//     label: "Nama Kurikulum",
//   },
//   "description": {
//     type: String,
//     optional: true,
//     label: "Deskripsi Kurikulum",
//     autoform: {
//       rows: 3
//     },
//   },
//   "createdAt": {
//     type: Date,
//     optional: true,
//     denyUpdate: true,
//     autoform: {
//         type: "hidden"
//       },
//     autoValue: function() {
//       if (this.isInsert) {
//         return new Date();
//       } else if (this.isUpsert) {
//         return {$setOnInsert: new Date()};
//       } else {
//         this.unset();  // Prevent user from supplying their own value
//       }
//     }
//   },
//   "createdBy": {
//     type: String,
//     denyUpdate: true,
//     optional: true,
//     autoform: {
//       type: "hidden"
//     },
//     autoValue: function() {
//       if (this.isInsert) {
//         return this.userId;
//       } else {
//         this.unset();  // Prevent user from supplying their own value
//       }
//     }
//   },
// });

// Curricula.attachSchema( CurriculaSchema );

export const KHS = new Mongo.Collection("khs");

// KHSSchema = new SimpleSchema({
//   "studentId": {
//     type: String,
//     label: "Student",
//     autoform: {
//       type: "select2",
//       options: function(){
//             return Meteor.users.find({
//               "roles": { $nin: ["formator", "superadmin", "admin", "dosen"] }
//             }).map(function (c) {
//               let theLabel = c.username + " ( " + c.fullname + " )" + " - " + c.tingkat;
//           return {label: theLabel, value: c._id};
//         });
//       }
//     }
//   },
//   "studentName": {
//     type: String,
//     optional: true
//   },
//   "noPokok": {
//     type: String,
//     optional: true
//   },
//   "psId": {
//     type: String,
//     label: "Periode Studi",
//     optional: true,
//     autoform: {
//       type: "hidden"
//     }
//   },
//   "psName": {
//     type: String,
//     label: "Nama Periode Studi",
//     optional: true,
//     autoform: {
//       type: "hidden"
//     }
//   },
//   "amk": {
//     type: Array,
//     optional: true
//   },
//     "amk.$": {
//       type: Object,
//       optional: true
//     },
//     "amk.$.amkId": {
//       type: String,
//       label: "Mata Kuliah Aktif",
//       optional: true
//     },
//     "amk.$.amkName": {
//       type: String,
//       label: "Mata Kuliah Aktif",
//       optional: true
//     },
//     "amk.$.code": {
//       type: String,
//       optional: true
//     },
//     "amk.$.mkId": {
//       type: String,
//       optional: true
//     },
//     "amk.$.mkName": {
//       type: String,
//       optional: true
//     },
//     "amk.$.mkNameEn": {
//       type: String,
//       optional: true
//     },
//     "amk.$.sks": {
//       type: Number,
//       optional: true
//     },
//     "amk.$.finalScore": {
//       type: Number,
//       optional: true
//     },
//     "amk.$.score": {
//       type: Number,
//       optional: true
//     },
//     "amk.$.weightedScore": {
//       type: Number,
//       optional: true
//     },
//   "totalSks": {
//     type: Number,
//     optional: true,
//   },
//   "gps": {
//     type: Number,
//     optional: true,
//   },
// });

// KHS.attachSchema( KHSSchema );

export const Transcripts = new Mongo.Collection("transcripts");

TranscriptsSchema = new SimpleSchema({
  studentName: {
    type: String,
    label: "Nama Mahasiswa",
    optional: true,
  },
  studentId: {
    type: String,
    label: "Nama Mahasiswa",
    optional: true,
  },
  noPokok: {
    type: String,
    label: "Nomor Pokok",
    optional: true,
  },
  mk: {
    type: Array,
    label: "Mata Kuliah",
    optional: true,
  },
  "mk.$": {
    type: Object,
    label: "Mata Kuliah",
    optional: true,
  },
  "mk.$.psId": {
    type: String,
    label: "ID Tahun Akademik",
    optional: true,
  },
  "mk.$.psName": {
    type: String,
    label: "Nama Tahun Akademik",
    optional: true,
  },
  "mk.$.mkId": {
    type: String,
    label: "Mata Kuliah",
    optional: true,
    autoform: {
      type: "select2",
      options: function () {
        return MataKuliahs.find().map(function (c) {
          return { label: c.name, value: c._id };
        });
      },
    },
  },
  "mk.$.mkName": {
    type: String,
    label: "Nama Mata Kuliah",
    optional: true,
  },
  "mk.$.mkNameEn": {
    type: String,
    label: "Nama Mata Kuliah EN",
    optional: true,
  },
  "mk.$.amkId": {
    type: String,
    label: "Mata Kuliah",
    optional: true,
    autoform: {
      type: "select2",
      options: function () {
        return MataKuliahs.find().map(function (c) {
          return { label: c.name, value: c._id };
        });
      },
    },
  },
  "mk.$.score": {
    type: Number,
    label: "Nilai",
    optional: true,
  },
  "mk.$.sks": {
    type: Number,
    label: "MK Code",
    optional: true,
  },
  "mk.$.code": {
    type: String,
    label: "MK Code",
    optional: true,
  },
  "mk.$.order": {
    type: Number,
    label: "Urutan",
    optional: true,
  },
  totalSks: {
    type: Number,
    optional: true,
  },
  gpa: {
    type: Number,
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden",
    },
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    },
  },
});

Transcripts.attachSchema(TranscriptsSchema);

SimpleSchema.debug = true;
