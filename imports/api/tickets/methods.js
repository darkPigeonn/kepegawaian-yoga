import { Tickets } from "./tickets.js";
import { Tasks } from "../tasks/tasks.js";
import { Employee } from "../employee/employee";
import { Letters } from "../documents/documents.js";
import { Notifications } from "../notification/notification";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import { check } from "meteor/check";
import moment from "moment";

Meteor.methods({
    "tickets.getPekerja"(){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });

        // if relatedUser tidak ada partner -> cari ke Employee demgan menggunakan profileId dari user
        // ke employee
        let partner
        console.log(relatedUser.partners.length);
        if(relatedUser.partners.length == 0 || relatedUser.partner == undefined || relatedUser.partner == null) {
            const getPartner = Employee.findOne({_id: relatedUser.profileId})
            partner = getPartner.partnerCode;
            const data = Employee.find({partnerCode: partner}).fetch();
            return data;
        }
        console.log("Partner Code : ", relatedUser.partners[0]);
        const data = Employee.find({partnerCode: relatedUser.partners[0]}).fetch();
        return data;
    },

    "tickets.getAll"(){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        if(relatedUser.roles[0] == "admin"){
            const data = Tickets.find({partner: relatedUser.partners[0]}).fetch()
            return data
        }
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        const data = Tickets.find({partner: relatedEmployee.partnerCode, $or: [
            { createdBy: relatedEmployee._id }, // Jika pengguna saat ini adalah pembuat tiket
            { 'workers._id': relatedEmployee._id } // Jika pengguna saat ini adalah salah satu pekerja di tiket
          ]}).fetch()
        const dataPlus = data.map(element => {
            element.isOwned = element.createdBy === relatedEmployee._id ? 1 : 0;
            return element;
        });
        return dataPlus;
    },

    "tickets.getById"(id){
        const objectId = new Meteor.Collection.ObjectID(id);
        return Tickets.findOne({_id: objectId});
    },

    "tickets.createTicket"(data){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        try {
            const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
            data._id = new Mongo.ObjectID() //create _id with objectID
            data.partner = relatedEmployee.partnerCode;
            data.message = [];
            data.timeline = [{
                message: "Ticket Dibuat",
                createdAt: new Date()
            }];
            data.status = "Dibuka";
            data.createdAt = new Date();
            data.createdBy = relatedEmployee._id;
            data.createdByName = relatedEmployee.full_name;

            return Tickets.insert(data);
        } catch (error) {
            throw new Meteor.Error(412, error)
        }
        
    },

    "tickets.editTicket"(id, data, timeline){
        check(id, String);
        check(data, Object);
        check(timeline, Object)
        const objectId = new Meteor.Collection.ObjectID(id);
        return Tickets.update({_id: objectId}, {$set: data, $push: {timeline: timeline}})
    },

    "tickets.delete"(id){
        const objectId = new Meteor.Collection.ObjectID(id);
        return Tickets.remove({_id: objectId});
    },

    "tickets.sendMessage"(id, data) {
        const objectId = new Meteor.Collection.ObjectID(id);
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        data.createdBy = thisUser;
        data.createdByName = relatedEmployee.full_name
        return Tickets.update({_id: objectId}, {$push: {message: data}});
    },

    "fileName.getAll" () {
        const dataTiket = Tickets.find().fetch();
        let fileName = [];
        for (const data of dataTiket) {
          for (const link of data.images) {
            fileName.push(link.name)
          }
        }
        const dataSurat = Letters.find().fetch();
        for (const data of dataSurat) {
            for (const link of data.linksArsip) {
                fileName.push(link.name)
            }
        }
        return fileName;
    },
})