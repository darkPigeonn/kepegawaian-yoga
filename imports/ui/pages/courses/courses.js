import './courses.html';
import "../../components/form/form.js"
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { Template } from 'meteor/templating';
Template.detailCourses.onCreated(function(){
    const self = this;

    self.detailCourses = new ReactiveVar();
    const thisId = FlowRouter.current().params._id;

    Meteor.call("myActiveCourses.getById", thisId, function(error, result){
        if(result){
            console.log(result);
            self.detailCourses.set(result)
        }else{
            console.log(error);
        }
    })

});

Template.detailCourses.helpers({
    detailCourses(){
        return Template.instance().detailCourses.get()
    }
})

Template.addMeeting.onCreated(function(){
    const self = this;

    self.detailCourses = new ReactiveVar();
    const thisId = FlowRouter.current().params.cpId;

    Meteor.call("myActiveCourses.getById", thisId, function(error, result){
        if(result){
            console.log(result);
            self.detailCourses.set(result)
        }else{
            console.log(error);
        }
    })

});
Template.addMeeting.helpers({
    detailCourses(){
        return Template.instance().detailCourses.get()
    }
})
Template.addMeeting.events({
    'submit #form-add-meeting'(e, t){
        e.preventDefault();
        const thisId = FlowRouter.current().params.cpId;
        const thisName = $('#input-name').val();
        const thisDate = new Date($('#input-date').val());
        alert(thisName)

        Meteor.call("myActiveCourses.addMeeting", thisId, thisName, thisDate, function(error, result){
            if(result){
                FlowRouter.go("/courses/" + thisId);
            }else{
                console.log(error);
            }
        })
    }
});


/* aktivity meeting */
Template.addActivity.onCreated(function(){
    const self = this;
    const thisId = FlowRouter.current().params.meetingId;

    self.detailMeeting = new ReactiveVar();
    self.viewMode = new ReactiveVar('99')

    Meteor.call("meeting.getById", thisId, function(error, result){
        if(result){
            console.log(result);
            self.detailMeeting.set(result)
        }else{
            console.log(error);
        }
    })
})
Template.addActivity.helpers({
    viewMode(){
        return Template.instance().viewMode.get()
    }
})
Template.addActivity.events({
    'click .btn-view-mode'(e, t){
        const milik = $(e.target).attr("milik");
        e.preventDefault();
        t.viewMode.set(milik);
    }
})

Template.addQuiz.events({
    'submit #form-add-quiz'(e,t){
        e.preventDefault()

        const name = $("#inputName").val()
        const description = $("#inputDeskripsi").val()
        const startDate = new Date($("#input-start-date").val())
        const dueDate = new Date($("#input-end-date").val())
        const optionDueDate = $('#optionsDueDate').val()
        const optionQuiz = $("#optionsDueDate2").val()
        const duration = $("#input-duration").val()

        const acId = FlowRouter.current().params.cpId
        const meetingId = FlowRouter.current().params.meetingId
        Meteor.call("myActiveCourses.addQuiz",acId, meetingId, name, description, startDate, dueDate, optionDueDate, optionQuiz,duration, function(error, result){
            if(result){
                FlowRouter.go("/courses/" + FlowRouter.current().params.cpId);
            }else{
                console.log(error);
            }
        })
    }
})