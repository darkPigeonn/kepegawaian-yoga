import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';

import { Roles } from "meteor/alanning:roles";
import moment from "moment";
import { Employee } from "../employee/employee";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
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

    "users.getDataNotEmployee"() {
        let dataFinal = [];
        const dataAppProfile = AppProfiles.find().fetch();
        for (let index = 0; index < dataAppProfile.length; index++) {
            const element = dataAppProfile[index];
            const objectIdString = element._id.toString().slice(10, -2);
            const dataAppUser = AppUsers.findOne({profileId : objectIdString})
            if(dataAppUser){
                const dataEmployee = Employee.findOne({email_address: dataAppUser.email});
                if(!dataEmployee){
                    dataAppUser.fullname = dataAppProfile[index].fullName
                    dataFinal.push(dataAppUser)
                }
            }
        }
        return dataFinal;

    },
    "users.createDataEmployee"(id) {
        id = id.toString().slice(10, -2);
        const objectId = new Meteor.Collection.ObjectID(id);
        const dataAppuser = AppUsers.findOne({_id: objectId});
        const objectIdAppProfile = new Meteor.Collection.ObjectID(dataAppuser.profileId);
        const dataAppProfile = AppProfiles.findOne({_id: objectIdAppProfile});
        console.log(dataAppProfile);
        const dataSave = {
            full_name : dataAppProfile.fullName,
            identification_number: "",
            place_of_birth : "",
            dob: null,
            gender: "",
            address: "",
            phone_number: "",
            email_address: dataAppProfile.email,
            job_position: "",
            department_unit: "",
            start_date: null,
            employment_status: null,
            base_salery: 0,
            allowances: 0,
            deductions: 0,
            highest_education: null,
            eduation_institution: null,
            major_in_highest_education: null,
            academic_degree: null,
            previous_work_experience: null,
            marital_status: null,
            number_of_children: 0,
            emergency_contact_name: null,
            emergency_contact_name: null,
            golongan: 0,
            partnerCode: dataAppProfile.outlets[0],
            linkGambar: "-",
            status: 10,
            statusDelete: 0,
            createdAt: new Date(),
            createdBy: "SuperAdmin",
            historyMutasi: []
        }
        return Employee.insert(dataSave)
    },

    "users.getAppUsers"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners[0];
        return AppUsers.find({outlets: partnerCode}).fetch()
    },

    async "users.updateProfileIdAppUser"(data){
        console.log(data);

        for (const iterator of data) {
            const objectIdString = iterator.idAppUser.toString().slice(10, -2);
            const objectId = new Meteor.Collection.ObjectID(objectIdString);
            let getEmployee = await Employee.findOne({_id: iterator.idEmployee});
            const cek = await AppUsers.findOne({_id : objectId});
            const objectIdProfile = new Meteor.Collection.ObjectID(cek.profileId);
            const getAppProfiles = await AppProfiles.findOne({_id: objectIdProfile});
            const oldIdProfile = getAppProfiles._id.toString().slice(10, -2);
            delete getAppProfiles._id;
            getEmployee = { ...getEmployee, ...getAppProfiles };

            // Menambahkan field oldIdProfile ke dalam getEmployee
            getEmployee.oldIdProfile = oldIdProfile;
            if(getEmployee.isUpdated == undefined || getEmployee.isUpdated == null || getEmployee.isUpdated == false) {
                getEmployee.isUpdated = false;
            }

            if(!getEmployee.isUpdated){
                getEmployee.isUpdated = true;
                const updateEmployee = await Employee.update({
                    _id: iterator.idEmployee
                },
                {
                    $set: getEmployee
                })
            }
        }

        //buat old data idProfile untuk jaga"
        for (const iterator of data) {
            const objectIdString = iterator.idAppUser.toString().slice(10, -2);
            const objectId = new Meteor.Collection.ObjectID(objectIdString);
            const cek = await AppUsers.findOne({_id : objectId});

            const makeOldIdProfile = await AppUsers.update({
                _id: objectId
            },
            {
                $set: { oldIdProfile : cek.profileId}
            })
        }

        let dataFail = [];
        let flag = true;

        //update profileId appUsers dengan employee
        for (const iterator of data) {
            try {
                console.log(iterator.idEmployee);
                const objectIdString = iterator.idAppUser.toString().slice(10, -2);
                const objectId = new Meteor.Collection.ObjectID(objectIdString);
                const updateProfileId = await AppUsers.update({
                    _id : objectId
                },
                {
                    $set: { profileId : iterator.idEmployee}
                })
            } catch (error) {
                console.log(error);
                flag = false;
                dataFail.push(iterator.emailEmployee)
            }
        }
        if(flag == false){
            console.log("Ini adalah data yang error : ", dataFail);
            return dataFail
        }
        else {
            return "success"
        }
    }
})
