import { Mongo } from "meteor/mongo";

export const OnlineCourses = new Mongo.Collection("onlineCourses");
export const SessionCourses = new Mongo.Collection("sessions");


Meteor.methods({
    'onlineCourses.getAll'(){
        const thisUser = Meteor.users.findOne({_id: this.userId});
        if (!thisUser) {
            throw new Meteor.Error(404, "Failed");
        }
        return OnlineCourses.find({}).fetch();
    },
    "onlineCourses.getById"(id){
        const thisUser = Meteor.users.findOne({_id: this.userId});
        if (!thisUser) {
            throw new Meteor.Error(404, "Failed");
        }
        const objectId = new Mongo.ObjectID(id);

        const getSessions = SessionCourses.find({ocId : id}).fetch();

        const thisCourse = OnlineCourses.findOne({_id : objectId});

        return {...thisCourse, sessions : getSessions}
    },
    "onlineCourses.update"(id, data){
        const thisUser = Meteor.users.findOne({_id: this.userId});
        if(!thisUser){
            throw new Meteor.Error(404, "Failed");
        }

        const objectId = new Mongo.ObjectID(id);
        const thisCourse = OnlineCourses.findOne({_id : objectId});

        const newSessions = data.sessions.filter(session => {
            return !session._id
        }).map(session => {
            return {...session, ocId : id, ocName : thisCourse.name}
        })

        for (let index = 0; index < newSessions.length; index++) {
            const element = newSessions[index];

            SessionCourses.insert(element)
        }


    }
})