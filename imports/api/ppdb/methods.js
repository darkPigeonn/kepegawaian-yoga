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
  Transactions,
  VirtualAccounts,
  VirtualAccountsConfig,
} from "./ppdb";
import { check } from "meteor/check";
import { Schools, Units } from "../yoga/schools/schools";
import XLSX from "xlsx";
import { Notifications } from "../notification/notification";
import { formatRupiah } from "../../startup/server";
import { AppProfiles, AppUsers } from "../collections-profiles";

Meteor.methods({
  "registran.getAll"() {
    return Registrans.find({}, { sort: { createdAt: 1 } }).fetch();
  },
  getDashboardData() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (
      !Roles.userIsInRole(thisUser, [
        "adminPpdbYayasan",
        "superadmin",
        "adminPpdbPerwakilan",
      ])
    ) {
      throw new Meteor.Error(404, "No Access");
    }

    //get periode ppdb aktif
    const thisPeriode = PeriodePpdb.findOne({ status: true });

    //get registran
    let filter = {
      periodeStudi: thisPeriode._id,
    };
    if (Roles.userIsInRole(thisUser, ["adminPpdbPerwakilan"])) {
      filter.unitId = thisUser.unitId;
    }
    const thisRegistran = Registrans.find(filter, {
      sort: {
        registrationNumber: 1,
      },
    }).fetch();

    const registranDahboard = {
      totalRegistrans: thisRegistran.length,
      listRegistrans: thisRegistran.slice(0, 5),
    };
    //get va
    let filterVa = {
      periodeId: thisPeriode._id,
    };
    if (Roles.userIsInRole(thisUser, ["adminPpdbPerwakilan"])) {
      filterVa.unitId = thisUser.unitId;
    }
    const vaList = VirtualAccounts.find(filterVa).fetch();
    const vaDashboard = {
      totalVa: vaList.filter((item) => item.status == 10).length,
      totalVaUsed: vaList.filter((item) => item.status >= 20).length,
    };

    return { registranDahboard, vaDashboard };
  },
  "get-psActive"() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    return PeriodePpdb.findOne({ status: true });
  },
  "ppdb-school-getAll"(pageNum, perPage) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;
    let filter = {};
    if (Roles.userIsInRole(thisUser, ["adminPpdbPerwakilan"])) {
      filter.unitId = thisUser.unitId;
    }
    if (Roles.userIsInRole(thisUser, ["adminPpdbSchool"])) {
      filter.schoolId = thisUser.schoolId;
    }
    return {
      registrans: Registrans.find(filter, {
        limit: perPage,
        skip,
        sort: { createdAt: -1 },
      }).fetch(),
      totalRegistrans: Registrans.find().count(),
    };
  },
  "ppdb-school-getAll-bySchool"(pageNum, perPage, schoolId) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;

    return {
      registrans: Registrans.find(
        {
          schoolId: schoolId,
        },
        { limit: perPage, skip, sort: { createdAt: -1 } }
      ).fetch(),
      totalRegistrans: Registrans.find({ schoolId: schoolId }).count(),
    };
  },
  "ppdb-school-getAll-status"(pageNum, perPage, status) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    const skip = (pageNum - 1) * perPage;
    if (status == "all") {
      return {
        registrans: Registrans.find(
          {},
          { limit: perPage, skip, sort: { createdAt: -1 } }
        ).fetch(),
        totalRegistrans: Registrans.find().count(),
      };
    }
    return {
      registrans: Registrans.find(
        {
          status: parseInt(status),
        },
        { limit: perPage, skip, sort: { createdAt: -1 } }
      ).fetch(),
      totalRegistrans: Registrans.find({
        status: parseInt(status),
      }).count(),
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
      thisConfig.feeUtility;
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
          (thisConfig.feeUtility ?? 0);
        //get config va units
        // ALERT INI PERLU DIRUBAH KARENA VA SEMUA YANG GENEARTE ADMIN
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
          configId : thisRegistran.configId,
          configName : thisRegistran.gelombang,
          codePeriode: thisConfig.code,
          periodeId: thisConfig._id,
          countNumber: thisRegistran.registrationNumber.slice(-3),
          amount: total,
          status: 20,
          category: "90",
          feeSpp: thisConfig.feeSpp,
          feeEvent: thisConfig.feeEvent,
          feeDonation: thisConfig.feeDonation,
          feeUtility: thisConfig.feeUtility,
          virtualAccountNumber: newVa,
        };
        const paymentDetail = {
          amount: total,
          feeSpp: thisConfig.feeSpp ?? 0,
          feeEvent: thisConfig.feeEvent ?? 0,
          feeDonation: thisConfig.feeDonation ?? 0,
          feeUtility: thisConfig.feeUtility ?? 0,
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
  async "ppdb-accepted-spo"(id) {
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
    const tempNotif = {
      senderId: thisUser._id,
      receiverId: thisRegistran.createdBy,
      message: `SPO anda untuk  ${thisRegistran.fullName} sudah terverifikasi`,
      createdAt: new Date(),
      createdBy: thisUser._id,
      timestamp: new Date(),
    };

    Notifications.insert(tempNotif);
    return Registrans.update(
      { _id: idObjet },
      {
        $set: {
          status: 51,
          spoVerified: true,
          spoVerifiedAt: new Date(),
          spoVerifiedBy: thisUser._id,
        },
      }
    );
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
    //get gelombang
    const thisGelombang = await Gelombangs.findOne({ _id: codePeriode });
    if (!thisGelombang) {
      throw new Meteor.Erro(404, "Gelombang tidak ditemukan");
    }
    //get periode ppdb
    const thisPeriod = await PeriodePpdb.findOne({
      _id: thisGelombang.periodeId,
    });
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
        _id: thisGelombang._id,
      });

      if (codeTag != "08") {
        const totalFee =
          configPpdb.feeSpp ??
          0 + configPpdb.feeEvent ??
          0 + configPpdb.feeDonation ??
          0 + configPpdb.feeUtility ??
          0;
        configPpdb.feeForm = totalFee;
      }

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
          configId: thisGelombang._id,
          configName: thisGelombang.name,
          codePeriode,
          periodeId: thisPeriod._id,
          periodeYear: thisGelombang.periodeYear,
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
    feeUtility,
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
      feeUtility,
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
    feeUtility,
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
      feeUtility,
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

    let gelombangs = await Gelombangs.find({
      schoolId: thisSchool._id,
    }).fetch();

    gelombangs.map((item) => {
      //get va
      const va = VirtualAccounts.find({ configId: item._id }).fetch();
      if (va.length > 0) {
        item.haveVa = true;
        item.vaDeActivated =
          va.filter((x) => {
            return x.status == 0;
          }).length ?? 0;
        item.vaActivated =
          va.filter((x) => {
            return x.status == 10;
          }).length ?? 0;
        item.vaUsed =
          va.filter((x) => {
            return x.status == 20;
          }).length ?? 0;
      } else {
        item.haveVa = false;
      }
    });
    return gelombangs;
  },
  async "getAll-gelombang-bySchoolId"(schoolId) {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }

    return Gelombangs.find({ schoolId: schoolId, status: true }).fetch();
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

    // const deactivated = await Gelombangs.update(
    //   {
    //     status: true,
    //     schoolId: thisSchool,
    //     periodeId: thisPeriod._id,
    //   },
    //   {
    //     $set: {
    //       status: false,
    //     },
    //   },
    //   {
    //     multi: true,
    //   }
    // );
    // console.log(deactivated);
    return Gelombangs.update({ _id: id }, { $set: { status } });
  },
  async 'delete-gelombang-school'(id){
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(404, "No Access");
    }
    if (!Roles.userIsInRole(thisUser, ["adminPpdbSchool", "superadmin"])) {
      throw new Meteor.Error(404, "No Access");
    }
    const getGelombang = await Gelombangs.findOne({ _id: id });
    if (!getGelombang) {
      throw new Meteor.Error(404, "No Data");
    }
    //remove gelombang dibuat soft delete dengan cara merubah id school nya
    const schoolId = getGelombang.schoolId+'-remove';

    return Gelombangs.update({ _id: id },{$set : {schoolId}});
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
      (thisCredit.feeUtility ? thisCredit.feeUtility : 0);

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
      feeUtility: thisCredit.feeUtility,
      virtualAccountNumber: newVa,
      creditId: thisCredit._id,
    };
    const paymentDetail = {
      amount: total,
      feeSpp: thisCredit.feeSpp,
      feeEvent: thisCredit.feeEvent,
      feeDonation: thisCredit.feeDonation,
      feeUtility: thisCredit.feeUtility,
      indexPayment: 1,
    };

    const vaInsert = VirtualAccounts.insert(vaModel);
    return Registrans.update(
      { _id: objId },
      { $set: { status: 49, creditList: credits, noVA: newVa, paymentDetail } }
    );
  },

  async "rekap-payment-download"(code){
    const thisUser  = Meteor.users.findOne({_id : this.userId})
    if(!thisUser){
      throw new Meteor.Error(404, "No Access")
    }
    const periodeStudi = await PeriodePpdb.findOne({status : true})

    if(!periodeStudi){
      throw new Meteor.Error(404, "No Periode Ppdb")
    }


    let getRegistrans = await Registrans.find({
      periodeStudi: periodeStudi._id,
    }, {
      sort : {
        createdAt : 1
      },
      // fields: {
      //   _id: 1,
      //   createdByName: 1,
      //   fullName: 1,
      //   destinationClass: 1,
      //   gelombang: 1,
      //   noVA: 1,
      // }
    }).fetch();

    let dataModel = []

    for (let index = 0; index < getRegistrans.length; index++) {
      const element = getRegistrans[index];

      //get appuser
      const idUser = new Mongo.ObjectID(element.createdBy)
      const appUser = await AppProfiles.findOne({_id : idUser})

      //find perwakilan
      const perwakilan = Units.findOne({_id : element.unitId})
      // code = 0 (formulir) / 1 (pembayaran)

      // data form 0
      let tempData = {
        'Nama' : element.fullName,
        'No Form' : element.registrationNumber,
        'Email Pengguna' : appUser?.email,
        'NIK Siswa' : element.nik,
        'No Hp Pengguna' : appUser?.phoneNumber,
        'Perwakilan' : perwakilan.name,
        'Sekolah Tujuan' : element.schoolName,
        'Kelas Tujuan' : element.destinationClass,
        'Periode Pendaftaran' : element.gelombang,
        // 'Jenis Pembayaran' : e, //dari virtual account
        // 'Nilai Pembayaran' : e, //dari virtual account
        // 'Pembayaran Masuk' : e, //dari virtual account
        // //buat status 60 - code 1
        // 'SPP Bulan Juli' : e, //dari virtual account,
        // 'Uang Kegiatan' : e, //dari virtual account
        // 'Nilai Uang Sumbangan' :e, //dari virtual account
        // 'Metode Bayar' : element.paymentMethod,
        // 'Status Angsuran ke-' : e, //dari virtual account
        // 'Status Bayar' : e, //dari virtual account
        // //end status 60 - code 1
        // 'Status Lunas' : e, //dari virtual account
        // 'No VA' : e, //dari virtual account
        // //code 1
        // 'Tanggap SPOTC' : e, //dari virtual account
        // //code 1 end
        // 'Tanggal Pembayaran' : e, //dari virtual account
        // 'Dilunasi Oleh' : e, //dari virtual account
        // 'Tanggal diterima' : e, //dari virtual account
      }
      //uang formulir
      if(code === 0 && element.status < 60) {
        //find va untuk student ini yang category 08
        const idInitial = new Mongo.ObjectID(element.initialPaymentId)
        const initialPayment = InitialPayment.findOne({_id : idInitial})

        const noVa = initialPayment.va;
        const detailVa = VirtualAccounts.findOne({virtualAccountNumber : noVa})

        const dataExtend = {
          'Jenis Pembayaran' : 'Uang Pendaftaran',
          'Nilai Pembayaran' : detailVa? formatRupiah(detailVa.amount.toString()) : "0",
          'Pembayaran Masuk' : detailVa?.status == 60 ? formatRupiah(detailVa.amount.toString()) :0,
          'Status' : detailVa?.status == 60 ? 'Lunas' : 'Belum Lunas',
          'No Va' : noVa,
          'Tanggal Pembayaran' :  detailVa?.status == 60 ? detailVa.updatedAt : '-',
          'Dilunasi Oleh' : 'Va Offline',
        }

        const newModel = {...tempData, ...dataExtend}
        dataModel.push(newModel)
      }else{
        //uang masuk
        //Perlu dibedakan kontant dan cicil

        //1. Yang cicilan
        if(element.paymentMethod == 'Cicil'){
          const getCicilan = CreditPayment.find({studentId : element._id.toHexString()}).fetch()

        }

        const dataExtend = {
          'Jenis Pembayaran' : 'Biaya PPDB',

        }

      }


    }
    console.log(dataModel);

    let wb = XLSX.utils.book_new();
    const xlName = "Export Rekap PPDB ";

    wb.Props = {
      Title: xlName,
      Subject: "Data Rekap",
      Author: thisUser.fullname,
      CreatedDate: new Date(),
    };
    wb.SheetNames.push("Data Rekap");
    let ws = XLSX.utils.json_to_sheet(dataModel);
    wb.Sheets["Data Rekap"] = ws;

    return wb;

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
          let dataPayments = {
            amount : item.amount,
            virtualAccountNumber : item.va,
            paidAt : new Date(item.date),
            createdAt : new Date(),
            createdBy : thisUser._id
          }
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
                  status : 60,
                  note: item.note,
                },
              }
            );
            dataPayments.category = '08';
          }else{
            dataPayments.category = '90';
          }
          let status = 20;
          //cek va nya
          if (registran.status > 20) {
            status = 60;
          }
          //4. Make Transaksi
          const idTransaksi = Transactions.insert(
            {
              amount : item.amount,
              type : 'debit',
              timestamp : new Date(item.date),
              createdAt : new Date(),
              createdBy : thisUser._id
            }
          )
          dataPayments.idTransaksi = idTransaksi
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
                status,
              },
              $addToSet : {
                'payments' : dataPayments
              }
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
                idTransaksi
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
          ALAT: item.feeUtility ?? 0,
        };
      });
    }
    let wb = XLSX.utils.book_new();
    const xlName = "Export VA " + thisSchool.name + " " + thisUnit.name;
    console.log(newModel);

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

    //fetch data untuk create

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

    //cek data kontan atau tidak

    if (thisRegistran.paymentMethod == "Cicil") {
      if (thisRegistran.status != 49) {
        return {
          code: 404,
          message: "Silahkan buat cicilan dan menguncinya cicilan dahulu",
        };
      }
    }
    let postURL =
      process.env.USE_LOCAL === "true"
        ? "http://localhost:3005/yayoga/"
        : "https://api.imavi.org/yayoga/";

    try {
      HTTP.call(
        "POST",
        `${postURL}schools/unduhSpo?template=educationCostSpo&registerId=${idRegistran}`,
        {
          headers: {
            Id: Meteor.settings.APP_ID,
            Secret: Meteor.settings.APP_SECRET,
          },
          data: {},
        }
      );
    } catch (e) {
      console.log(e);
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

  getPpdbSchool() {
    const thisUser = Meteor.users.findOne({ _id: this.userId });
    if (!thisUser) {
      throw new Meteor.Error(403, "Forrbiden");
    }
    const thisPeriode = PeriodePpdb.findOne({ status: true });
    let filter = {
      periodeStudi: thisPeriode._id,
    };

    if (Roles.userIsInRole(thisUser, ["adminPpdbPerwakilan"])) {
      filter.unitId = thisUser.unitId;
    }

    const pipeline = [
      {
        $match:
          /**
           * query: The query in MQL.
           */
          filter,
      },
      {
        $project:
          /**
           * specifications: The fields to
           *   include or exclude.
           */
          {
            _id: 1,
            schoolId: 1,
            schoolName: 1,
            status: 1,
            periodeStudi: 1,
          },
      },
      {
        $group:
          /**
           * _id: The id of the group.
           * fieldN: The first field name.
           */
          {
            _id: "$schoolId",
            schoolName: {
              $first: "$schoolName",
            },
            total: {
              $sum: 1,
            },
            unpaidForm: {
              $sum: {
                $cond: {
                  if: {
                    $eq: ["$status", 10],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            paidForm: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $gt: ["$status", 10],
                      },
                      {
                        $lt: ["$status", 60],
                      },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            paidPangkal: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $gte: ["$status", 60],
                      },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
      },
      {
        $lookup:
          /**
           * from: The target collection.
           * localField: The local join field.
           * foreignField: The target join field.
           * as: The name for the results.
           * pipeline: Optional pipeline to run on the foreign collection.
           * let: Optional variables to use in the pipeline field stages.
           */
          {
            from: "schools",
            localField: "_id",
            foreignField: "_id",
            as: "school",
          },
      },
      {
        $unwind: "$school",
      },
      {
        $project:
          /**
           * specifications: The fields to
           *   include or exclude.
           */
          {
            _id: 1,
            schoolName: 1,
            total: 1,
            unpaidForm: 1,
            paidForm: 1,
            paidPangkal: 1,
            unitId: "$school.unitId",
            unitName: "$school.unitName",
          },
      },
      {
        $group:
          /**
           * _id: The id of the group.
           * fieldN: The first field name.
           */
          {
            _id: "$unitId",
            unitName: {
              $first: "$unitName",
            },
            total: {
              $sum: "$total",
            },
            schools: {
              $push: "$$ROOT",
            },
          },
      },
    ];
    return Registrans.aggregate(pipeline);
  },


  async "get-payment-list-school"(){
    const thisUser = Meteor.users.findOne({_id : this.userId})
    if(!thisUser) {
      throw new Meteor.Error(404, "No Access")
    }

    const periodeStudi = PeriodePpdb.findOne({status : true})
    let getRegistrans = await Registrans.find({
      periodeStudi: periodeStudi._id,
      schoolId: thisUser.schoolId,
    }, {
      sort : {
        createdAt : 1
      },
      fields: {
        _id: 1,
        createdByName: 1,
        fullName: 1,
        destinationClass: 1,
        gelombang: 1,
        noVA: 1,
        payments : 1
      }
    }).fetch();

    let newData =[]
    if (getRegistrans.length > 0) {
      const returnData = await Promise.all(getRegistrans.map(async item => {
        const payments = item.payments
        for (let index = 0; index < payments.length; index++) {
          const element = payments[index];

          let va = await VirtualAccounts.findOne({ virtualAccountNumber: element.virtualAccountNumber });

          const tempData =  {
            ...item,
            vaId: element.virtualAccountNumber,
            categoryPayment: element.category,
            amount: element.amount,
            status: va?.status ?? 0,
            paidDate: va?.updatedAt ?? '-'
          };

          newData.push(tempData)
        }

      }));
      return newData;
    }

  }

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
