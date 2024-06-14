import {
  Gelombangs,
  PaymentsConfig,
  PeriodePpdb,
  Registrans,
  RegistransDummy,
  VirtualAccounts,
  VirtualAccountsConfig,
} from "./ppdb";
import { check } from "meteor/check";
import { Schools, Units } from "../yoga/schools/schools";
import XLSX from "xlsx";
Meteor.methods({
  "ppdb-school-getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      registrans: Registrans.find(
        {},
        { limit: perPage, skip, sort: { createdAt: -1 } }
      ).fetch(),
      totalRegistrans: Registrans.find().count(),
    };
  },
  "ppdb-registran-detail"(id) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const idObjet = new Meteor.Collection.ObjectID(id);

    return Registrans.findOne({ _id: idObjet });
  },

  //Periode PPDB
  async "periode-ppdb-insert"(name, year, code) {
    check(name, String);
    check(year, String);
    check(code, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const newData = {
      name: name,
      year: year,
      code: code,
      createdBy: thisUser._id,
      createdAt: new Date(),
      status: true,
    };
    const checkTahun = await PeriodePpdb.findOne({ year });
    if (checkTahun) {
      throw new Meteor.Error(404, "Tahun periode ppdb sudah ada");
    }
    return PeriodePpdb.insert(newData);
  },
  async "periode-ppdb-update"(name, year, code, id) {
    check(id, String);
    check(name, String);
    check(year, String);
    check(code, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const checkTahun = await PeriodePpdb.findOne({ _id: id });
    if (!checkTahun) {
      throw new Meteor.Error(404, "Tahun periode ppdb sudah ada");
    }
    const updateData = {
      name: name,
      year: year,
      code: code,
      updatedBy: thisUser._id,
      updatedAt: new Date(),
      status: true,
    };

    return PeriodePpdb.update({ _id: id }, { $set: updateData });
  },
  "periode-ppdb-getAll"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    return PeriodePpdb.find().fetch();
  },

  // virtual account
  async "va-generate-va"(unitId, list, codePeriode, selectedTag) {
    check(unitId, String);
    check(list, Array);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    //get unit
    const thisUnit = await Units.findOne({ _id: unitId });
    if (!thisUnit) {
      throw new Meteor.Error(404, "No Access");
    }
    //get config va units
    const thisVaConfig = await VirtualAccountsConfig.findOne({
      unitId: thisUnit._id,
    });
    if (!thisVaConfig) {
      throw new Meteor.Error(404, "Config VA perwakilan belum tersedia");
    }
    //get periode ppdb
    const thisPeriod = await PeriodePpdb.findOne({ _id: codePeriode });
    if (!thisPeriod) {
      throw new Meteor.Error(404, "Periode PPDB ini tidak ada");
    }
    codePeriode = thisPeriod.code;

    const bankCode = "014"; // Kode bank BCA
    const companyCode = thisVaConfig.code; // Kode perusahaan (contoh: 123)
    let codeTag = "00";
    if (selectedTag === "formulir") {
      codeTag = "08";
    }
    if (selectedTag == "spp") {
      codeTag = "90";
    }
    if (selectedTag == "sppCicil") {
      codeTag = "99";
    }
    let virtualAccountNumber = generateUniqueVirtualAccount();

    const listVa = [];
    // Simpan nomor VA ke dalam koleksi VirtualAccounts
    //format va
    //campcode-codePeriode-count-codeSchool-codeTag
    list.forEach((element) => {
      const thisSchool = Schools.findOne({ _id: element });
      //get config ppdb
      const configPpdb = Gelombangs.findOne({
        status: true,
        schoolId: element,
        periodeId: thisPeriod._id,
      });

      let startIndex = 1;
      let maxIndex = 100;

      //last entry data va sekolah
      const checkVaSchool = VirtualAccounts.findOne(
        {
          schoolId: thisSchool._id,
          periodeId: thisPeriod._id,
        },
        { sort: { countNumber: -1 } }
      );

      if (checkVaSchool) {
        console.log(checkVaSchool);
        const lastCode = parseInt(checkVaSchool.countNumber, 10);
        startIndex = lastCode;
        maxIndex = startIndex + 100;
      }
      for (let index = startIndex; index <= maxIndex; index++) {
        // let virtualAccountNumber = generateUniqueVirtualAccount();
        const countNumber = index.toString().padStart(3, "0");
        const schoolCode = thisSchool.codeSchool.toString().substring(2, 4);
        const newVa =
          companyCode + codePeriode + countNumber + schoolCode + codeTag;
        const tempVa = {
          unitId: thisUnit._id,
          unitName: thisUnit.name,
          schoolName: thisSchool.name,
          schoolId: thisSchool._id,
          va: newVa,
          codePeriode,
          periodeId: thisPeriod._id,
          countNumber,
          amount: configPpdb.feeForm,
          status: 10,
          category: codeTag,
        };
        listVa.push(tempVa);
      }
    });

    return listVa;
  },
  async "va-insert"(listVa) {
    check(listVa, Array);
    const thisUser = Meteor.users.findOne({ _id: this.userId });

    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    listVa.forEach((element) => {
      element.createdAt = new Date();
      element.createdBy = thisUser._id;
      element.virtualAccountNumber = element.va;

      delete element.va;

      //check va existing or not
      const existingVA = VirtualAccounts.findOne({
        virtualAccountNumber: element.virtualAccountNumber,
      });
      if (!existingVA) {
        VirtualAccounts.insert(element);
      }
    });
    return true;
  },
  "va-school-getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      items: VirtualAccounts.find(
        {},
        { limit: perPage, skip, sort: { createdAt: -1 } }
      ).fetch(),
      totalItems: VirtualAccounts.find().count(),
    };
  },

  //config va
  "get-config-va"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      items: VirtualAccountsConfig.find({}, { limit: perPage, skip }).fetch(),
      totalItems: VirtualAccountsConfig.find().count(),
    };
  },
  async "add-config-va"(category, id, code) {
    check(category, String);
    check(id, String);
    check(code, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    let thisUnits;
    if (category == "type") {
      thisUnits = { name: id };
      id = category;
    } else {
      thisUnits = await Units.findOne({ _id: id });
      if (!thisUnits) {
        throw new Meteor.Error(404, "No Units Founded");
      }
    }
    const checkVaConfig = await VirtualAccountsConfig.findOne({ code: code });
    if (checkVaConfig) {
      throw new Meteor.Error(404, "Code is already using");
    }
    return VirtualAccountsConfig.insert({
      unitId: id,
      unitName: thisUnits.name,
      code,
      createdAt: new Date(),
      createdBy: thisUser._id,
    });
  },

  //gelombang
  async "insert-gelombang-school"(
    name,
    code,
    feeForm,
    feeSpp,
    feeEvent,
    feeUtilty,
    periodePpdb
  ) {
    check(name, String);
    check(code, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisSchool = await Schools.findOne({ _id: thisUser.schoolId });
    if (!thisSchool) {
      throw new Meteor.Error(404, "No School Founded");
    }

    code = code.replace(/\s+/g, "").toLowerCase();

    //cek kode dulu biar ga duplicate
    const checkCode = await Gelombangs.findOne({
      code,
      schoolId: thisSchool._id,
    });
    if (checkCode) {
      throw new Meteor.Error(
        404,
        "Kode sudah terpakai, silahakan tulis yang lain"
      );
    }
    const checkPeriodePpdb = await PeriodePpdb.findOne({ _id: periodePpdb });
    console.log(periodePpdb);
    if (!checkPeriodePpdb) {
      throw new Meteor.Error(404, "Periode Tahun Ajaran tidak ada");
    }

    const newData = {
      name,
      code,
      status: true,
      schoolId: thisSchool._id,
      schoolName: thisSchool.name,
      createdAt: new Date(),
      feeForm,
      feeSpp,
      feeEvent,
      feeUtilty,
      periodeId: checkPeriodePpdb._id,
      periodeYear: checkPeriodePpdb.year,
      createdBy: thisUser._id,
    };

    return Gelombangs.insert(newData);
  },
  async "getAll-gelombang-school"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisSchool = await Schools.findOne({ _id: thisUser.schoolId });
    if (!thisSchool) {
      throw new Meteor.Error(404, "No School Founded");
    }

    return Gelombangs.find({ schoolId: thisSchool._id }).fetch();
  },

  //payment
  async "getAll-payment-school"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisSchool = await Schools.findOne({ _id: thisUser.schoolId });
    if (!thisSchool) {
      throw new Meteor.Error(404, "No School Founded");
    }

    return PaymentsConfig.find({ schoolId: thisSchool._id }).fetch();
  },
  async "insert-payment-school"(name, category, nominal) {
    check(name, String);
    check(category, String);
    check(nominal, Number);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisSchool = await Schools.findOne({ _id: thisUser.schoolId });
    if (!thisSchool) {
      throw new Meteor.Error(404, "No School Founded");
    }

    const newData = {
      name,
      category,
      nominal,
      schoolId: thisSchool._id,
      schoolName: thisSchool.name,
      createdAt: new Date(),
      createdBy: thisUser._id,
    };

    return PaymentsConfig.insert(newData);
  },

  //payment
  async "konfirmasi-payment-upload"(items) {
    check(items, Array);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbYayasan", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }

    items.forEach((item) => {
      //1. check ke va dengan status 11(terpakai) ada atau tidak =>formulir

      console.log(item);
      const checkVa = VirtualAccounts.findOne({
        virtualAccountNumber: item.va,
        status: 11,
      });
      //2. jika ada update status pembayarannya
    });
    return false;
  },
  //export
  async "export-va"(unitId, schoolId, tag) {
    check(unitId, String);
    check(schoolId, String);
    check(tag, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbYayasan", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisSchool = await Schools.findOne({ _id: schoolId });
    if (!thisSchool) {
      throw new Meteor.Error(404, "No School Founded");
    }
    //get unit
    const thisUnit = await Units.findOne({ _id: unitId });
    if (!thisUnit) {
      throw new Meteor.Error(404, "No Access");
    }
    if (tag === "formulir") {
      tag = "08";
    }
    if (tag == "spp") {
      tag = "90";
    }
    if (tag == "sppCicil") {
      tag = "99";
    }
    const thisVa = await VirtualAccounts.find({
      schoolId,
      unitId,
      category: tag,
    }).fetch();

    const newModel = thisVa.map((item) => {
      return {
        "KODE VA": item.virtualAccountNumber,
        "NAMA SISWA": "Formulir",
        Formulir: item.amount,
      };
    });
    let wb = XLSX.utils.book_new();
    const xlName = "Export VA " + thisSchool.name + " " + thisUnit.name;

    wb.Props = {
      Title: xlName,
      Subject: "Data VA",
      Author: thisUser.fullname,
      CreatedDate: new Date(),
    };
    wb.SheetNames.push("Daftar VA");
    let ws = XLSX.utils.json_to_sheet(newModel);
    wb.Sheets["Daftar VA"] = ws;

    return wb;
  },
});

function generateUniqueVirtualAccount() {
  let virtualAccountNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate 9 digit angka acak untuk nomor VA
    virtualAccountNumber = generateRandomNumber(9);

    // Cek apakah nomor VA sudah ada di koleksi
    const existingVA = VirtualAccounts.findOne({ virtualAccountNumber });
    if (!existingVA) {
      isUnique = true;
    }
  }

  return virtualAccountNumber;
}

function generateRandomNumber(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
