// Methods related to FORMS

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import _ from "underscore";

import {
  ChronicleKevikepans,
  IntermarriageRequests,
  Jubileum,
  Kevikepans,
  KevikepanStruktur,
  OrganizationDocuments,
  ParokiKevikepans,
  Rehan,
} from "./keuskupan.js";
// import { Categories } from "../alma-v1/db/collections-komsosCenter.js";
import { Chronicles } from "../administrasi/administrasi.js";
import { Tarekats, UnitKaryas } from "../assets/assets.js";

process.env.ID2 = "6147f10d33abc530a445fe84";
process.env.SECRET2 = "88022467-0b5c-4e61-8933-000cd884aaa8";
process.env.PARTNERS2 = "imavi";

Meteor.methods({
  jubileumCreate(data) {
    check(data, Object);
    return Jubileum.insert(data);
  },
  jubileumEdit(data) {
    check(data, Object);
    const objectID = new Meteor.Collection.ObjectID(data._id);
    delete data._id;

    data.updatedBy = Meteor.userId();
    data.updatedAt = new Date();

    return Jubileum.update(
      {
        _id: objectID,
      },
      {
        $set: data,
      }
    );
  },
  jubileumList() {
    return Jubileum.find().fetch();
  },
  jubileumDetail(id) {
    check(id, String);
    const objectID = new Meteor.Collection.ObjectID(id);
    return Jubileum.findOne({
      _id: objectID,
    });
  },
  rehanCreate(data) {
    check(data, Object);
    return Rehan.insert(data);
  },
  rehanEdit(data) {
    check(data, Object);
    const objectID = new Meteor.Collection.ObjectID(data._id);
    delete data._id;

    data.updatedBy = Meteor.userId();
    data.updatedAt = new Date();

    return Rehan.update(
      {
        _id: objectID,
      },
      {
        $set: data,
      }
    );
  },
  rehanList() {
    return Rehan.find().fetch();
  },
  rehanDetail(id) {
    check(id, String);
    const objectID = new Meteor.Collection.ObjectID(id);
    return Rehan.findOne({
      _id: objectID,
    });
  },

  getParokis() {
    return ParokiKevikepans.find({}).fetch();
  },

  getChronicleKevikepan() {
    const thisUser = Meteor.user();

    let chronicle = Chronicles.find({ type: "chronicleKevikepan" }).fetch();

    if (Roles.userIsInRole(thisUser, ["vikpas"])) {
      const userId = Meteor.userId();
      chronicle = Chronicles.find({ type: "chronicleKevikepan" }, {
        $or: [{ ketuaId: userId }, { sekretarisId: userId }]
      }).fetch();
    }

    return chronicle
  },

  getKevikepan() {
    const userId = Meteor.userId();
    const kevikepan = KevikepanStruktur.findOne({ $or: [{ ketuaId: userId }, { sekretarisId: userId }] })
    return kevikepan
  },

  detailKevikepan(id) {
    return KevikepanStruktur.findOne({ kevikepanId: parseInt(id) })
  },

  updateStrukturKevikepan(id, data) {
    check(data, Object)

    _.extend(data, {
      createdByName: Meteor.user().fullname,
      createdBy: Meteor.userId(),
      createdAt: new Date(),
    })

    const cekKevikepan = KevikepanStruktur.findOne({ kevikepanId: parseInt(id) })
    if (cekKevikepan) {
      // jika ada
      delete cekKevikepan._id;
      if (cekKevikepan.history) {
        delete cekKevikepan.history;
      }

      return KevikepanStruktur.update({ kevikepanId: parseInt(id) }, {
        $set: data,
        $addToSet: { history: cekKevikepan }
      });
    } else {
      // jika tidak
      return KevikepanStruktur.insert(data);
    }

  },

  "create-management"(data) {
    check(data, Object);

    // cari nama berdasarkan anggotaID

    _.extend(data, {
      createdBy: Meteor.userId(),
      createdAt: new Date(),
    });

    console.log(data);

    return KevikepanStruktur.insert(data);
  },

  "update-management"(data) {
    check(data, Object);

    const id = data.id;
    delete data.id;
    let dataLama = KevikepanStruktur.findOne({ _id: id });
    delete dataLama._id;
    if (dataLama.history) {
      delete dataLama.history;
    }

    _.extend(data, {
      updatedBy: Meteor.userId(),
      updatedAt: new Date(),
    });

    return KevikepanStruktur.update(
      { _id: id },
      {
        $set: data,
        $addToSet: { history: dataLama },
      }
    );
  },

  "detail-kevikepan"(id) {
    check(id, String);
    return KevikepanStruktur.findOne({ _id: id });
  },

  listManagement() {
    return KevikepanStruktur.find().fetch();
  },

  getPerson() {
    // try {
    //   const response = HTTP.call(
    //     "GET",
    //     "https://api.imavi.org/imavi/persons/get-all",
    //     {
    //       headers: {
    //         Id: process.env.ID2,
    //         Secret: process.env.SECRET2,
    //         partner: process.env.PARTNERS2,
    //       },
    //     }
    //   );
    //   console.log(response.data);
    //   return response.data;
    // } catch (error) {
    //   console.log(error);
    //   throw new Meteor.Error("Gagal terkoneksi dengan server");
    // }
  },

  getRequest() {
    try {
      const thisUser = Meteor.user();
      let notAccept = [];
      let acceptRequest = [];

      const response = HTTP.call(
        "GET",
        "https://api.imavi.org/imavi/marriages/get-all",
        {
          headers: {
            Id: process.env.ID2,
            Secret: process.env.SECRET2,
            partner: process.env.PARTNERS2,
          },
        }
      );

      // console.log("cek");
      // // console.log(response);
      // console.log("cek akhir");

      const allRequest = response.data;

      console.log(allRequest);

      allRequest.forEach((x) => {
        if (x.status === 10) {
          notAccept.push(x);
        } else if (x.status === 70) {
          acceptRequest.push(x);
        }
      });

      if (Roles.userIsInRole(thisUser, ["vikep", "sekretarisVikep"])) {
        const ParokiID = [];
        const allRequestKev = [];
        const notAcceptKev = [];
        const acceptRequestKev = [];
        const userId = Meteor.userId();
        const kevikepan = KevikepanStruktur.findOne({ $or: [{ ketuaId: userId }, { sekretarisId: userId }] })
        const getParoki = ParokiKevikepans.find({ kevikepan: kevikepan.kevikepanName }).fetch();
        // qg5LSrmqsATDv8xM2
        getParoki.forEach(x => {
          ParokiID.push(x.ParokiID);
        });

        ParokiID.forEach(x => {
          const getRequest = _.filter(allRequest, {
            umatParokiID: x
          });
          if (getRequest.length > 0) {
            getRequest.forEach(y => {
              allRequestKev.push(y)
            });
          };
        });

        allRequestKev.forEach(x => {
          if (x.status === 10) {
            notAcceptKev.push(x);
          } else if (x.status === 70) {
            acceptRequestKev.push(x);
          }
        });

        console.log(allRequestKev);
        // console.log(ParokiID);
        return { allRequestKev, notAcceptKev, acceptRequestKev };
      } else {
        return { allRequest, notAccept, acceptRequest };
      }


    } catch (error) {
      console.log("error");
      console.log(error);
      console.log("cek");
      throw new Meteor.Error("Gagal terkoneksi dengan server");
    }
  },

  countRequest() {
    try {
      let listAccept = [];
      let notRrequest = [];
      let rejectList = [];
      const thisUser = Meteor.user();

      let notRequest;
      let acceptRequest;
      let rejectRequest;

      const response = HTTP.call(
        "GET",
        "https://api.imavi.org/imavi/marriages/get-all",
        {
          headers: {
            Id: process.env.ID2,
            Secret: process.env.SECRET2,
            partner: process.env.PARTNERS2,
          },
        }
      );

      const listAll = response.data;

      listAll.forEach((x) => {
        if (x.status === 70) {
          listAccept.push(x);
        } else if (x.status === 10) {
          notRrequest.push(x);
        } else if (x.status === 90) {
          rejectList.push(x);
        }
      });

      if (Roles.userIsInRole(thisUser, ["vikep", "sekretarisVikep"])) {
        const ParokiID = [];
        const allRequestKev = [];
        const notAcceptKev = [];
        const rejectKev = [];
        const acceptRequestKev = [];

        const userId = Meteor.userId();
        const kevikepan = KevikepanStruktur.findOne({ $or: [{ ketuaId: userId }, { sekretarisId: userId }] })
        const getParoki = ParokiKevikepans.find({ kevikepan: kevikepan.kevikepanName }).fetch();
        // qg5LSrmqsATDv8xM2
        getParoki.forEach(x => {
          ParokiID.push(x.ParokiID);
        });

        ParokiID.forEach(x => {
          const getRequest = _.filter(listAll, {
            umatParokiID: x
          });
          if (getRequest.length > 0) {
            getRequest.forEach(y => {
              allRequestKev.push(y)
            });
          };
        });

        allRequestKev.forEach(x => {
          if (x.status === 10) {
            notAcceptKev.push(x);
          } else if (x.status === 70) {
            acceptRequestKev.push(x);
          } else if (x.status === 90) {
            rejectKev.push(x)
          }
        });

        console.log(allRequestKev);
        // console.log(ParokiID);
        // jika vikep
        notRequest = notAcceptKev.length;
        acceptRequest = acceptRequestKev.length;
        rejectRequest = rejectKev.length;

      } else {
        // jika bukan vikep
        notRequest = notRrequest.length;
        acceptRequest = listAccept.length;
        rejectRequest = rejectList.length;

      }


      return { notRequest, acceptRequest, rejectRequest };
    } catch (error) {
      console.log(error);
      throw new Meteor.Error("Gagal terkoneksi dengan server");
    }
  },

  detailRequest(id) {
    console.log(id);
    //  http://localhost:3005/
    try {
      const response = HTTP.call(
        "GET",
        "https://api.imavi.org/imavi/marriages/view/" + id,
        {
          headers: {
            Id: process.env.ID2,
            Secret: process.env.SECRET2,
            partner: process.env.PARTNERS2,
          },
        }
      );

      // console.log(response.data);

      return response.data;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error("Gagal terkoneksi dengan server");
    }
  },

  async intermarriageAction(id, status) {
    try {
      // http://localhost:3005/
      const getStatus = parseInt(status);
      const response = await HTTP.call(
        "PUT",
        "https://api.imavi.org/imavi/marriages/update",
        {
          headers: {
            Id: process.env.ID2,
            Secret: process.env.SECRET2,
            partner: process.env.PARTNERS2,
          },
          data: {
            _id: id,
            status: getStatus,
          },
        }
      );
      return true;
    } catch (error) {
      console.log("cekss");
      console.log(error);

      throw new Meteor.Error("Gagal terkoneksi dengan server");
    }
  },

  getListUnitKaryas() {
    return UnitKaryas.find({}).fetch();
  },

  getUnitKaryas(idUnitKarya) {
    // console.log(idUnitKarya);
    return UnitKaryas.findOne({
      _id: idUnitKarya,
    });
  },

  createUnitKarya(data) {
    check(data, Object);
    return UnitKaryas.insert(data);
  },

  updateUnitKarya(idUnitKarya, data) {
    check(idUnitKarya, String);
    check(data, Object);
    return UnitKaryas.update({ _id: idUnitKarya }, { $set: data });
  },

  deleteUnitKarya(idUnitKarya) {
    check(idUnitKarya, String);
    // console.log(idUnitKarya);
    return UnitKaryas.remove({ _id: idUnitKarya });
  },

  documentInsert(data) {
    data.createdBy = Meteor.userId();
    data.createdAt = new Date();

    const organization = Tarekats.findOne({ _id: data.organizationId });
    _.extend(data, {
      organizationName: organization.name
    });

    return OrganizationDocuments.insert(data);
  },

  getDocumentOrganization() {
    const doc = OrganizationDocuments.find(
      {},
      {
        sort: {
          createdAt: -1,
        },
      }
    ).fetch();

    return doc;
  },

  deleteOrganizationDocument(documentId) {
    return OrganizationDocuments.remove({
      _id: documentId,
    });
  },

  detailOrganizationDocument(id) {
    return OrganizationDocuments.findOne({
      _id: id,
    });
  },

  organizationDocumentEdit(data) {
    const id = data.id;
    delete data.id;
    return OrganizationDocuments.update(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );
  },

  getListThb() {
    return Tarekats.find({}).fetch();
  },

  getDetailThb(id) {
    check(id, String);
    const tarekat = Tarekats.findOne({
      _id: id,
    });

    const documents = OrganizationDocuments.find({ organizationId: id }).fetch();

    _.extend(tarekat, {
      organizationDocuments: documents
    })

    return tarekat;
  },

  createThb(data) {
    check(data, Object);
    data.createdBy = Meteor.userId();
    data.createdAt = new Date();
    return Tarekats.insert(data);
  },

  updateThb(data) {
    check(data.id, String);
    check(data, Object);
    data.updatedBy = Meteor.userId();
    data.updatedAt = new Date();
    return Tarekats.update(
      {
        _id: data.id,
      },
      {
        $set: data,
      }
    );
  },

  deleteThb(id) {
    check(id, String);
    return Tarekats.remove({
      _id: id,
    });
  },
});
