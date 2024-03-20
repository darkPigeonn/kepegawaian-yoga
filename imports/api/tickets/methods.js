import { Tickets } from "./tickets.js";
import { Tasks } from "../tasks/tasks.js";
import { Employee } from "../employee/employee";
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

        const data = Employee.find({partnerCode: relatedUser.partners[0]}).fetch()
        return data;
    },

    "tickets.getAll"(){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
        const data = Tickets.find({partner: relatedEmployee.partnerCode})
        const dataPlus = data.map(element => {
            element.isOwned = element.createdBy === relatedEmployee._id ? 1 : 0;
            return element;
        });
        return dataPlus;
    },

    "tickets.createTicket"(data){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        const relatedEmployee = Employee.findOne({_id: relatedUser.profileId});
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
    },

    "fileName.getAll" () {
        const dataTiket = Tickets.find().fetch();
        let fileName = [];
        for (const data of dataTiket) {
          for (const link of data.images) {
            fileName.push(link.name)
          }
        }
        return fileName;
    },
})