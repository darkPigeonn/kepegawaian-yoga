import "./document.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { result } from "underscore";
import { HTTP } from 'meteor/http';
import 'meteor/pascoual:pdfjs';

Template.list_document.onCreated(function() {
    const self = this;
    self.dataDocument = new ReactiveVar();
    self.jabatanLogin = new ReactiveVar();
    self.dataDocumentByRole = new ReactiveVar();
    self.dataDocumentHistoryByRole = new ReactiveVar();
    const userId = Meteor.userId();
    // console.log(userId);
    if(userId){
      Meteor.call("employee.getDataLogin", userId, function (error, result) { 
        if(result){
          const dataRole = result[0];
          self.jabatanLogin.set(dataRole);
          console.log(dataRole);
          Meteor.call("document.getDocumentByRoles", dataRole, function (error, result){
            // console.log(roleLogin);
            if(result){
              // console.log(result);
              self.dataDocumentByRole.set(result)
            }
            else{
              console.log(error);
            }
          })
          Meteor.call("document.getHistoryByPengisi", dataRole, function (error, result) {
            console.log(dataRole);
            if(result){
              self.dataDocumentHistoryByRole.set(result)
              console.log(result);
            }
            else{
              console.log(error);
            }
          })
        }
        else{
          console.log(error);
        }
      })
    }
    Meteor.call("document.getAllDocuments", function (error1, result1) {
      if (result1) {
        // console.log(result1);
        self.dataDocument.set(result1);
      } else {
        console.log(error1);
      }
    });

})

Template.list_document.helpers({
    dataDocument() {
      return Template.instance().dataDocument.get();
    },
    jabatanLogin(){
      return Template.instance().jabatanLogin.get();
    },
    dataDocumentByRole(){
      return Template.instance().dataDocumentByRole.get();
    },
    dataDocumentHistoryByRole(){
      return Template.instance().dataDocumentHistoryByRole.get();
    }
})

Template.detailDocument.onCreated(function(){
  // console.log("masuk");
  const self = this;
  self.dataDetailDokumen = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  const id = FlowRouter.getParam("_id");
  // console.log(id);
  const userId = Meteor.userId();
  // console.log(userId);
  if(userId){
    Meteor.call("employee.getDataLogin", userId, function (error, result) { 
      if(result){
        const dataRole = result[0];
        self.jabatanLogin.set(dataRole);
      }
      else{
        console.log(error);
      }
    })
  }
  Meteor.call("document.getDocumentsByID", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.dataDetailDokumen.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.detailDocument.helpers({
  dataDokumen(){
    return Template.instance().dataDetailDokumen.get();
  },
  jabatanLogin(){
    return Template.instance().jabatanLogin.get();
  },
});

// Template.resepsionisDocument.helpers({
//     dataDocument() {
//         return Template.instance().dataDocument.get();
//     },
// })

Template.create_document.onCreated(function() {
    const self = this;
    self.data = new ReactiveVar();
    self.daftarAlur = new ReactiveVar([]);
    startSelect2();
})

Template.create_document.helpers({
    currentUpload() {
        return Template.instance().currentUpload.get();
    },
    daftarAlur(){
        return Template.instance().daftarAlur.get();
    }
});

Template.create_document.events({
    'click #btn-add-alur'(e, t){
      e.preventDefault();
      const dataRow = t.daftarAlur.get();
      const selectedAlur = $("#input_alur").val();
      Swal.fire({
        title: "Konfirmasi Tambah Alur",
        text: "Apakah anda yakin menambah " + selectedAlur + " kedalam alur?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak"
      }).then((result) => {
        if(result.isConfirmed) {
          if(selectedAlur.length > 0){
            for (let index = 0; index < selectedAlur.length; index++) {
              const element = selectedAlur[index];
              dataRow.push(element);
            }
          }
          t.daftarAlur.set(dataRow);
        }
      }) 
    },
    async 'click #btn_save'(e, t){
      e.preventDefault();
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        },
      });
      // console.log("masuk");
      const full_name = $("#input_fullName").val();
      const sumber = $("#input_sumber").val();
      const tanggal = $("#input_tanggal").val();
      const jenisDokumen = $("#input_jenisDokumen").val();
      // console.log(full_name, tanggal, jenisDokumen);
      const file = $(`#filePDF`).prop('files')
      // console.log(file);
      let thisForm = {};
      if(file[0]){
        const uploadData = {
          fileName: file[0].name,
          type: ".pdf",
          Body: file[0]
        }
        thisForm.fileData = await uploadFiles(uploadData)
      }

      const linkFilePDF = thisForm.fileData;
      const dataAlur = t.daftarAlur.get();
      
      // console.log(sumber);
      const dataSave = {
          full_name: full_name,
          sumber: sumber,
          tanggal: tanggal,
          jenis_dokumen: jenisDokumen,
          alur: dataAlur,
          linkPDF: linkFilePDF
      }
      
      setTimeout(()=>{
        Meteor.call("document.tambahDokumen", dataSave, function (error, result) {
          Swal.close();
          if (result) {
              // console.log(result);
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              // console.log(error);
              Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
            }
        })
      }, 4000)
        
    },
    // "click #btn-remove"(e, t) {
    //     e.preventDefault();
    //     // console.log("masuk")
    //     var dataRow = t.daftarAlur.get();
    //     const jabatan = $(e.target).attr("milik");
    //     console.log(jabatan);
    //     const hapus = dataRow.indexOf(jabatan);
    //     if(hapus !== -1) {
    //         dataRow.splice(hapus, 1);
    //     }
    //     t.daftarAlur.set(dataRow);
    //     console.log(t.daftarAlur.get())
    //   },
});

Template.reviewDocument.onCreated(function (){
  const self = this;
  self.dataDetailDokumen = new ReactiveVar();
  const id = FlowRouter.getParam("_id");
  // console.log(id);
  Meteor.call("document.getDocumentsByID", id, function (error, result) {
    if (result) {
      console.log(result);
      self.dataDetailDokumen.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.reviewDocument.helpers({
  dataDocument(){
    return Template.instance().dataDetailDokumen.get();
  }
});

Template.reviewDocument.events({
  'click #btn_setuju'(e, t){
    e.preventDefault();
    // console.log("masuk");
    const id = FlowRouter.getParam("_id");
    const userId = Meteor.userId();
    const dataReview = $("#input_review").val();
    Swal.fire({
      title: "Konfirmasi Review",
      text: "Apakah anda yakin menerima dokumen ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Terima",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed) {
        Meteor.call("document.updateReview", id, userId, dataReview, function (error, result) {
          if (result) {
            // console.log(result);
            Swal.fire({
              title: "Berhasil",
              text: "Anda berhasil melakukan review dokumen ini",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            history.back()
          } else {
            console.log(error);
          }
        });
      }
    })
  },
  'click #btn_tolak'(e, t){
    e.preventDefault();
    // console.log("masuk");
    const id = FlowRouter.getParam("_id");
    const userId = Meteor.userId();
    const dataReview = $("#input_review").val();
    Swal.fire({
      title: "Konfirmasi Tolak",
      text: "Apakah anda yakin melakukan penolakan dokumen ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed) {
        Meteor.call("document.updateReviewTolak", id, userId, dataReview, function (error, result) {
          if (result) {
            // console.log(result);
            Swal.fire({
              title: "Berhasil",
              text: "Anda berhasil melakukan review dokumen ini",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            history.back()
          } else {
            console.log(error);
          }
        });
      }
    })
  }
});



// function previewPDF() {
//     const fileInput = document.getElementById('pdfInput');
//     const pdfPreview = document.getElementById('pdfPreview');
  
//     const file = fileInput.files[0];
//     if (!file) {
//       alert('Pilih file PDF terlebih dahulu.');
//       return;
//     }
  
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       const pdfUrl = e.target.result;
//       displayPDF(pdfUrl);
//     };
//     reader.readAsDataURL(file);
// }

// function displayPDF(pdfUrl) {
//     const container = document.getElementById('pdfPreview');
//     const pdf = new PDFJS.PDFDoc(pdfUrl);
//     pdf.render(container);
// }