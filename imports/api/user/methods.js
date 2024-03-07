import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';

import { Roles } from "meteor/alanning:roles";
import moment from "moment";
Meteor.methods({
    "users.getAll"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners;
        // console.log(Meteor.users.find().fetch());
        return Meteor.users.find({partners: partnerCode}).fetch();
    },
    "users.getAllSuperAdmin"(){
        return Meteor.users.find().fetch();
    },
    async "users.createAppMeteor"(dataSend){
        check(dataSend, Object);

        Roles.createRole(dataSend.role, {unlessExists: true});

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: dataSend.password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                partnerCode = adminPartner.partners[0];
                return Meteor.users.update({ _id }, { $set: { roles: [dataSend.role], fullname: dataSend.fullname, partners: [partnerCode] } })
            }

        } catch (error) {
            console.log(error);
            return error;
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    async "users.createAppMeteorSuperAdmin"(dataSend){
        check(dataSend, Object);

        console.log(dataSend);
        // return

        Roles.createRole("admin", {unlessExists: true});
        // return

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: dataSend.password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                console.log(adminPartner);
                partnerCode = adminPartner.partners;
                return Meteor.users.update({ _id }, { $set: { roles: ["admin"], fullname: dataSend.fullname, partners: [dataSend.partners] } })
            }

        } catch (error) {
            console.log(error);
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    "user.remove"(id){
        check(id, String);
        return Meteor.users.remove({_id: id});
    },

    "users.getById"(id){
        check(id, String);
        return Meteor.users.findOne({ _id: id });
    },

    "users.edit"(id, dataSave){
        check(id, String);
        check(dataSave, Object);
        console.log(dataSave);
        return Meteor.users.update({ _id: id }, { $set: { username: dataSave.username, fullname: dataSave.fullname, roles: [dataSave.roles] } })
    },

    "users.editPassword"(id, password){
        check(id, String);
        check(password, String);
        Accounts.setPassword(id, password);
        return true;
    },
    "users.getDataLogin"(id) {
        const data = Meteor.users.findOne({ _id: id });
        return data;
      },
})
