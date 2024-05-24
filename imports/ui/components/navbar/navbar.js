import "./navbar.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.navbar.onCreated(function () {  
    const self = this;
    self.jabatanLogin = new ReactiveVar();
    const userId = Meteor.userId();

    Meteor.call("employee.getDataLogin", userId, function (error, result) {  
        if (result) {
          const dataRole = result[0];
          self.jabatanLogin.set(dataRole);
        }
        else{
          console.log(error);
        }
    })
})

Template.navbar.helpers({
    jabatanLogin() {
        return Template.instance().jabatanLogin.get();
    },
})

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