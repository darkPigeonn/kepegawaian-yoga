import "./configuration.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import Swal from "sweetalert2";

Template.listKategoriSurat.onCreated(function () {
    const self = this;
    self.kategoriSurat = new ReactiveVar();
    self.jenisKonfig = new ReactiveVar("kategori-surat");

    console.log(self.jenisKonfig.get());
    Meteor.call(
        "config.getConfig",
        self.jenisKonfig.get(),
        function (error, result) {
          if (result) {
            self.kategoriSurat.set(result)
          } else {
            console.log(error);
          }
        }
      );
})

Template.listKategoriSurat.helpers({
    kategoriSurat() {
        return Template.instance().kategoriSurat.get();
    },
    jenisKonfig() {
        return Template.instance().jenisKonfig.get();
    }
});

Template.listKategoriSurat.events({
    "click #btn_delete"(e, t){
        e.preventDefault();

        const id = e.target.getAttribute('data-id');
        Swal.fire({
            title: "Konfirmasi Delete",
            text: "Apakah anda yakin melakukan delete kategori surat ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal"
        }).then((result) => {
            if(result.isConfirmed) {
            Meteor.call('config.delete', id, function (error, result) {
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
        
    },
})

Template.createKategoriSurat.events({
    "click #btn_save_categoryLetter"(e, t) {
      e.preventDefault();
  
      const name = $("#input_categoryName").val();
      const formatNomorSurat = $("#input_letterNumbering").val();
      const penerima = $("#input_receiver").val();

      const data = {
        name,
        formatNomorSurat,
        penerima
      }
      
      Meteor.call(
        "config.createLetterCategory",
        data,
        function (error, result) {
          if (result) {
            alert("Penyimpanan Data Berhasil");
            location.reload();
            history.back();
          } else {
            alert("Penyimpanan Data Gagal");
            console.log(error);
          }
        }
      );
    },
});

Template.editKategoriSurat.onCreated(function () {
    const self = this;
    self.dataConfig = new ReactiveVar();
    const id = FlowRouter.getParam("_id");
    Meteor.call(
        "config.getByID",
        id,
        function (error, result) {
          if (result) {
            self.dataConfig.set(result)
          } else {
            console.log(error);
          }
        }
      );
})

Template.editKategoriSurat.helpers({
    dataConfig(){
        return Template.instance().dataConfig.get();
    }
});

Template.editKategoriSurat.events({
    "click #btn_save_editCategoryLetter"(e, t) {
      e.preventDefault();
  
      const name = $("#input_categoryName").val();
      const formatNomorSurat = $("#input_letterNumbering").val();
      const penerima = $("#input_receiver").val();
      const id = FlowRouter.getParam("_id");

      const data = {
        name,
        formatNomorSurat,
        penerima
      }
      
      Meteor.call(
        "config.editLetterCategory",
        data,
        id,
        function (error, result) {
          if (result) {
            alert("Penyimpanan Data Berhasil");
            location.reload();
            history.back();
          } else {
            alert("Penyimpanan Data Gagal");
            console.log(error);
          }
        }
      );
    },
});