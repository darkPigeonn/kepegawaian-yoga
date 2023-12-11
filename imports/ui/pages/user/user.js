import "./user.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { result, template } from "underscore";
import { HTTP } from 'meteor/http';

Template.listUser.onCreated(function () { 
    const self = this;
    self.dataListUser = new ReactiveVar();
    self.jabatanLogin = new ReactiveVar();
    self.dataListUserSuperAdmin = new ReactiveVar();

    const userId = Meteor.userId();
    // console.log(userId);
    if(userId){
      Meteor.call("employee.getDataLogin", userId, function (error, result) { 
        if(result){
          const dataRole = result[0];
          self.jabatanLogin.set(dataRole);
          console.log(dataRole);
        }
      })
    }

    Meteor.call("users.getAll", function (error, result) {
        if (result) {
          console.log(result);
          self.dataListUser.set(result);
        } else {
          console.log(error);
        }
    });

    Meteor.call("users.getAllSuperAdmin", function (error, result) {
      if (result) {
        console.log(result);
        self.dataListUserSuperAdmin.set(result);
      } else {
        console.log(error);
      }
  });
});

Template.listUser.helpers({
    dataListUser(){
      return Template.instance().dataListUser.get();
    },
    jabatanLogin(){
      return Template.instance().jabatanLogin.get();
    },
    dataListUserSuperAdmin(){
      return Template.instance().dataListUserSuperAdmin.get();
    }
});

Template.listUser.events({
  "click #btn_delete"(e, t){
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete pegawai ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed) {
        Meteor.call('user.remove', id, function (error, result) {
          if(result){
            // alert("Delete Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Delete berhasil",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if(result.isConfirmed){
                location.reload();
              }
            });
          }else{
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
    })
    
    // console.log(id);
  }
})

Template.createUser.events({
  "click #btn_save_user"(e, t){
    console.log("masuk");
    const username = $("#input_username").val();
    const password = $("#input_password").val();
    const role = $("#input_roles").val();
    const fullname = $("#input_fullname").val();

    const dataSend = {
        username,
        password,
        fullname,
        role
    };

    Meteor.call("users.createAppMeteor", dataSend, function (error ,result) { 
        if (result) {
            // alert("Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil dimasukkan",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if(result.isConfirmed) {
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
    })
  },
})

Template.createAdmin.events({
  "click #btn_save_admin"(e, t){
    console.log("masuk");
    const username = $("#input_username").val();
    const password = $("#input_password").val();
    const partners = $("#input_partners").val();
    const fullname = $("#input_fullname").val();

    const dataSend = {
        username,
        password,
        fullname,
        partners
    };

    Meteor.call("users.createAppMeteorSuperAdmin", dataSend, function (error ,result) { 
        if (result) {
            // alert("Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil dimasukkan",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if(result.isConfirmed) {
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
    })
  },
})