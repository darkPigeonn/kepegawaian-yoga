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

Meteor.methods({
  "ppdb-school-getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      registrans: Registrans.find({}, { limit: perPage, skip }).fetch(),
      totalRegistrans: Registrans.find().count(),
    };
  },

  //Periode PPDB
  async "periode-ppdb-insert"(name, year) {
    check(name, String);
    check(year, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const newData = {
      name: name,
      year: year,
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
  "periode-ppdb-getAll"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    return PeriodePpdb.find().fetch();
  },

  // virtual account
  async "va-generate-va"(unitId, list) {
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

    const bankCode = "014"; // Kode bank BCA
    const companyCode = thisVaConfig.code; // Kode perusahaan (contoh: 123)

    let virtualAccountNumber = generateUniqueVirtualAccount();

    const listVa = [];
    // Simpan nomor VA ke dalam koleksi VirtualAccounts
    list.forEach((element) => {
      const thisSchool = Schools.findOne({ _id: element });
      for (let index = 1; index <= 100; index++) {
        let virtualAccountNumber = generateUniqueVirtualAccount();
        const tempVa = {
          unitId: thisUnit._id,
          unitName: thisUnit.name,
          schoolName: thisSchool.name,
          schoolId: thisSchool._id,
          va: companyCode + virtualAccountNumber,
        };
        listVa.push(tempVa);
      }
    });
    console.log(listVa);
    return listVa;
  },
  async "va-insert"(listVa) {
    check(listVa, Array);
    const thisUser = Meteor.users.findOne({ _id: this.userId });

    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const periodePpdb = "2024/2025";

    listVa.forEach((element) => {
      element.periodePpdb = periodePpdb;
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
  async "add-config-va"(id, code) {
    check(id, String);
    check(code, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const thisUnits = await Units.findOne({ _id: id });
    if (!thisUnits) {
      throw new Meteor.Error(404, "No Units Founded");
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
  async "insert-gelombang-school"(name, code) {
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
    const newData = {
      name,
      code,
      status: true,
      schoolId: thisSchool._id,
      schoolName: thisSchool.name,
      createdAt: new Date(),
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
