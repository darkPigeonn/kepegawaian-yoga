import "./body.html";
import "../../components/navbar/navbar.js";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

Template.login_page.events({
  "click .submit"(e, t) {
    e.preventDefault();
    const email = $("#input_username").val();
    const password = $("#input_password").val();
    if (email && password) {
      Meteor.loginWithPassword(email, password, function (error) {
        if (error) {
          alert(error);
        } else {
          FlowRouter.go("home");
        }
      });
    } else {
      alert("silahkan isi form dengan lengkap");
    }
  },
});
