import './courses.html';
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