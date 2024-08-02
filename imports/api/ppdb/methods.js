import {
  CreditPayment,
  Gelombangs,
  InitialPayment,
  Interviews,
  PaymentsConfig,
  PeriodePpdb,
  Registrans,
  RegistransDummy,
  RegistransFinal,
  VirtualAccounts,
  VirtualAccountsConfig,
} from "./ppdb";
import { check } from "meteor/check";
import { Schools, Units } from "../yoga/schools/schools";
import XLSX from "xlsx";
import { Notifications } from "../notification/notification";
import { formatRupiah } from "../../startup/server";

Meteor.methods({
  getDashboardData() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbYayasan", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }

    //get periode ppdb aktif
    const thisPeriode = PeriodePpdb.findOne({ status: true });

    //get registran
    const thisRegistran = Registrans.find(
      {
        periodeStudi: thisPeriode._id,
      },
      {
        sort: {
          registrationNumber: 1,
        },
      }
    ).fetch();

    const registranDahboard = {
      totalRegistrans: thisRegistran.length,
      listRegistrans: thisRegistran.slice(0, 5),
    };
    //get va
    const vaList = VirtualAccounts.find({ periodeId: thisPeriode._id }).fetch();
    const vaDashboard = {
      totalVa: vaList.filter((item) => item.status == 10).length,
      totalVaUsed: vaList.filter((item) => item.status >= 20).length,
    };

    return { registranDahboard, vaDashboard };
  },
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
  async "ppdb-registran-detail"(id) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const idObjet = new Meteor.Collection.ObjectID(id);

    let thisRegistrans = await Registrans.findOne({ _id: idObjet });
    if (!thisRegistrans) {
      throw new Meteor.Error(404, "Data Tidak Ditemukan");
    }
    //get tahun ajaran
    const thisPeriod = PeriodePpdb.findOne({
      _id: thisRegistrans.periodeStudi,
    });
    thisRegistrans.periodName = thisPeriod.year;

    //get final data form
    if (thisRegistrans.finalFormId) {
      const finalIdObject = new Mongo.Collection.ObjectID(
        thisRegistrans.finalFormId
      );
      const thisFinalForm = await RegistransFinal.findOne({
        _id: finalIdObject,
      });
      thisRegistrans.finalForm = thisFinalForm;
    }

    if (thisRegistrans.interviewId) {
      const thisInterview = await Interviews.findOne({
        _id: thisRegistrans.interviewId,
      });
      thisRegistrans.interview = thisInterview;
    }

    return thisRegistrans;
  },
  async "ppdb-registran-detailCicilan"(id) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const idObjet = new Meteor.Collection.ObjectID(id);

    let thisRegistrans = await Registrans.findOne({ _id: idObjet });
    if (!thisRegistrans) {
      throw new Meteor.Error(404, "Data Tidak Ditemukan");
    }
    //get tahun ajaran
    const thisPeriod = PeriodePpdb.findOne({
      _id: thisRegistrans.periodeStudi,
    });
    thisRegistrans.periodName = thisPeriod.year;

    //get final data form
    if (thisRegistrans.finalFormId) {
      const finalIdObject = new Mongo.Collection.ObjectID(
        thisRegistrans.finalFormId
      );
      const thisFinalForm = await RegistransFinal.findOne({
        _id: finalIdObject,
      });
      thisRegistrans.finalForm = thisFinalForm;
    }

    //get biaya
    let thisConfig = await Gelombangs.findOne({
      _id: thisRegistrans.configId,
    });
    thisConfig.feeTotal =
      thisConfig.feeSpp +
      thisConfig.feeDonation +
      thisConfig.feeEvent +
      thisConfig.feeUtilty;
    thisRegistrans.config = thisConfig;
    //get cicilan
    const credits = await CreditPayment.find({ studentId: id }).fetch();
    if (credits.length > 0) {
      thisRegistrans.listCredits = credits;
      //count total cicilan
      const totalFeeSpp = credits.reduce((result, item) => {
        return result + item.feeSpp;
      }, 0);
      const totalFeeDonation = credits.reduce((result, item) => {
        return result + item.feeDonation;
      }, 0);
      const totalFeeEvent = credits.reduce((result, item) => {
        return result + item.feeEvent;
      }, 0);
      const totalFeeUtility = credits.reduce((result, item) => {
        return result + item.feeUtility;
      }, 0);
      thisRegistrans.paid = {
        feeSpp: totalFeeSpp,
        feeDonation: totalFeeDonation,
        feeEvent: totalFeeEvent,
        feeUtility: totalFeeUtility,
        feeTotal:
          totalFeeSpp + totalFeeDonation + totalFeeEvent + totalFeeUtility,
      };
      //remainings
      const remainingSpp = thisConfig.feeSpp - totalFeeSpp;
      const remainingDonation = thisConfig.feeDonation - totalFeeDonation;
      const remainingEvent = thisConfig.feeEvent - totalFeeEvent;
      const remainingUtility = thisConfig.feeUtility - totalFeeUtility;
      console.log(thisConfig);
      console.log(thisConfig.feeUtility);
      const totalRemaining =
        remainingSpp + remainingDonation + remainingEvent + remainingUtility;

      thisRegistrans.remainings = {
        feeSpp: remainingSpp,
        feeDonation: remainingDonation,
        feeEvent: remainingEvent,
        feeUtility: remainingUtility,
        feeTotal: totalRemaining,
      };
      console.log(thisRegistrans.remainings);
    } else {
      thisRegistrans.remainings = {
        feeSpp: thisConfig.feeSpp,
        feeDonation: thisConfig.feeDonation,
        feeEvent: thisConfig.feeEvent,
        feeUtility: thisConfig.feeUtility,
        feeTotal: thisConfig.feeTotal,
      };
    }

    return thisRegistrans;
  },
  async "ppdb-accepted-student"(id) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const idObjet = new Meteor.Collection.ObjectID(id);

    const thisRegistran = await Registrans.findOne({ _id: idObjet });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Data tidak ditemukan");
    }
    const formFinalId = new Meteor.Collection.ObjectID(
      thisRegistran.finalFormId
    );
    // const thisRegistran = await RegistransFinal.findOne(formFinalId);
    // if (!thisRegistransFinal) {
    //   throw new Meteor.Error(404, "Data tidak ditemukan(2)");
    // }
    let status = 40;
    if (thisRegistran.paymentMethod) {
      if (thisRegistran.paymentMethod == "Kontan") {
        status = 45;
        //get config
        const thisConfig = await Gelombangs.findOne({
          _id: thisRegistran.configId,
        });
        if (!thisConfig) {
          throw new Meteor.Error(404, "Data Gelombang Tidak Ada");
        }
        const thisUnit = await Units.findOne({ _id: thisRegistran.unitId });
        if (!thisUnit) {
          throw new Meteor.Error(404, "Data ini tidak mengandung perwakilan");
        }
        const total =
          (thisConfig.feeSpp ?? 0) +
          (thisConfig.feeEvent ?? 0) +
          (thisConfig.feeDonation ?? 0) +
          (thisConfig.feeUtilty ?? 0);
        //get config va units
        const thisVaConfig = await VirtualAccountsConfig.findOne({
          unitId: thisUnit._id,
        });
        if (!thisVaConfig) {
          throw new Meteor.Error(404, "Konfigurasi VA Perwakilan tidak ada");
        }
        const thisSchool = await Schools.findOne({
          _id: thisRegistran.schoolId,
        });
        if (!thisSchool) {
          throw new Meteor.Error(404, "Konfigurasi Sekolah tidak ada");
        }
        const thisPeriode = await PeriodePpdb.findOne({
          _id: thisRegistran.periodeStudi,
        });
        if (!thisPeriode) {
          throw new Meteor.Error(404, "Konfigurasi Periode tidak ada");
        }

        const newVa =
          thisVaConfig.code +
          thisPeriode.code +
          thisRegistran.registrationNumber.slice(-3) +
          thisSchool.codeSchool.toString().substring(2, 4) +
          "90";
        //perlucek va

        const vaModel = {
          unitId: thisUnit._id,
          unitName: thisUnit.name,
          schoolName: thisRegistran.schoolName,
          schoolId: thisRegistran.schoolId,
          codePeriode: thisConfig.code,
          periodeId: thisConfig._id,
          countNumber: thisRegistran.registrationNumber.slice(-3),
          amount: total,
          status: 20,
          category: "90",
          feeSpp: thisConfig.feeSpp,
          feeEvent: thisConfig.feeEvent,
          feeDonation: thisConfig.feeDonation,
          feeUtilty: thisConfig.feeUtilty,
          virtualAccountNumber: newVa,
        };
        const paymentDetail = {
          amount: total,
          feeSpp: thisConfig.feeSpp ?? 0,
          feeEvent: thisConfig.feeEvent ?? 0,
          feeDonation: thisConfig.feeDonation ?? 0,
          feeUtility: thisConfig.feeUtilty ?? 0,
        };
        VirtualAccounts.insert(vaModel);
        Registrans.update(
          { _id: idObjet },
          { $set: { paymentDetail, noVA: newVa } }
        );
      } else {
        status = 41;
      }
    }
    const updatedData = {
      acceptedAt: new Date(),
      acceptedBy: thisUser._id,
      status,
    };
    return Registrans.update({ _id: idObjet }, { $set: updatedData });
    // return RegistransFinal.update({ _id: formFinalId }, { $set: updatedData });
  },
  async "ppdb-rejected-student"(id, reason) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const idObjet = new Meteor.Collection.ObjectID(id);

    const thisRegistran = await Registrans.findOne({ _id: idObjet });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Data tidak ditemukan");
    }
    const formFinalId = new Meteor.Collection.ObjectID(
      thisRegistran.finalFormId
    );

    const updatedData = {
      rejectedAt: new Date(),
      rejectedBy: thisUser._id,
      status: 90,
      reason,
    };
    return Registrans.update({ _id: idObjet }, { $set: updatedData });
    // return RegistransFinal.update({ _id: formFinalId }, { $set: updatedData });
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
      status: false,
    };
    console.log(year);
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
      if (!configPpdb) {
        throw new Meteor.Error(
          404,
          `Tidak ada gelombang aktif untuk sekolah ${thisSchool.name}`
        );
      }

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
          amount: configPpdb.feeForm ? configPpdb.feeForm : 0,
          status: 0,
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
  "va-school-getAll"(pageNum, perPage, codeCategory) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    console.log(codeCategory);
    const queryReq =
      codeCategory && codeCategory !== "all" ? { category: codeCategory } : {};
    const skip = (pageNum - 1) * perPage;

    return {
      items: VirtualAccounts.find(queryReq, {
        limit: perPage,
        skip,
        sort: { virtualAccountNumber: 1 },
      }).fetch(),
      totalItems: VirtualAccounts.find(queryReq).count(),
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
      items: VirtualAccountsConfig.find(
        {},
        { limit: perPage, skip, sort: { virtualAccountNumber: -1 } }
      ).fetch(),
      totalItems: VirtualAccountsConfig.find(
        {},
        { sort: { virtualAccountNumber: 1 } }
      ).count(),
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
  async "set-aktif-va"(unitId, schoolId, tag) {
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

    return await VirtualAccounts.update(
      {
        schoolId,
        unitId,
        category: tag,
        status: 0,
      },
      {
        $set: {
          activatedBy: thisUser._id,
          activatedAt: new Date(),
          status: 10,
        },
      },
      {
        multi: true,
      }
    );
  },

  //gelombangregistrationFinals
  async "insert-gelombang-school"(
    name,
    code,
    feeForm,
    feeSpp,
    feeEvent,
    feeUtilty,
    feeDonation,
    classInput,
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
      feeDonation,
      class: classInput,
      periodeId: checkPeriodePpdb._id,
      periodeYear: checkPeriodePpdb.year,
      createdBy: thisUser._id,
    };

    return Gelombangs.insert(newData);
  },
  async "update-gelombang-school"(
    name,
    code,
    feeForm,
    feeSpp,
    feeEvent,
    feeUtilty,
    feeDonation,
    classInput,
    periodePpdb,
    id
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
    const checkPeriodePpdb = await PeriodePpdb.findOne({ _id: periodePpdb });

    if (!checkPeriodePpdb) {
      throw new Meteor.Error(404, "Periode Tahun Ajaran tidak ada");
    }

    const newData = {
      name,
      code,
      feeForm,
      feeSpp,
      feeEvent,
      feeUtilty,
      feeDonation,
      class: classInput,
      periodeId: checkPeriodePpdb._id,
      periodeYear: checkPeriodePpdb.year,
      updatedBy: thisUser._id,
      updatedAt: thisUser._id,
    };

    return Gelombangs.update({ _id: id }, { $set: newData });
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
  async "aktivated-gelombang"(id, status) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }
    //get active period
    const thisPeriod = await PeriodePpdb.findOne({ status: true });

    const thisSchool = thisUser.schoolId;

    const deactivated = await Gelombangs.update(
      {
        status: true,
        schoolId: thisSchool,
        periodeId: thisPeriod._id,
      },
      {
        $set: {
          status: false,
        },
      },
      {
        multi: true,
      }
    );
    console.log(deactivated);
    return Gelombangs.update({ _id: id }, { $set: { status } });
  },
  async "aktivated-periode"(id, status) {
    check(id, String);
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbYayasan", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }
    //get active period

    const deactivated = await PeriodePpdb.update(
      {
        status: true,
      },
      {
        $set: {
          status: false,
        },
      },
      {
        multi: true,
      }
    );
    return PeriodePpdb.update({ _id: id }, { $set: { status } });
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
  async "set-cicil-student"(id, index, spp, donation, event, utility) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const objId = new Meteor.Collection.ObjectID(id);

    const thisRegistran = await Registrans.findOne({ _id: objId });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Data siswa tidak ditemukan");
    }
    const check = CreditPayment.findOne({
      index,
      studentId: id,
      periodeStudi: thisRegistran.periodeStudi,
      gelombang: thisRegistran.configId,
    });
    if (check) {
      throw new Meteor.Error(404, `Cicilan ke : ${index}  sudah pernah dibuat`);
    }
    const dataSave = {
      index,
      feeSpp: spp,
      feeDonation: donation,
      feeEvent: event,
      feeUtility: utility,
      createdAt: new Date(),
      createdBy: thisUser._id,
      studentId: thisRegistran._id.toHexString(),
      studentNumber: thisRegistran.registrationNumber,
      schoolId: thisRegistran.schoolId,
      periodeStudi: thisRegistran.periodeStudi,
      gelombang: thisRegistran.configId,
      status: 10,
    };
    return CreditPayment.insert(dataSave);
  },
  async "update-cicil-student"(
    id,
    index,
    spp,
    donation,
    event,
    utility,
    idCredit
  ) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const objId = new Meteor.Collection.ObjectID(id);

    const thisRegistran = await Registrans.findOne({ _id: objId });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Data siswa tidak ditemukan");
    }

    const dataSave = {
      index,
      feeSpp: spp,
      feeDonation: donation,
      feeEvent: event,
      feeUtility: utility,
      updatedAt: new Date(),
      updatedBy: thisUser._id,
    };

    return CreditPayment.update({ _id: idCredit }, { $set: dataSave });
  },
  async "credit-lock"(id) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    const objId = new Meteor.Collection.ObjectID(id);

    const thisRegistran = await Registrans.findOne({ _id: objId });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Data siswa tidak ditemukan");
    }
    //get all credit
    const credits = CreditPayment.find({
      studentId: thisRegistran._id.toHexString(),
    }).fetch();

    //make va cicilan
    const thisConfig = await Gelombangs.findOne({
      _id: thisRegistran.configId,
    });
    if (!thisConfig) {
      throw new Meteor.Error(404, "Data Gelombang Tidak Ada");
    }
    const thisUnit = await Units.findOne({ _id: thisRegistran.unitId });
    if (!thisUnit) {
      throw new Meteor.Error(404, "Data ini tidak mengandung perwakilan");
    }
    //get cicilan ke 1
    const thisCredit = credits[0];

    const total =
      (thisCredit.feeSpp ? thisCredit.feeSpp : 0) +
      (thisCredit.feeEvent ? thisCredit.feeEvent : 0) +
      (thisCredit.feeDonation ? thisCredit.feeDonation : 0) +
      (thisCredit.feeUtilty ? thisCredit.feeUtilty : 0);

    //get config va units
    const thisVaConfig = await VirtualAccountsConfig.findOne({
      unitId: thisUnit._id,
    });
    if (!thisVaConfig) {
      throw new Meteor.Error(404, "Konfigurasi VA Perwakilan tidak ada");
    }
    const thisSchool = await Schools.findOne({
      _id: thisRegistran.schoolId,
    });
    if (!thisSchool) {
      throw new Meteor.Error(404, "Konfigurasi Sekolah tidak ada");
    }
    const thisPeriode = await PeriodePpdb.findOne({
      _id: thisRegistran.periodeStudi,
    });
    if (!thisPeriode) {
      throw new Meteor.Error(404, "Konfigurasi Periode tidak ada");
    }

    const newVa =
      thisVaConfig.code +
      thisPeriode.code +
      thisRegistran.registrationNumber.slice(-3) +
      thisSchool.codeSchool.toString().substring(2, 4) +
      "99";
    //perlucek va

    const vaModel = {
      unitId: thisUnit._id,
      unitName: thisUnit.name,
      schoolName: thisRegistran.schoolName,
      schoolId: thisRegistran.schoolId,
      codePeriode: thisConfig.code,
      periodeId: thisConfig._id,
      countNumber: thisRegistran.registrationNumber.slice(-3),
      status: 20,
      category: "99",
      amount: total,
      feeSpp: thisCredit.feeSpp,
      feeEvent: thisCredit.feeEvent,
      feeDonation: thisCredit.feeDonation,
      feeUtilty: thisCredit.feeUtilty,
      virtualAccountNumber: newVa,
      creditId: thisCredit._id,
    };
    const paymentDetail = {
      amount: total,
      feeSpp: thisCredit.feeSpp,
      feeEvent: thisCredit.feeEvent,
      feeDonation: thisCredit.feeDonation,
      feeUtility: thisCredit.feeUtilty,
      indexPayment: 1,
    };

    const vaInsert = VirtualAccounts.insert(vaModel);
    return Registrans.update(
      { _id: objId },
      { $set: { status: 46, creditList: credits, noVA: newVa, paymentDetail } }
    );
  },

  //payme

  async "konfirmasi-payment-upload"(items) {
    check(items, Array);

    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbYayasan", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }

    let listFail = [];

    items.forEach((item) => {
      //1. check ke va dengan status 11(terpakai) ada atau tidak =>formulir
      const checkVa = VirtualAccounts.findOne({
        virtualAccountNumber: item.va,
        status: 20,
      });

      if (checkVa) {
        //extension cek nominal
        if (checkVa.amount != item.amount) {
          listFail.push({
            va: item.va,
            amount: item.amount,
            name: item.name,
            message:
              "nominal tidak sama. seharusnya Rp. " +
              formatRupiah(checkVa.amount.toString()),
          });
          return false;
        }
        //2. check pengguna dengan va ini
        const registran = Registrans.findOne({
          noVA: item.va,
        });

        if (registran) {
          if (registran.status < 20) {
            //ini untuk formulir
            //3. check initialPayment
            const idPayment = new Mongo.Collection.ObjectID(
              registran.initialPaymentId
            );
            const initialPayment = InitialPayment.findOne({
              _id: idPayment,
            });
            // //4. update intialPayment
            InitialPayment.update(
              { _id: idPayment },
              {
                $set: {
                  paymentPurchase: item.amount,
                  updatedAt: new Date(),
                  updatedBy: thisUser._id,
                  paymentStatus: true,
                  note: item.note,
                },
              }
            );
          }
          //5. update form
          Registrans.update(
            {
              _id: registran._id,
            },
            {
              $set: {
                initialPaymentStatus: true,
                updatedAt: new Date(),
                updatedBy: thisUser._id,
                note: item.note,
                status: 20,
              },
            }
          );
          //6. update va
          VirtualAccounts.update(
            { virtualAccountNumber: item.va },
            {
              $set: {
                status: 60,
                updatedAt: new Date(),
                updatedBy: thisUser._id,
                note: item.note,
              },
            }
          );
          //7. Notif to user
          const tempNotif = {
            senderId: thisUser._id,
            receiverId: registran.createdBy,
            message: `Pembayaran anda untuk pembayaran formulir ${registran.fullName} sudah terkonfirmasi`,
            createdAt: new Date(),
            createdBy: thisUser._id,
            timestamp: new Date(),
          };

          Notifications.insert(tempNotif);
          listFail.push({
            va: item.va,
            amount: item.amount,
            name: item.name,
            message: "Berhasil",
          });
        }
      } else {
        listFail.push({
          va: item.va,
          amount: item.amount,
          name: item.name,
          message: "nomor va tidak ditemukan",
        });
      }
    });

    if (listFail.length > 0) {
      return {
        status: 203,
        items: listFail,
      };
    } else {
      return {
        status: 200,
      };
    }
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
    let newModel = {};
    console.log(tag);
    if (tag == "08") {
      newModel = thisVa.map((item) => {
        return {
          "KODE VA": item.virtualAccountNumber,
          "NAMA SISWA": "Formulir",
          Formulir: item.amount,
        };
      });
    } else {
      newModel = thisVa.map((item) => {
        return {
          "KODE VA": item.virtualAccountNumber,
          "NAMA SISWA": "Formulir",
          SPP: item.feeSpp ?? 0,
          SUMBANGAN: item.feeDonation ?? 0,
          KEGIATAN: item.feeEvent ?? 0,
          ALAT: item.feeUtilty ?? 0,
        };
      });
    }
    console.log(newModel);
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

  //interviews
  async "interviews.insert"(id, date, time, note) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(403, "Forrbiden");
    }
    const data = {
      registranId: id,
      date,
      time,
      note,
      createdAt: new Date(),
      createdBy: thisUser._id,
    };
    const result = await Interviews.insert(data);

    return Registrans.update(
      { _id: id },
      {
        $set: {
          interviewId: result,
          status: 48,
          interviewDone: false,
          updatedAt: new Date(),
          updatedBy: thisUser._id,
        },
      }
    );
  },

  "credit.delete"(id) {
    check(id, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });

    if (!thisUser) {
      throw new Meteor.Error(403, "Forrbiden");
    }

    return CreditPayment.remove({ _id: id });
  },

  "ppdb-interview-done"(idRegistran) {
    check(idRegistran, String);

    const thisUser = Meteor.users.findOne({ _id: this.userId });

    if (!thisUser) {
      throw new Meteor.Error(403, "Forrbiden");
    }

    const objectIdUser = new Meteor.Collection.ObjectID(idRegistran);
    const thisRegistran = Registrans.findOne({ _id: objectIdUser });
    if (!thisRegistran) {
      throw new Meteor.Error(404, "Registran Tidak Ditemukan");
    }

    const wawancara = {
      interview: {
        doneAt: new Date(),
        doneBy: thisUser._id,
      },
      interviewDone: true,
      status: 50,
    };

    //update interview
    Interviews.update(
      { _id: thisRegistran.interviewId },
      {
        $set: {
          doneAt: new Date(),
          updatedAt: new Date(),
          updatedBy: thisUser._id,
        },
      }
    );

    return Registrans.update({ _id: objectIdUser }, { $set: wawancara });
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
