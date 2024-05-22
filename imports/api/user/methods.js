import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';
import { HTTP } from "meteor/http";
import { Email } from "meteor/email"
import { Roles } from "meteor/alanning:roles";
import moment from "moment";
const generator = require("generate-password");
export const Lecturers = new Mongo.Collection("lecturers", { idGeneration: 'MONGO' });
process.env.APP_IDMOBILE = Meteor.settings.APP_IDMOBILE;
process.env.APP_SECRETMOBILE = Meteor.settings.APP_SECRETMOBILE;
Meteor.methods({
    "employee.sendResetPassword" (username){
       const response = HTTP.call("POST", `http://localhost:3005/imavi/users/dosen/reset-password`, {
            headers: {
                Id: process.env.APP_IDMOBILE,
                Secret: process.env.APP_SECRETMOBILE,
            },
            data: {
                username
            },
        });
        // console.log(response.data)
    },
    "users.changePassword" (body){
        const thisUser = Meteor.users.findOne({_id: this.userId});
        console.log(thisUser);
        if (!thisUser){
            throw new Meteor.Error(404,'No Access');
        }
        const user = Meteor.users.findOne({_id: body.userId});
        const newPassword = body.newPassword;
        const oldPassword = {
            digest: Package.sha.SHA256(body.old),
            algorithm: "sha-256",
        };
        if (thisUser.roles.includes("admin")){
            Accounts.setPassword(body.userId, newPassword);
        }else{
            const result = Accounts._checkPassword(user, oldPassword);

            if (!result.error) {
                Accounts.setPassword(body.userId, newPassword);
            } else {
                throw new Meteor.Error('invalid-old-password', 'Invalid old password', { logout: false });
            }
        }


    },
    "employee.checkToken" (resetToken){
       const user = Meteor.users.findOne({resetToken})
       if (user){
        return user._id
       } else {
        return false;
       }
     },
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

        // console.log(dataSend);
        // return

        // console.log([dataSend.role]);
        Roles.createRole(dataSend.role, {unlessExists: true});
        // return
        // console.log(dataSend.fullname);

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: dataSend.password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            // console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                partnerCode = adminPartner.partners[0];
                return await Meteor.users.update({ _id }, { $set: { roles: [dataSend.role], fullname: dataSend.fullname, partners: [partnerCode] } })
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

        // console.log(dataSend);
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
            // console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                // console.log(adminPartner);
                partnerCode = adminPartner.partners;
                return await Meteor.users.update({ _id }, { $set: { roles: ["admin"], fullname: dataSend.fullname, partners: [dataSend.partners] } })
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
        // console.log(dataSave);
        return Meteor.users.update({ _id: id }, { $set: { username: dataSave.username, fullname: dataSave.fullname, roles: [dataSave.roles] } })
    },

    "users.editPassword"(id, password){
        check(id, String);
        check(password, String);
        Accounts.setPassword(id, password);
        return true;
    },

    "dosen.insert" (formData){
        const thisUser = Meteor.users.findOne({_id : this.userId})
        if(!thisUser) {
            throw new Meteor.Error(404, 'No Access')
        }
        const password = generator.generate({
            length: 12,
            symbols: true,
            lowercase: true,
            uppercase: true,
            numbers: true,
            strict: true,
          });

        formData.password = password;
        const _id =  Accounts.createUser(formData);
        delete formData.username
        delete formData.password
        formData.userId = _id
        const profileId = Lecturers.insert(formData)
        return Meteor.users.update({ _id }, { $set: {
            status: true,
            roles: ["dosen"],
            profileId: profileId.toHexString()
        } })
    },

    "dosen.delete" (_id){
        const user = Meteor.users.update({_id}, {$set: {status: false}})
    },

    "dosen.getMine" (){
        const users = Meteor.users.findOne({_id: Meteor.userId()})
        const profile = Lecturers.findOne({_id: new Meteor.Collection.ObjectID(users.profileId)})
        if (profile)
            delete profile._id
        return Object.assign(users, profile)
    },

    "dosen.getAll" (){
        const users =  Meteor.users.find({
            roles: {
                $in :  ["dosen"]
            },
            status: true

        }).fetch()
        for (const element of users) {
            const profile = Lecturers.findOne({userId: element._id})
            element.profile = profile
        }
        console.log(users)
        return users
    },

    "dosen.getDetails"(_id){
        const user = Meteor.users.findOne({_id})
        const profiles = Lecturers.findOne({userId: user._id})

        delete profiles._id
        return Object.assign(user,profiles)
    },

    "dosen.update"($set){
        const _id = $set._id
        delete $set._id
        const userUpdate = {
            email: $set.email,
            username: $set.username,
        }
        delete $set.email
        delete $set.username
        const user = Meteor.users.update({_id}, {$set: userUpdate})
        const profile = Lecturers.update({userId: _id}, {$set})
        return user
    }
})
