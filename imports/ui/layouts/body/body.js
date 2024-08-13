import { FlowRouter } from "meteor/ostrio:flow-router-extra";

import "./body.html";
import "../../components/navbar/navbar.js";
import { Meteor } from "meteor/meteor";
Template.login_page.onCreated(function () {
  isLoading(false);
});
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


Template.forgotPassword.onCreated(function () {
  const self = this;

  this.isSetPassword = new ReactiveVar(false);
  this.dataUser = new ReactiveVar()
})
Template.forgotPassword.helpers({
  isSetPassword() {
    return Template.instance().isSetPassword.get();
  }
})
Template.forgotPassword.events({
  "submit #form-forgot"(e, t) {
    e.preventDefault();
    const npsn = $("#input-npsn").val();
    const email = $("#input-email").val();
    if (npsn && email) {
      Meteor.call("check.fpNpsn", npsn,email, function (error, result) {
        if (error) {
          alert(error);
        } else {
          t.isSetPassword.set(result);
          t.dataUser.set({
            npsn,
            email
          });
        }
      });
    } else {
      alert("silahkan isi form dengan lengkap");
    }
  },
  "submit #form-password"(e,t){
    e.preventDefault();
    const password = $("#input-password").val();
    const confirmPassword = $("#input-password2").val();

    if(password.length < 6){
      alert("Password harus lebih dari 6 karakter");
      return;
    }

    if(password === confirmPassword){
      Meteor.call("set.password",t.dataUser.get().npsn, t.dataUser.get().email, password, function (error, result) {
        if (error) {
          alert(error);
        } else {
          alert("Password Berhasil");
          t.isSetPassword.set(false);
          FlowRouter.go("/");
        }
      });
    }else{
      alert("Password Tidak Sama");
    }
  }
});