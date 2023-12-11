import { Document } from "./documents";
// import { Roles } from "./roles"
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';
import moment from "moment";

Meteor.methods({
    async "document.tambahDokumen"(data){
        let {full_name, sumber, tanggal, jenis_dokumen, alur, linkPDF} = data;
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
                order: index+1,
                jabatan: alur[index],
                analisis: ""
            }
            dataAlurObject.push(dataAlur)
        }

        for (let index = 0; index < dataAlurObject.length; index++) {
            currentOrder = dataAlurObject[0].order;
            currentJabatan = dataAlurObject[0].jabatan
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
            partner: partnerCode
        }

        return await Document.insert(dataSave);
    },

    "document.getAllDocuments"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
          });
        partnerCode = adminPartner.partners[0];
        const data = Document.find({partner: partnerCode}, {sort: {tanggal: -1}}).fetch();
        // console.log(data);
        return data;
    },

    "document.getDocumentsByID"(id){
        const data = Document.findOne({ _id: id });
        // console.log(data);
        return data;
    },

    "document.getDocumentByRoles"(role){
        // console.log(role);
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
          });
        partnerCode = adminPartner.partners[0];
        const data = Document.find({currentJabatan: role, partner: partnerCode}).fetch();
        // console.log(data);
        return data;
    },

    "document.getHistoryByPengisi"(role){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
          });
        partnerCode = adminPartner.partners[0];
        const data = Document.find({"alur.jabatan": role, partner: partnerCode}).fetch();
        return data.filter((x) => {
            return x.alur.find((y) => y.analisis.length && y.jabatan == role)
        })
    },

    "document.updateReview"(id, idUser, dataReview){
        const dataDocumentByID = Document.findOne({ _id: id });
        const dataUser = Meteor.users.findOne({_id:idUser});
        // console.log(data);
        // console.log(dataUser.roles);
        const roleUser = dataUser.roles;
        const alur = dataDocumentByID.alur;
        // console.log(dataReview);
        for (let index = 0; index < alur.length; index++) {
            const element = alur[index];
            const alurNext = alur[index+1];
            // console.log(element.order, element.jabatan);
            //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
            if(index === alur.length - 1){
                return Document.update({_id: id, "alur.jabatan":element.jabatan},
                    {
                        $set: {"alur.$.analisis": dataReview, currentOrder: "99", currentJabatan: "Review Selesai"}
                    });
            }
            else {
                if(roleUser == element.jabatan){
                    const value = index+2;
                    const currentOrder = value.toString();
                    return Document.update({_id: id, "alur.jabatan":element.jabatan},
                    {
                        $set: {"alur.$.analisis": dataReview, currentOrder: currentOrder, currentJabatan: alurNext.jabatan}
                    });
                }
            }
        }
    },

    "document.updateReviewTolak"(id, idUser, dataReview){
        const dataDocumentByID = Document.findOne({ _id: id });
        const dataUser = Meteor.users.findOne({_id:idUser});
        // console.log(data);
        // console.log(dataUser.roles);
        const roleUser = dataUser.roles;
        const alur = dataDocumentByID.alur;
        // console.log(dataReview);
        for (let index = 0; index < alur.length; index++) {
            const element = alur[index];
            // console.log(element.order, element.jabatan);
            //pengecekan apakah alur sudah selesai atau belum, bila sudah maka update statusSelesai
            
            if(roleUser == element.jabatan){
                return Document.update({_id: id, "alur.jabatan":element.jabatan},
                {
                    $set: {"alur.$.analisis": dataReview, currentOrder: "1", currentJabatan: alur[0].jabatan}
                });
            }
            
        }
    },

    "employee.getDataLogin"(id){
        const data = Meteor.users.findOne({_id:id});
        // console.log(data);
        return data.roles;
    },
});