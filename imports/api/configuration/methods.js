import { Configuration } from "./configuration";
// import { Roles } from "./roles"
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import moment from "moment";

Meteor.methods({
    "config.createLetterCategory"(data){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners;

        const dataSave = {
            name: data.name,
            type: "kategori-surat",
            format: data.formatNomorSurat,
            receiver: data.penerima,
            createdAt: new Date(),
            createdBy: thisUser,
            partnerCode: partnerCode[0],
            counter: 0
        }

        return Configuration.insert(dataSave)
    },
    "config.editLetterCategory"(data, id){

        const dataSave = {
            name: data.name,
            format: data.formatNomorSurat,
            receiver: data.penerima,
        }

        return Configuration.update({_id: id},{ $set: dataSave })
    },
    "config.getConfig"(jenis){
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        return Configuration.find({type: jenis, partnerCode: adminPartner.partners[0]}).fetch();
    },
    "config.getByID"(id){
        return Configuration.findOne({_id: id});
    },
    "config.delete"(id) {
        return Configuration.remove({_id: id});
    }
})