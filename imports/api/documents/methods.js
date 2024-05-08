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
    const {category, note, purpose, attachment, subject, desc, dataAlur, tanggalBerlaku, tanggalBerakhir} = data;

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

    //masih belum bisa generate nomor surat
    // ALUR PENGECEKAN
    // 1. Cek tanggalBerlaku dan tanggalBerakhir apakah undefined atau tidak (hasil kiriman dari client)
    // 2. Cek dataAlurnya undefined atau tidak dari client

    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
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
        let dataAlurFinal = [];
        for (let index = 0; index < dataAlur.length; index++) {
          const element = dataAlur[index];
          const data = {
            order: index+1,
            jabatan: element,
            analisis: ""
          }
          dataAlurFinal.push(data);
        }
        modelData = {
          category,
          note,
          purpose,
          attachment,
          subject,
          desc,
          alur: dataAlurFinal,
          status: 10,
          currentOrder: 0,
          currentJabatan: dataAlur[0],
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    else {
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
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
      else {
        let dataAlurFinal = [];
        for (let index = 0; index < dataAlur.length; index++) {
          const element = dataAlur[index];
          const data = {
            order: index+1,
            jabatan: element,
            analisis: ""
          }
          dataAlurFinal.push(data);
        }
        modelData = {
          category,
          note,
          purpose,
          attachment,
          subject,
          desc,
          alur: dataAlurFinal,
          status: 10,
          currentOrder: 0,
          currentJabatan: dataAlur[0],
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    

    //buat timeline
    const timeline = {
      event: "created",
      operator: thisUser._id,
      operatorName: thisUser.fullname,
      timestamp: new Date()
    }
    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    const insert = Letters.insert(modelData);
    return Letters.update({_id: insert}, {$push: {
      timeline: timeline
    }}, {upsert: true})
  },

  "korespondensi.editSimpan"(id, data) {
    const {category, note, purpose, attachment, subject, desc, dataAlur, tanggalBerlaku, tanggalBerakhir,dataSigner } = data;
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

    //masih belum bisa generate nomor surat
    // ALUR PENGECEKAN
    // 1. Cek tanggalBerlaku dan tanggalBerakhir apakah undefined atau tidak (hasil kiriman dari client)
    // 2. Cek dataAlurnya undefined atau tidak dari client

    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
      if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0 || dataSigner == undefined || dataSigner == null || dataSigner.length == 0) {
        modelData = {
          category,
          note,
          purpose,
          attachment,
          subject,
          desc,
          alur: [],
          signer:[],
          status: 10,
          currentOrder: 0,
          currentJabatan: "",
          partner: thisUser.partners[0],
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
          signer:dataSigner,
          status: 10,
          currentOrder: 0,
          currentJabatan: dataAlur[0].jabatan,
          partner: thisUser.partners[0],
        };
      }
    }
    else {
      if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0 || dataSigner == undefined || dataSigner == null || dataSigner.length == 0) {
        modelData = {
          category,
          note,
          purpose,
          attachment,
          subject,
          desc,
          alur: [],
          signer:[],
          status: 10,
          currentOrder: 0,
          currentJabatan: "",
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
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
          signer:dataSigner,
          status: 10,
          currentOrder: 0,
          currentJabatan: dataAlur[0].jabatan,
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
        };
      }
    }

    const timeline = {
      event: "edited",
      operator: thisUser._id,
      operatorName: thisUser.fullname,
      timestamp: new Date()
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
      return Letters.update({ _id: id }, { $set: modelData, $push: {
        timeline: timeline
      },
      $unset: {
        tanggalBerlaku: "",
        tanggalBerakhir: ""
      }});
    }
    else {
      return Letters.update({ _id: id }, { $set: modelData, $push: {
        timeline: timeline
      }});
    }
  },

  "korespondensi.save"(data) {
    const {category, name, purpose, attachment, subject, desc, dataAlur, tanggalBerlaku, tanggalBerakhir,dataSigner } = data;
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

    //masih belum bisa generate nomor surat
    // ALUR PENGECEKAN
    // 1. Cek tanggalBerlaku dan tanggalBerakhir apakah undefined atau tidak (hasil kiriman dari client)
    // 2. Cek dataAlurnya undefined atau tidak dari client

    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
      if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0 || dataSigner == undefined || dataSigner == null || dataSigner.length == 0) {
        modelData = {
          category,
          name,
          purpose,
          attachment,
          subject,
          desc,
          alur: [],
          signer:[],
          status: 11,
          currentOrder: 0,
          currentJabatan: "sekretaris-keuskupan",
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
      else {
        let dataAlurFinal = [];
        let dataSignerFinal = [];
        for (let index = 0; index < dataAlur.length; index++) {
          const element = dataAlur[index];
          const sign = dataSigner[index];
          const data = {
            order: index+1,
            jabatan: element,
            analisis: "",
            nameSignotory:sign,
            positionSignotory:sign

          }
          dataAlurFinal.push(data);
          dataSignerFinal.push(data);

        }
        modelData = {
          category,
          name,
          purpose,
          attachment,
          subject,
          desc,
          alur: dataAlurFinal,
          listKorespondensiSigner:dataSignerFinal,
          status: 11,
          currentOrder: 1,
          currentJabatan: dataAlur[0],
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    else {
      if(dataAlur == undefined || dataAlur == null || dataAlur.length == 0) {
        modelData = {
          category,
          name,
          purpose,
          attachment,
          subject,
          desc,
          alur: [],
          listKorespondensiSigner:[],
          status: 11,
          currentOrder: 0,
          currentJabatan: "sekretaris-keuskupan",
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
      else {
        let dataAlurFinal = [];
        let dataSignerFinal =[];
        for (let index = 0; index < dataAlur.length; index++) {
          const element = dataAlur[index];
          const sign = dataSigner[index];
          const data = {
            order: index+1,
            jabatan: element,
            analisis: "",
            nameSignotory:sign,
            positionSignotory:sign
          }
          dataAlurFinal.push(data);
          dataSignerFinal.push(data);
        }
        modelData = {
          category,
          name,
          purpose,
          attachment,
          subject,
          desc,
          alur: dataAlurFinal,
          listKorespondensiSigner:dataSignerFinal,
          status: 11,
          currentOrder: 1,
          currentJabatan: dataAlur[0],
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    

    //buat timeline
    const timeline = {
      event: "submitted",
      operator: thisUser._id,
      operatorName: thisUser.fullname,
      timestamp: new Date()
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    const insert = Letters.insert(modelData);
    return Letters.update({_id: insert}, {$push: {
      timeline: timeline
    }}, {upsert: true})
  },

  "korespondensi.editKirim"(id, data) {
    const {category, note, purpose, attachment, subject, desc, dataAlur, tanggalBerlaku, tanggalBerakhir } = data;
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

    //masih belum bisa generate nomor surat
    // ALUR PENGECEKAN
    // 1. Cek tanggalBerlaku dan tanggalBerakhir apakah undefined atau tidak (hasil kiriman dari client)
    // 2. Cek dataAlurnya undefined atau tidak dari client
    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
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
          currentJabatan: dataAlur[0].jabatan,
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    else {
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
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
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
          currentJabatan: dataAlur[0].jabatan,
          tanggalBerlaku: new Date(tanggalBerlaku),
          tanggalBerakhir: new Date(tanggalBerakhir),
          partner: thisUser.partners[0],
          createdAt: new Date(),
          createdBy: thisUser._id,
        };
      }
    }
    

    //buat timeline
    const timeline = {
      event: "submitted",
      operator: thisUser._id,
      operatorName: thisUser.fullname,
      timestamp: new Date()
    }

    //perlu penjagaan surat ini dibuat oleh siapa selain dari user
    //maksud nya seperti partner (Keuskupan) atau department
    //TINDAKAN:
    //Penjagaan partner sudah diambil dari partner pembuat surat

    // if (!thisUser.partner) {
    //   modelData.partner = "default";
    // }

    if(tanggalBerlaku == undefined || tanggalBerakhir == undefined) {
      return Letters.update({ _id: id }, { $set: modelData, $push: {
        timeline: timeline
      },
      $unset: {
        tanggalBerlaku: "",
        tanggalBerakhir: ""
      }});
    }
    else {
      return Letters.update({ _id: id }, { $set: modelData, $push: {
        timeline: timeline
      }});
    }
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
        // console.log(element.category);
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
    const idUser = Meteor.userId();
    const thisUser = Meteor.users.findOne({ _id: idUser });
    const timeline = {
      event: "Setted Alur",
      operator: thisUser._id,
      operatorName: thisUser.fullname,
      timestamp: new Date()
    }
    return Letters.update({ _id: id }, 
    { 
        $push: { alur: { $each: dataAlurObject } }, 
        $set: { 
          currentOrder: 1, 
          currentJabatan: dataAlurObject[0].jabatan,
          status: 12
        } ,
        $push: {
          timeline: timeline
        }
    }
    )
  },

  "korespondensi.delete"(id){
    return Letters.remove({_id: id});
  },

  "korespondensi.uploadArsip"(data, id) {
    check(data, Object)
    try {
      const idUser = Meteor.userId();
      const thisUser = Meteor.users.findOne({ _id: idUser });
      const timeline = {
        event: "Arsip Sended",
        operator: thisUser._id,
        operatorName: thisUser.fullname,
        timestamp: new Date()
      }
      return Letters.update({_id: id}, {
        $set: {
          linksArsip: data.linksArsip
        },
        $push: {
          timeline: timeline
        }
      })
    } catch (error) {
      throw new Meteor.Error(412, "Unggah File Arsip Gagal");
    }
  }
});
