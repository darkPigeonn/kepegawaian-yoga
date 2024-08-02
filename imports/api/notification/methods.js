import { Notifications } from "./notification";
import { Projects } from "../projects/projects";
import { Tasks } from "../tasks/tasks";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "notification.getAll"(email){
        const thisUser = Meteor.users.findOne({_id : this.userId})
        console.log(thisUser);

        return Notifications.find({receiverId : thisUser._id},{sort: {createdAt: -1}}).fetch();
    },
    "notification.insert"(data) {
        check(data, Array);

        const dataSave = {
            data,
            createdAt: new Date(),
        };

        return Notifications.insert(dataSave);
    },
    "notifications.getByUser"(){
        const thisUser = Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, "No Access");
        }

        const getNotification = Notifications.find({receiverId : thisUser._id},{sort : {createdAt : -1}}).fetch();
        //split to read and unread
        const readed = getNotification.filter(x => x.read);
        const unread = getNotification.filter(x => !x.read);

        return {
            readed : readed.length,
            unread : unread.length,
            items : getNotification
        }
    },
    "notifications.markAsRead"(){
        const thisUser = Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, "No Access");
        }

        return Notifications.update({receiverId : thisUser._id},{$set : {read : new Date()}},{multi : true})
    }
})