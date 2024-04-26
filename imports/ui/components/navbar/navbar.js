import "./navbar.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2";
Template.navbar.onCreated(function () {
  const self = this;
  self.jabatanLogin = new ReactiveVar();
  self.partnerCode = new ReactiveVar();
  const userId = Meteor.userId();

  Meteor.call("employee.getDataLogin", userId, function (error, result) {
    if (result) {
      const dataRole = result[0];
      console.log(dataRole);
      self.jabatanLogin.set(dataRole);
    } else {
      console.log(error);
    }
  });
  Meteor.call("employee.partnerCode", function (error, result) {
    if (result) {
      self.partnerCode.set(result);
    } else {
      alert("Anda belum memiliki partner");
    }
  });
});

Template.navbar.helpers({
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  isYoga() {
    return Template.instance().partnerCode.get() === "yyg";
  },
});

Template.navbar.events({
  "click #btn_logout"(e, t) {
    e.preventDefault();

    Swal.fire({
      title: "Apakah anda yakin?",
      text: "Anda akan diarahkan ke halaman login",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.logout(function (error) {
          if (error) {
            console.log(error.reason);
          } else {
            Swal.fire({
              title: "Berhasil!",
              text: "Anda berhasil keluar.",
              icon: "success",
            });
            FlowRouter.go("App.home");
          }
        });
      }
    });
  },
});
