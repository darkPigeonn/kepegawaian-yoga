import "./navbar.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.navbar.events({
    "click #btn_logout"(e, t) {
      e.preventDefault();
  
        Meteor.logout(function (error) { 
            if (error) {
                console.log(error.reason);
            }
            else {
                FlowRouter.go('App.home')
            }
        })
    },
});