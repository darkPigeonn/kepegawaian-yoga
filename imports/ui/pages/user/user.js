import "./user.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from "papaparse";
import { object, result, template } from "underscore";
import { HTTP } from "meteor/http";
import { startSelect2 } from "../../../startup/client";

Template.listUser.onCreated(function () {
  const self = this;
  self.dataListUser = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  self.dataListUserSuperAdmin = new ReactiveVar();

  Meteor.call("users.getAll", function (error, result) {
    if (result) {
      self.dataListUser.set(result);
    } else {
      console.log(error);
    }
  });

  Meteor.call("users.getAllSuperAdmin", function (error, result) {
    if (result) {
      self.dataListUserSuperAdmin.set(result);
    } else {
      console.log(error);
    }
  });
  isLoading(false);
});

Template.listUser.helpers({
  dataListUser() {
    return Template.instance().dataListUser.get();
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  dataListUserSuperAdmin() {
    return Template.instance().dataListUserSuperAdmin.get();
  },
});

Template.listUser.events({
  "click #btn_delete"(e, t) {
    e.preventDefault();

    const id = e.target.getAttribute("data-id");
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete pegawai ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("user.remove", id, function (error, result) {
          if (result) {
            // alert("Delete Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Delete berhasil",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Gagal",
              text: "Delete gagal",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            console.log(error);
          }
        });
      }
    });

    // console.log(id);
  },
});

Template.createUser.onCreated(function () {
  const self = this;
  self.partnerLogin = new ReactiveVar();
  self.schools = new ReactiveVar();
  self.units = new ReactiveVar();

  const userId = Meteor.userId();
  if (userId) {
    Meteor.call("users.getDataLogin", userId, function (error, result) {
      if (result) {
        self.partnerLogin.set(result.partners[0]);
      } else {
        console.log(error);
      }
    });
  }

  Meteor.call("schools.getAllForm", function (error, result) {
    if (error) {
      console.log(error);
    } else {
      self.schools.set(result);
    }
  });
  Meteor.call("getList-perwakilan", function (error, result) {
    if (error) {
      console.log(error);
    } else {
      self.units.set(result);
    }
  });
});

Template.createUser.onRendered(function () {
  setTimeout(() => {
    startSelect2();
  }, 500);
});

Template.createUser.helpers({
  partnerLogin() {
    return Template.instance().partnerLogin.get();
  },
  schools() {
    return Template.instance().schools.get();
  },
  units() {
    return Template.instance().units.get();
  },
});

Template.createUser.events({
  "click #btn_save_user"(e, t) {
    const username = $("#input_username").val();
    const password = $("#input_password").val();
    const role = $("#input_roles").val();
    const fullname = $("#input_fullname").val();
    const school = $("#input_school").val();
    const unit = $("#input_unit").val();

    const dataSend = {
      username,
      password,
      fullname,
      role,
      school,
      unitId: unit,
    };

    Meteor.call("users.createAppMeteor", dataSend, function (error, result) {
      if (result) {
        if (result.error == 403) {
          return Swal.fire({
            title: "Gagal",
            text: "Data gagal dimasukkan, username sudah ada",
            showConfirmButton: true,
            allowOutsideClick: true,
          }).then((result) => {
            if (result.isConfirmed) {
              location.reload();
            }
          });
        }
        // alert("Sukses");
        Swal.fire({
          title: "Berhasil",
          text: "Data berhasil dimasukkan",
          showConfirmButton: true,
          allowOutsideClick: true,
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload();
          }
        });
        // location.reload();
      } else {
        Swal.fire({
          title: "Gagal",
          text: "Data gagal dimasukkan, cek kembali data yang dimasukkan",
          showConfirmButton: true,
          allowOutsideClick: true,
        });
        // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
        console.log(error);
      }
    });
  },
});

Template.createAdmin.events({
  "click #btn_save_admin"(e, t) {
    const username = $("#input_username").val();
    const password = $("#input_password").val();
    const partners = $("#input_partners").val();
    const fullname = $("#input_fullname").val();

    const dataSend = {
      username,
      password,
      fullname,
      partners,
    };

    Meteor.call(
      "users.createAppMeteorSuperAdmin",
      dataSend,
      function (error, result) {
        if (result) {
          // alert("Sukses");
          Swal.fire({
            title: "Berhasil",
            text: "Data berhasil dimasukkan",
            showConfirmButton: true,
            allowOutsideClick: true,
          }).then((result) => {
            if (result.isConfirmed) {
              location.reload();
            }
          });
          // location.reload();
        } else {
          Swal.fire({
            title: "Gagal",
            text: "Data gagal dimasukkan, cek kembali data yang dimasukkan",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
          // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
          console.log(error);
        }
      }
    );
  },
});

Template.editUser.onCreated(function () {
  const self = this;
  self.dataListUser = new ReactiveVar();
  const id = FlowRouter.getParam("_id");
  Meteor.call("users.getById", id, function (error, result) {
    if (result) {
      console.log(result);
      self.dataListUser.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.editUser.helpers({
  dataListUser() {
    return Template.instance().dataListUser.get();
  },
});

Template.editUser.events({
  "click #btn_edit_user"(e, t) {
    const id = FlowRouter.getParam("_id");
    const username = $("#input_username").val();
    const fullname = $("#input_fullname").val();
    // const roles = $("#input_roles").val();
    const dataSave = {
      username,
      fullname,
      roles: "adminPpdbSchool",
    };
    Swal.fire({
      title: "Konfirmasi Edit User",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("users.edit", id, dataSave, function (error, result) {
          if (result) {
            console.log(result);
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil diganti",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          } else {
            console.log(error);
          }
        });
      }
    });
  },
});

Template.changePassUser.onCreated(function () {
  const self = this;
  self.dataListUser = new ReactiveVar();
  const id = FlowRouter.getParam("_id");
  Meteor.call("users.getById", id, function (error, result) {
    if (result) {
      console.log(result);
      self.dataListUser.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.changePassUser.events({
  "click #btn_edit_user_password"(e, t) {
    const id = FlowRouter.getParam("_id");
    const password = $("#input_password").val();
    Swal.fire({
      title: "Konfirmasi Edit Password User",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "users.editPassword",
          id,
          password,
          function (error, result) {
            console.log(result, error);
            if (result) {
              console.log(result);
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil diganti",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                }
              });
            } else {
              console.log(error);
            }
          }
        );
      }
    });
  },
});

Template.createEmployeeAdmin.onCreated(function () {
  const self = this;
  self.dataListUser = new ReactiveVar();
  self.filteredDataListUser = new ReactiveVar();
  self.filtered = new ReactiveVar(0);
  Meteor.call("users.getDataNotEmployee", function (error, result) {
    console.log(result);
    if (result) {
      self.dataListUser.set(result);
      self.filteredDataListUser.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.createEmployeeAdmin.helpers({
  dataListUser() {
    return Template.instance().dataListUser.get();
  },
  filteredDataListUser() {
    return Template.instance().filteredDataListUser.get();
  },
  filtered() {
    return Template.instance().filtered.get();
  },
});

Template.createEmployeeAdmin.events({
  "input .filter"(e, t) {
    e.preventDefault();
    const type = $("#input_type").val();
    const data = $("#input_data").val();
    const dataUser = t.filteredDataListUser.get();
    let filteredUsers;
    console.log(data.length);
    if (data.length >= 3) {
      console.log(type);
      if (type == "outlets") {
        for (let index = 0; index < dataUser.length; index++) {
          const element = dataUser[index];
          if (element.outlets[0] == undefined || element.outlets.length == 0) {
            dataUser.splice(index, 1);
          }
        }
        filteredUsers = dataUser.filter((user) => {
          console.log(user.outlets[0]);
          const filter = user.outlets[0]
            .toLowerCase()
            .includes(data.toLowerCase());
          return filter;
        });
      } else if (type == "fullname") {
        filteredUsers = dataUser.filter((user) => {
          return user.fullname.toLowerCase().includes(data.toLowerCase());
        });
      } else if (type == "email") {
        filteredUsers = dataUser.filter((user) => {
          return user.email.toLowerCase().includes(data.toLowerCase());
        });
      }
      t.filtered.set(1);
      t.filteredDataListUser.set(filteredUsers);
    } else {
      t.filtered.set(0);
    }
  },
  "change .filter"(e, t) {
    e.preventDefault();
    const type = $("#input_type").val();
    const data = $("#input_data").val();
    const dataUser = t.filteredDataListUser.get();
    let filteredUsers;
    if (data.length >= 3) {
      if (type == "outlets") {
        for (let index = 0; index < dataUser.length; index++) {
          const element = dataUser[index];
          if (element.outlets[0] == undefined || element.outlets.length == 0) {
            dataUser.splice(index, 1);
          }
        }
        filteredUsers = dataUser.filter((user) => {
          return user.outlets[0].toLowerCase().includes(data.toLowerCase());
        });
      } else if (type == "fullname") {
        filteredUsers = dataUser.filter((user) => {
          return user.fullname.toLowerCase().includes(data.toLowerCase());
        });
      } else if (type == "email") {
        filteredUsers = dataUser.filter((user) => {
          return user.email.toLowerCase().includes(data.toLowerCase());
        });
      }
      t.filtered.set(1);
      t.filteredDataListUser.set(filteredUsers);
    } else {
      t.filtered.set(0);
    }
  },
  "click #btnClearFilter"(e, t) {
    t.filteredDataListUser.set(t.dataListUser.get());
    $("#input_data").val("");
  },
  "click #btnCreateEmployee"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda yakin ingin menambahkan data pegawai ini?",
      showCancelButton: true,
      confirmButtonText: "Buat",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const id = e.target.getAttribute("data-id");
        console.log(id);
        Meteor.call("users.createDataEmployee", id, function (error, result) {
          console.log(result);
          if (result) {
            Swal.fire({
              title: "Berhasil",
              text: "Berhasil Menambahkan Pegawai",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if (result.isConfirmed) {
                history.back();
                location.reload();
              }
            });
          } else {
            console.log(error);
            Swal.fire({
              title: "Gagal",
              text: "Buat Pegawai gagal",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
          }
        });
      }
    });
  },
});

Template.connectEmployeeAppUser.onCreated(function () {
  const self = this;
  startSelect2();
  self.dataEmployee = new ReactiveVar([]);
  self.dataAppUser = new ReactiveVar([]);
  self.dataConnect = new ReactiveVar([]);

  Meteor.call("employee.getAll", function (error, result) {
    if (result) {
      self.dataEmployee.set(result);
    } else {
      console.log(error);
    }
  });

  Meteor.call("users.getAppUsers", function (error, result) {
    if (result) {
      self.dataAppUser.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.connectEmployeeAppUser.helpers({
  dataEmployee() {
    return Template.instance().dataEmployee.get();
  },
  dataAppUser() {
    return Template.instance().dataAppUser.get();
  },
  dataConnect() {
    return Template.instance().dataConnect.get();
  },
});

Template.connectEmployeeAppUser.events({
  "click #tambah"(e, t) {
    const data = t.dataConnect.get();
    const dataPegawai = $("#input_pegawai").val();
    const selectedOptions = $("#input_pegawai option:selected");
    const selectedEmails = selectedOptions
      .map(function () {
        return $(this).text().split("/")[0].trim(); // Mendapatkan email_address
      })
      .get();
    const dataAppUser = $("#input_appUser").val();
    const selectedOptions2 = $("#input_appUser option:selected");
    const selectedEmails2 = selectedOptions2
      .map(function () {
        return $(this).text().split("/")[0].trim(); // Mendapatkan email_address
      })
      .get();
    let dataConnectArr = [];
    for (let index = 0; index < dataPegawai.length; index++) {
      const element = dataPegawai[index];
      const objek = {
        idEmployee: element,
        emailEmployee: selectedEmails[index],
        idAppUser: dataAppUser[index],
        emailAppUser: selectedEmails2[index],
      };
      dataConnectArr.push(objek);
    }
    t.dataConnect.set(dataConnectArr);
    // console.log(dataPegawai, dataAppUser);
  },
  "click .btn-remove"(e, t) {
    e.preventDefault();
    const index = $(e.target).attr("posisi");
    let daftarConnect = t.dataConnect.get();
    if (index != undefined) {
      daftarConnect.splice(index, 1);
    }
    t.dataConnect.set(daftarConnect);
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
    const getData = t.dataConnect.get();
    Meteor.call(
      "users.updateProfileIdAppUser",
      getData,
      function (error, result) {
        console.log(result, error);
        if (result) {
          successAlert();
          location.reload();
        } else {
          console.log(error);
          alert(error);
        }
      }
    );
  },
});
