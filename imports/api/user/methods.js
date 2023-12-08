import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';
import { Roles } from "meteor/alanning:roles";
import moment from "moment";
Meteor.methods({
    "users.getAll"(){
        // console.log(Meteor.users.find().fetch());
        return Meteor.users.find().fetch();
    },
    async "users.createAppMeteor"(dataSend){
        check(dataSend, Object);

        console.log(dataSend);
        // return

        console.log([dataSend.role]);
        Roles.createRole(dataSend.role, {unlessExists: true});
        // return
        console.log(dataSend.fullname);

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
                // console.log("masuk");
                
                // Roles.addUsersToRoles(_id, dataSend.role)
                return await Meteor.users.update({ _id }, { $set: { roles: [dataSend.role], fullname: dataSend.fullname } })
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
})
