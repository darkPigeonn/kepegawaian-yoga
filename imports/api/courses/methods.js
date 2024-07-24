import { AcitveCourses, Assignments, Courses, Forums, Meetings, Quizzes, StudentsAttedances, StudentsCompletion } from "./courses"
import { check } from "meteor/check";


Meteor.methods({
    async 'myActiveCourses.getAll'() {
        const thisUser = await Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, 'No Access')
        }

        return AcitveCourses.find().fetch()
    },
    async 'myActiveCourses.getById'(id){
        check(id, String);
        const thisUser = await Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, 'No Access')
        }
        const objectId = new Meteor.Collection.ObjectID(id)
        let data = AcitveCourses.findOne({_id : objectId})

        const meetings = Meetings.find({acId : id}).fetch();

        //get course
        const idCourse = new Meteor.Collection.ObjectID(data.courseId)
        const course= Courses.findOne({_id : idCourse})

        data.meetings = meetings
        data.course = course

        //get assignment and quis from meetings
        for (let index = 0; index < meetings.length; index++) {
            const element = meetings[index];
            const idMeeting = element._id.toHexString()
            console.log(idMeeting);
            const dataAssignments = await Assignments.find({meetingId: idMeeting}).fetch();
            element.assignments = dataAssignments;
            const dataQuizzes = await Quizzes.find({meetingId: idMeeting}).fetch()
            element.quizzes = dataQuizzes;
            const dataForums = await Forums.find({meetingId: idMeeting}).fetch()
            element.forums = dataForums;
            const dataAttendance = await StudentsAttedances.findOne({meetingId: idMeeting}, {
                projection: {
                    meetingId: 1,
                    timestamp: 1,
                    status: 1,
                    meetingName: 1
                }
            })
            if(dataAttendance) element.attendance = dataAttendance
            const dataCompletion = await StudentsCompletion.find({meetingId: idMeeting}, {
                projection: {
                    meetingId: 1,
                    acId: 1,
                    materialName: 1,
                    assignmentId: 1,
                    quizId: 1,
                    createdAt: 1
                }
            }).fetch()
            element.isFinished = dataCompletion
        }
        return data;
    },
    /* meetins course */
    async 'myActiveCourses.addMeeting'(cpId, name, date){
        check(cpId, String);

        const thisUser = Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, 'No Access')
        }

        const objectId = new Meteor.Collection.ObjectID(cpId)
        let data = AcitveCourses.findOne({_id : objectId})

        const tempData = {
            name : name,
            date : date,
            isActive :true,
            outlets : thisUser.outlets,
            acId : data._id.toHexString(),
            acName : data.name,
            courseName : data.cpName,
            courseId : data.courseId,
            createdAt : new Date(),
            createdBy : thisUser._id
        }

        return Meetings.insert(tempData)
    },
    async 'meeting.getById'(meetingId){
        check(meetingId, String);

        const thisUser = Meteor.users.findOne({_id : this.userId})

        if(!thisUser){
            throw new Meteor.Error(404, 'No Access')
        }
        const objectId = new Meteor.Collection.ObjectID(meetingId)
        return Meetings.findOne({_id : objectId})
    }
})