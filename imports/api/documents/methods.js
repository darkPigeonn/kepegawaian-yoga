import { Document, Letters } from "./documents";
import { Configuration } from "../configuration/configuration";
// import { Roles } from "./roles"
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import moment from "moment";

Meteor.methods({
  async "document.tambahDokumen"(data) {
    let { full_name, sumber, tanggal, jenis_dokumen, alur, linkPDF } = data;
    check(full_name, String);
    check(sumber, String);
    check(jenis_dokumen, String);
    check(linkPDF, String);
    let dataAlurObject = [];
    let currentOrder;
    let currentJabatan;
    tanggal = new Date(tanggal);

    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      // console.log(element);
      let dataAlur = {
        order: index + 1,
        jabatan: alur[index],
        analisis: "",
      };
      dataAlurObject.push(dataAlur);
    }

    for (let index = 0; index < dataAlurObject.length; index++) {
      currentOrder = dataAlurObject[0].order;
      currentJabatan = dataAlurObject[0].jabatan;
    }

    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];

    const dataSave = {
      name: full_name,
      sumberDokumen: sumber,
      tanggal,
      jenis_dokumen,
      linkPDF,
      alur: dataAlurObject,
      currentOrder,
      currentJabatan,
      partner: partnerCode,
    };

    return await Document.insert(dataSave);
  },

  "document.getAllDocuments"() {
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    const data = Document.find(
      { partner: partnerCode },
      { sort: { tanggal: -1 } }
    ).fetch();
    // console.log(data);
    return data;
  },

  "document.getDocumentsByID"(id) {
    const data = Document.findOne({ _id: id });
    // console.log(data);
    return data;
  },

  "document.getDocumentByRoles"(role) {
    // console.log(role);
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    const data = Document.find({
      currentJabatan: role,
      partner: partnerCode,
    }).fetch();
    // console.log(data);
    return data;
  },

  "document.getHistoryByPengisi"(role) {
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    const data = Document.find({
      "alur.jabatan": role,
      partner: partnerCode,
    }).fetch();
    return data.filter((x) => {
      return x.alur.find((y) => y.analisis.length && y.jabatan == role);
    });
  },

  "document.updateReview"(id, idUser, dataReview) {
    const dataDocumentByID = Document.findOne({ _id: id });
    const dataUser = Meteor.users.findOne({ _id: idUser });
    // console.log(data);
    // console.log(dataUser.roles);
    const roleUser = dataUser.roles;
    const alur = dataDocumentByID.alur;
    // console.log(dataReview);
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      const alurNext = alur[index + 1];
      // console.log(element.order, element.jabatan);
      //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
      if (index === alur.length - 1) {
        return Document.update(
          { _id: id, "alur.jabatan": element.jabatan },
          {
            $set: {
              "alur.$.analisis": dataReview,
              currentOrder: "99",
              currentJabatan: "Review Selesai",
            },
          }
        );
      } else {
        if (roleUser == element.jabatan) {
          const value = index + 2;
          const currentOrder = value.toString();
          return Document.update(
            { _id: id, "alur.jabatan": element.jabatan },
            {
              $set: {
                "alur.$.analisis": dataReview,
                currentOrder: currentOrder,
                currentJabatan: alurNext.jabatan,
              },
            }
          );
        }
      }
    }
  },

  "document.updateReviewTolak"(id, idUser, dataReview) {
    const dataDocumentByID = Document.findOne({ _id: id });
    const dataUser = Meteor.users.findOne({ _id: idUser });
    // console.log(data);
    // console.log(dataUser.roles);
    const roleUser = dataUser.roles;
    const alur = dataDocumentByID.alur;
    // console.log(dataReview);
    for (let index = 0; index < alur.length; index++) {
      const element = alur[index];
      // console.log(element.order, element.jabatan);
      //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai

      if (roleUser == element.jabatan) {
        return Document.update(
          { _id: id, "alur.jabatan": element.jabatan },
          {
            $set: {
              "alur.$.analisis": dataReview,
              currentOrder: "1",
              currentJabatan: alur[0].jabatan,
            },
          }
        );
      }
    }
  },

  "employee.getDataLogin"(id) {
    const data = Meteor.users.findOne({ _id: id });
    // console.log(data);
    return data.roles;
  },

  "korespondensi.create"(data) {
    const {category, note, purpose, attachment, subject, desc, dataAlur } = data;

    const idUserPengisi = Meteor.userId();
    const thisUser = Meteor.users.findOne({ _id: idUserPengisi });

    if (!thisUser) {
      throw new Meteor.Error(412, "No Access");
    }
    let modelData;
    //status surat
    //10 : draft
    //11 : send to level 1
    //20 : send to level 2
    //30 : send to level 3
    //60 : success
    //80 : final cetak
    //90 : reject
    //BILA ALUR ADALAH NULL, MAKA AKAN LANGSUNG MENGARAH KE SEKRETARIS-KEUSKUPAN DAN STATUS LANGSUNG BERUBAH MENJADI 11

    //masih belum bisa generate
    if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0) {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: [],
        status: 10,
        currentOrder: 0,
        currentJabatan: "",
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }
    else {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: dataAlur,
        status: 10,
        currentOrder: 0,
        currentJabatan: dataAlur[0],
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    return Letters.insert(modelData);
  },

  "korespondensi.editSimpan"(id, data) {
    const {category, note, purpose, attachment, subject, desc, dataAlur } = data;

    const idUserPengisi = Meteor.userId();
    const thisUser = Meteor.users.findOne({ _id: idUserPengisi });

    if (!thisUser) {
      throw new Meteor.Error(412, "No Access");
    }
    let modelData;
    //status surat
    //10 : draft
    //11 : send to level 1
    //20 : send to level 2
    //30 : send to level 3
    //60 : success
    //80 : final cetak
    //90 : reject
    //BILA ALUR ADALAH NULL, MAKA AKAN LANGSUNG MENGARAH KE SEKRETARIS-KEUSKUPAN DAN STATUS LANGSUNG BERUBAH MENJADI 11

    //masih belum bisa generate
    if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0) {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: [],
        status: 10,
        currentOrder: 0,
        currentJabatan: "",
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }
    else {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: dataAlur,
        status: 10,
        currentOrder: 0,
        currentJabatan: dataAlur[0],
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    return Letters.update({ _id: id }, { $set: modelData });
  },

  "korespondensi.save"(data) {
    const {category, name, purpose, attachment, subject, desc, dataAlur } = data;
    const idUserPengisi = Meteor.userId();
    const thisUser = Meteor.users.findOne({ _id: idUserPengisi });
    if (!thisUser) {
      throw new Meteor.Error(412, "No Access");
    }

    console.log(dataAlur);
    let modelData;
    //status surat
    //10 : draft
    //11 : send to level 1
    //20 : send to level 2
    //30 : send to level 3
    //60 : success
    //80 : final cetak
    //90 : reject
    //BILA ALUR ADALAH NULL, MAKA AKAN LANGSUNG MENGARAH KE SEKRETARIS-KEUSKUPAN DAN STATUS LANGSUNG BERUBAH MENJADI 11

    //masih belum bisa generate
    if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0) {
      modelData = {
        category,
        name,
        purpose,
        attachment,
        subject,
        desc,
        alur: [],
        status: 11,
        currentOrder: 0,
        currentJabatan: "sekretaris-keuskupan",
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }
    else {
      modelData = {
        category,
        name,
        purpose,
        attachment,
        subject,
        desc,
        alur: dataAlur,
        status: 11,
        currentOrder: 1,
        currentJabatan: dataAlur[0],
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    return Letters.insert(modelData);
  },

  "korespondensi.editKirim"(id, data) {
    const {category, note, purpose, attachment, subject, desc, dataAlur } = data;
    const idUserPengisi = Meteor.userId();
    const thisUser = Meteor.users.findOne({ _id: idUserPengisi });
    if (!thisUser) {
      throw new Meteor.Error(412, "No Access");
    }

    console.log(category);
    console.log(dataAlur);
    let modelData;
    //status surat
    //10 : draft
    //11 : send to level 1
    //20 : send to level 2
    //30 : send to level 3
    //60 : success
    //80 : final cetak
    //90 : reject
    //BILA ALUR ADALAH NULL, MAKA AKAN LANGSUNG MENGARAH KE SEKRETARIS-KEUSKUPAN DAN STATUS LANGSUNG BERUBAH MENJADI 11

    //masih belum bisa generate
    if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0) {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: [],
        status: 11,
        currentOrder: 0,
        currentJabatan: "sekretaris-keuskupan",
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }
    else {
      modelData = {
        category,
        note,
        purpose,
        attachment,
        subject,
        desc,
        alur: dataAlur,
        status: 11,
        currentOrder: 1,
        currentJabatan: dataAlur[0],
        partner: thisUser.partners[0],
        createdAt: new Date(),
        createdBy: thisUser._id,
      };
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    return Letters.update({ _id: id }, { $set: modelData });
  },

  "korespondensi.getByRoles"(role) {
    // console.log(role);
    //Untuk mendapatkan data yang harus direview oleh masing-masing role
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    const data = Letters.find({
      currentJabatan: role,
      partner: partnerCode,
      status: { $ne: 10 }
    }).fetch();
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.category!= "" || element.category != null || element.category != undefined) {
        const dataKonfig = Configuration.findOne({_id: element.category})
        element.categoryName = dataKonfig.name;
      }
    }
    // console.log(data);
    return data;
  },

  "korespondensi.getByCreator"() {
    const thisUser = Meteor.userId();
    const data = Letters.find({
      createdBy: thisUser
    }).fetch()
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.category!= "" || element.category != null || element.category != undefined) {
        const dataKonfig = Configuration.findOne({_id: element.category})
        element.categoryName = dataKonfig.name;
      }
    }
    return data;
  },

  "korespondensi.getAll"() {
    const data = Letters.find({},
      { $sort: { createdAt: -1 } }
    ).fetch();
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.category!= "" || element.category != null || element.category != undefined) {
        const dataKonfig = Configuration.findOne({_id: element.category})
        element.categoryName = dataKonfig.name;
      }
    }
    return data;
  },
  
  "korespondensi.getById"(id) {
    const data = Letters.findOne({_id: id});
    return data;
  },

  "korespondensi.getHistoryByPengisi"(role) {
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    const data = Letters.find({
      "alur.jabatan": role,
      partner: partnerCode,
    }).fetch();
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.category!= "" || element.category != null || element.category != undefined) {
        console.log(element.category);
        const dataKonfig = Configuration.findOne({_id: element.category})
        element.categoryName = dataKonfig.name;
      }
    }
    return data.filter((x) => {
      return x.alur.find((y) => y.analisis.length && y.jabatan == role);
    });
  },

  "korespondensi.updateAlur"(id, dataRow){
    let dataAlurObject = [];
    for (let index = 0; index < dataRow.length; index++) {
      const element = dataRow[index];
      let dataAlur = {
          order: index+1,
          jabatan: element,
          analisis: ""
      }
      dataAlurObject.push(dataAlur)
    }
    return Letters.update({ _id: id }, 
    { 
        $push: { alur: { $each: dataAlurObject } }, 
        $set: { 
          currentOrder: 1, 
          currentJabatan: dataAlurObject[0].jabatan,
          status: 12
        } 
    }
    )
  },

  "korespondensi.delete"(id){
    return Letters.remove({_id: id});
  }
});
