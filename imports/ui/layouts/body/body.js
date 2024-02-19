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
          FlowRouter.go("/");
        }
      });
    } else {
      alert("silahkan isi form dengan lengkap");
    }
  },
});

Template.forgotPassword.events({
  "click .submit"(e, t) {
    e.preventDefault();
    const email = $("#email").val();
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    if (emailRegex.test(email)){
      Meteor.call("employee.sendResetPassword", email, function (error, result) { 
        if(error){
          failAlert(error);
          console.log(error);
        } else {
          successAlert("Mohon periksa email Anda! link Reset password akan dikirim jika email yang anda masukkan terdaftar!")
        }
      })
    } else {
      failAlert("Pastikan format email yang dimasukkan benar!")
    }
    console.log(email)
  }
});

Template.resetPassword.onCreated(function () {
  const self = this;
  self.userId = new ReactiveVar("")
});

Template.resetPassword.onRendered(function () {
  const self = this;
  const token = FlowRouter.getQueryParam('code')
  if (!token){
    FlowRouter.go("/")
  } else {
    Meteor.call("employee.checkToken", token, function (error, result) { 
      if(result === false){
        failAlert("Token sudah expired silahkan buat ulang")
        FlowRouter.go("/")
      } else {
        self.userId.set(result)
      }
    })
  }
});

Template.resetPassword.events({
  "click .submit"(e, t) {
    e.preventDefault();
    const password = $("#password").val();
    const confirmation = $("#confirmation").val()
    if (password !== "" && confirmation !== "" ){
      if (password !== confirmation){
        failAlert("Password dan konfirmasi password tidak sama!")
      } else {
        const userId = t.userId.get()
        Meteor.call("users.editPassword", userId, password, function (error, result) { 
          if(error){
            failAlert(error)
          } else {
            successAlert("Berhasil mengubah password! ")
            FlowRouter.go("/")
          }
        })
      }
    }
  }
});


