import { Tickets } from "./tickets.js";
import { Tasks } from "../tasks/tasks.js";
import { Employee } from "../employee/employee";
import { Letters } from "../documents/documents.js";
import { ProposalReports } from "../proposalReport/proposalReport.js";
import { Notifications } from "../notification/notification";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import { check } from "meteor/check";
import moment from "moment";
const pagination = 20;

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
        if(relatedUser.partners.length == 0 || relatedUser.partners == undefined || relatedUser.partners == null) {
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
        if(relatedUser.roles[0] == "admin" || relatedUser.roles[0] == "chief"){
            const data = Tickets.find({partner: relatedUser.partners[0]}).fetch()
            return data
        }
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        const data = Tickets.find(
            {
                partner: relatedEmployee.partnerCode, $or: [
            { createdBy: relatedEmployee._id }, // Jika pengguna saat ini adalah pembuat tiket
            { 'workers._id': relatedEmployee._id } // Jika pengguna saat ini adalah salah satu pekerja di tiket
          ]
        },{
            sort: {
                createdAt: -1,
                status : 1
            }
        }).fetch()
        const dataPlus = data.map(element => {
            element.isOwned = element.createdBy === relatedEmployee._id ? 1 : 0;
            return element;
        });
        return dataPlus;
    },

    "tickets.getData"(query) {
    let data = {};
    if (query.title) {
      data.title = { $regex: new RegExp(query.title, 'i') }; // 'i' untuk case-insensitive
    }
    if (query.status) {
      data.status = query.status
    }
    data.partner = "imavi"
    let page = 1
    if (query.page) {
      page = parseInt(query.page)
    }
    const count = Tickets.find(data).count();
    const thePage = Array.from({
      length: count % pagination === 0 ? Math.floor(count / pagination) : Math.floor(count / pagination) + 1
    }, (v, i) => i + 1);
    let filteredItems = Tickets.find(data, {
      limit: pagination,
      skip: pagination * (page - 1),
      sort: {
        createdAt: -1
      }
    }).fetch();
    const thisUser = Meteor.userId()
    const relatedUser = Meteor.users.findOne({
        _id: thisUser,
    });
    const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
    if(relatedUser.roles[0] == "admin" || relatedUser.roles[0] == "chief") {
        return {
            data: filteredItems,
            page: thePage
        }
    }
    filteredItems = filteredItems.map(element => {
        element.isOwned = element.createdBy === relatedEmployee._id ? 1 : 0;
        return element;
    });
    return {
      data: filteredItems,
      page: thePage
    };
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
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        data._id = new Mongo.ObjectID() //create _id with objectID
        data.partner = relatedEmployee.partnerCode ?? "imavi";
        data.message = [];
        data.timeline = [{
            message: "Ticket Dibuat",
            createdAt: new Date()
        }];
        data.status = "Dibuka";
        data.createdAt = new Date();
        data.createdBy = relatedEmployee._id;
        data.createdByName = relatedEmployee.full_name;
        const idTicket = Tickets.insert(data);
        for (let index = 0; index < data.workers.length; index++) {
            const element = data.workers[index];
            const newDataSave = { 
                timestamp: new Date(),
                senderId: relatedEmployee._id,
                receiverId: element._id,
                message: `Anda di assign ke dalam tiket ${data.title}`,
                categoryId: 30,
                categoryName: "Ticket",
                createdAt: new Date(),
                createdBy: element._id,
                actionLink: `/tickets/detail/${idTicket._str}`
            };
            Notifications.insert(newDataSave);
        }
        return idTicket
        
    },

    "tickets.editTicket"(id, data, timeline){
        check(id, String);
        check(data, Object);
        check(timeline, Object)
        const objectId = new Meteor.Collection.ObjectID(id);
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        const update = Tickets.update({_id: objectId}, {$set: data, $push: {timeline: timeline}})
        const dataTicket = Tickets.findOne({_id: objectId})
        if(dataTicket) {
            for (let index = 0; index < dataTicket.workers.length; index++) {
                const element = dataTicket.workers[index];
                const newDataSave = { 
                    timestamp: new Date(),
                    senderId: relatedEmployee._id,
                    receiverId: element._id,
                    message: `Ada perubahan data atau status pada tiket ${dataTicket.title}`,
                    categoryId: 30,
                    categoryName: "Ticket",
                    createdAt: new Date(),
                    createdBy: element._id,
                    actionLink: `/tickets/detail/${objectId._str}`
                };
                Notifications.insert(newDataSave);
            }
        }
        return update
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
        const update = Tickets.update({_id: objectId}, {$push: {message: data}});
        const dataTicket = Tickets.findOne({_id: objectId})
        if(dataTicket) {
            for (let index = 0; index < dataTicket.workers.length; index++) {
                const element = dataTicket.workers[index];
                const newDataSave = { 
                    timestamp: new Date(),
                    senderId: relatedEmployee._id,
                    receiverId: element._id,
                    message: `Ada pesan baru pada tiket ${dataTicket.title}`,
                    categoryId: 30,
                    categoryName: "Ticket",
                    createdAt: new Date(),
                    createdBy: element._id,
                    actionLink: `/tickets/detail/${objectId._str}`
                };
                Notifications.insert(newDataSave);
            }
        }
        return update
    },

    "fileName.getAll" () {
        const dataTiket = Tickets.find().fetch();
        let fileName = [];
        if(dataTiket.length > 0) {
            for (const data of dataTiket) {
              for (const link of data.images) {
                fileName.push(link.name)
              }
            }
        }
        const dataSurat = Letters.find().fetch();
        if(dataSurat.length > 0) {
            for (const data of dataSurat) {
                for (const link of data.linksArsip) {
                    fileName.push(link.name)
                }
            }
        }

        const dataProposalReport = Letters.find().fetch();
        if(dataProposalReport.length > 0){
            for (const data of dataProposalReport) {
                for (const link of data.linksTransaction) {
                    fileName.push(link.name)
                }
                for (const link of data.linksActivity) {
                    fileName.push(link.name)
                }
            }
        }

        return fileName;
    },
})