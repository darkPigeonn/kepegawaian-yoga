import "./body.html";
import "../../components/navbar/navbar.js";
import { Meteor } from "meteor/meteor";
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
          Router.go("home");
        }
      });
    } else {
      alert("silahkan isi form dengan lengkap");
    }
  },
});
