import "./tickets.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { filter, functions, result, template } from "underscore";
import { HTTP } from 'meteor/http';

Template.listTicket.onCreated(function (){
    const self = this;
    self.dataTicket = new ReactiveVar();
    Meteor.call("tickets.getAll", function (error, result) {
      if (result) {
        console.log(result);
        self.dataTicket.set(result);
      } else {
        console.log(error);
      }
    });
})

Template.listTicket.helpers({
  dataTicket(){
    return Template.instance().dataTicket.get();
  },
})

Template.listTicket.events({
  "click #btn_delete"(e, t){
    const idTicket = $(e.target).attr("milik");
    console.log(idTicket);
    Swal.fire({
      title: "Konfirmasi Hapus Tiket",
      text: "Apakah anda yakin menghapus tiket ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if(result.isConfirmed){
        Meteor.call("tickets.delete", idTicket, function (error, result) {
          console.log(error, result);
          if (result) {
            Swal.fire({
              title: "Sukses",
              text: "Data berhasil di hapus",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            location.reload();
          } else {
            console.log(error);
          }
        });
      }
    })
  }
})

Template.createTicket.onCreated(function (){
  const self = this;
  self.workers = new ReactiveVar();
  self.daftarWorker = new ReactiveVar([]);
  self.allFileNames = new ReactiveVar([]);
  self.buktiTiket = new ReactiveVar([]);
  Meteor.call("tickets.getPekerja", function (error, result) {
    if (result) {
      console.log(result);
      self.workers.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call('fileName.getAll', function(error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(result)
      self.allFileNames.set(result)
    }
  })
  startSelect2();
})

Template.createTicket.helpers({
  workers(){
    return Template.instance().workers.get();
  },
  daftarWorker() {
    return Template.instance().daftarWorker.get();
  },
  allFileNames(){
    return Template.instance().allFileNames.get();
  },
  buktiTiket(){
    return Template.instance().buktiTiket.get();
  },
})


Template.createTicket.events({
  "click #btn-add-workers"(e, t) {
    e.preventDefault();
    const dataRow = t.daftarWorker.get();
    const selectedData = Array.from(document.querySelectorAll('#input_workers option:checked')).map(option => ({
        _id: option.value,
        workerName: option.textContent
    }));
    Swal.fire({
      title: "Konfirmasi Tambah Pekerja",
      text: "Apakah anda yakin menambah pekerja kedalam daftar pekerja untuk tiket ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectedData.length > 0) {
          for (let index = 0; index < selectedData.length; index++) {
            const element = selectedData[index];
            dataRow.push(element);
          }
        }
        t.daftarWorker.set(dataRow);
      }
    });
  },
  "click .btn-remove"(e, t) {
      e.preventDefault()
      const index = $(e.target).attr("posisi");
      let daftarWorker = t.daftarWorker.get();
      if(index != undefined) {
          daftarWorker.splice(index, 1);
      }
      t.daftarWorker.set(daftarWorker);
  },
  "change #buktiTiket": function (e, t) {
  const buktiTiket = t.buktiTiket.get();
  const files = $("#buktiTiket").prop("files");
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file) {
    const reader = new FileReader();
    const body = {
      file: file,
    };
    reader.addEventListener("load", function () {
      body.src = this.result;
      if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc" || 
              file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
      $(`#buktiTiket-${buktiTiket.length - 1}`).attr(
        "href",
        this.result
      );
      }
    });
    reader.readAsDataURL(file);
    buktiTiket.push(body);
    t.buktiTiket.set(buktiTiket);
    }
  }
  },
  "click .remove-buktiTiket": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiTiket = t.buktiTiket.get();
    buktiTiket.splice(parseInt(index), 1);
    t.buktiTiket.set(buktiTiket);
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
    const judul = $("#title").val();
    const deskripsi = $("#description").val();
    const priority = $('input[name=select-priority]:checked').val();
    const daftarWorker = t.daftarWorker.get();
    const files = t.buktiTiket.get();
    const thisForm = {};
    thisForm[files] = [];
    const allFileNames = t.allFileNames.get();
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda ingin menyimpan data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if(result.isConfirmed){
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        const dataForm = $(".form-control")
        let cek = false;
        for (let index = 0; index < dataForm.length; index++) {
          console.log(dataForm[index].id);
          if(dataForm[index].value == ""){
            cek = true;
          }
        }

        if(cek == true){
          Swal.close();
          Swal.fire({
            title: "Gagal",
            text: "Data harus diisi semua",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
        }
        else{
          for (let index = 0; index < files.length; index++) {
            const fileName = files[index].file.name;
            const sendFileName = checkDuplicateFileName(fileName, allFileNames);
            const uploadData = {
              fileName: "kepegawaian/"+sendFileName,
              type: "image/png",
              Body: files[index].file
            }
            const linkUpload = await uploadFiles(uploadData);
            thisForm[files].push(
            {
              name: files[index].file.name,
              link: linkUpload
            });
          }
          const linksBukti = thisForm[files];
          const data = {
              title: judul,
              description: deskripsi,
              priority,
              workers: daftarWorker,
              images: linksBukti
          }
          Meteor.call(
            "tickets.createTicket",
            data,
            function (error, result) {
              if (result) {
                Swal.close();
                Swal.fire({
                  title: "Berhasil",
                  text: "Data berhasil dibuat",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
                location.reload();
                history.back();
              } else {
                console.log(error);
                Swal.close();
                Swal.fire({
                  title: "Gagal",
                  text: error.reason,
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
            }
          );
        }
      }
    })
  }
})

Template.editTicket.onCreated(function () {
  const self = this;
  self.dataTicket = new ReactiveVar();
  self.buktiTiket = new ReactiveVar([]);
  self.workers = new ReactiveVar();
  self.daftarWorker = new ReactiveVar([]);
  self.allFileNames = new ReactiveVar([]);
  const id = FlowRouter.getParam("_id");
  Meteor.call("tickets.getById", id, function (error, result) {
    if (result) {
      self.dataTicket.set(result);
      self.buktiTiket.set(result.images);
      let fileArray = [];
      if(result.images.length != 0){
        for (const data of result.images) {
          const file = {
            file:{
                name: data.name
            },
            src: data.link,
            onInsert: true
          }
          fileArray.push(file)
        }
      }
      self.buktiTiket.set(fileArray);
      let dataWorkers = [];
      for (const iterator of result.workers) {
        dataWorkers.push(iterator);
      }
      self.daftarWorker.set(dataWorkers)
    } else {
      console.log(error);
    }
  })
  Meteor.call('fileName.getAll', function(error, result) {
    if (error) {
        console.log(error);
    } else {
        self.allFileNames.set(result)
    }
  })
  Meteor.call("tickets.getPekerja", function (error, result) {
    if (result) {
      self.workers.set(result);
    } else {
      console.log(error);
    }
  });
  startSelect2();
})

Template.editTicket.helpers({
  dataTicket() {
    return Template.instance().dataTicket.get();
  },
  allFileNames() {
    return Template.instance().allFileNames.get();
  },
  buktiTiket() {
    return Template.instance().buktiTiket.get();
  },
  workers() {
    return Template.instance().workers.get();
  },
  daftarWorker() {
    return Template.instance().daftarWorker.get();
  }
})

Template.editTicket.events({
  "click #btn-add-workers"(e, t) {
    e.preventDefault();
    const dataRow = t.daftarWorker.get();
    const selectedData = Array.from(document.querySelectorAll('#input_workers option:checked')).map(option => ({
      _id: option.value,
      workerName: option.textContent
    }));
    Swal.fire({
      title: "Konfirmasi Tambah Pekerja",
      text: "Apakah anda yakin menambah pekerja kedalam daftar pekerja untuk tiket ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectedData.length > 0) {
          for (let index = 0; index < selectedData.length; index++) {
            const element = selectedData[index];
            dataRow.push(element);
          }
        }
        t.daftarWorker.set(dataRow);
      }
    });
  },
  "click .btn-remove"(e, t) {
    e.preventDefault()
    const index = $(e.target).attr("posisi");
    let daftarWorker = t.daftarWorker.get();
    if(index != undefined) {
        daftarWorker.splice(index, 1);
    }
    t.daftarWorker.set(daftarWorker);
  },
  "change #buktiTiket": function (e, t) {
  const buktiTiket = t.buktiTiket.get();
  const files = $("#buktiTiket").prop("files");
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file) {
    const reader = new FileReader();
    const body = {
      file: file,
    };
    reader.addEventListener("load", function () {
      body.src = this.result;
      if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc" || 
              file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
      $(`#buktiTiket-${buktiTiket.length - 1}`).attr(
        "href",
        this.result
      );
      }
    });
    reader.readAsDataURL(file);
    buktiTiket.push(body);
    t.buktiTiket.set(buktiTiket);
    }
  }
  },
  "click .remove-buktiTiket": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiTiket = t.buktiTiket.get();
    buktiTiket.splice(parseInt(index), 1);
    t.buktiTiket.set(buktiTiket);
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
    const judul = $("#title").val();
    const deskripsi = $("#description").val();
    const priority = $('input[name=select-priority]:checked').val();
    const status = $('input[name=select-status]:checked').val();
    let pesanTambahan = "";
    console.log(status, t.dataTicket.get());
    if(status != t.dataTicket.get().status) {
      pesanTambahan = `Tiket Diubah, Status Ticket Diubah Menjadi ${status}`
    }
    else{
      pesanTambahan = `Tiket Diubah`
    }
    const timeline = {
      message: pesanTambahan,
      createdAt: new Date()
    }
    const daftarWorker = t.daftarWorker.get();
    const files = t.buktiTiket.get();
    const thisForm = {};
    thisForm[files] = [];
    const allFileNames = t.allFileNames.get();
    const id = FlowRouter.getParam("_id");
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda ingin mengubah data tiket ini? Bila status selesai, maka anda tidak bisa mengubah data tiket ini lagi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if(result.isConfirmed){
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });
        const dataForm = $(".form-control")
        let cek = false;
        for (let index = 0; index < dataForm.length; index++) {
          console.log(dataForm[index].id);
          if(dataForm[index].id == "input_workers"){
            if(dataForm[index].value == ""){
              cek = false;
            }
          }
          else {
            if(dataForm[index].value == ""){
              cek = true;
            }
          }
        }

        if(cek == true){
          Swal.close();
          Swal.fire({
            title: "Gagal",
            text: "Data harus diisi semua",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
        }
        else{
          for (let index = 0; index < files.length; index++) {

            if(files[index].onInsert == true){
              thisForm[files].push(
                {
                  name: files[index].file.name,
                  link: files[index].src
                }
              )
            }
            else{
              const fileName = files[index].file.name;
              const sendFileName = checkDuplicateFileName(fileName,allFileNames);
              const uploadData = {
                fileName: "kepegawaian/"+sendFileName,
                type: "image/png",
                Body: files[index].file
                }
              const linkUpload = await uploadFiles(uploadData);
              thisForm[files].push(
              {
                name: files[index].file.name,
                link: linkUpload
              });
            }
          }
          const linksBukti = thisForm[files];
          const data = {
              title: judul,
              description: deskripsi,
              priority,
              workers: daftarWorker,
              images: linksBukti,
              status
          }
          Meteor.call(
            "tickets.editTicket",
            id,
            data,
            timeline,
            function (error, result) {
              if (result) {
                Swal.close();
                Swal.fire({
                  title: "Berhasil",
                  text: "Data tiket berhasil diubah",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
                location.reload();
                history.back();
              } else {
                // console.log(error);
                Swal.close();
                Swal.fire({
                  title: "Gagal",
                  text: "Data tiket gagal diubah",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
            }
          );
        }
      }
    })
  }
})

Template.detailTicket.onCreated(function () {
  const self = this;
  self.dataTiket = new ReactiveVar();
  self.buktiTiket = new ReactiveVar([]);
  self.workers = new ReactiveVar();
  self.daftarWorker = new ReactiveVar([]);
  const id = FlowRouter.getParam("_id");
  Meteor.call("tickets.getById", id, function (error, result) {
    if (result) {
      self.dataTiket.set(result);
      self.buktiTiket.set(result.images);
      let fileArray = [];
      if(result.images.length != 0){
        for (const data of result.images) {
          const file = {
            file:{
                name: data.name
            },
            src: data.link,
            onInsert: true
          }
          fileArray.push(file)
        }
      }
      self.buktiTiket.set(fileArray);
      let dataWorkers = [];
      for (const iterator of result.workers) {
        dataWorkers.push(iterator);
      }
      self.daftarWorker.set(dataWorkers)
    } else {
      console.log(error);
    }
  })
})

Template.detailTicket.helpers({
  buktiTiket(){
    return Template.instance().buktiTiket.get();
  },
  dataTiket(){
    return Template.instance().dataTiket.get();
  }
})

Template.chatTicket.onCreated(function() {
  const self = this;
  self.daftarChat = new ReactiveVar([]);
  const id = FlowRouter.getParam("_id");
  Meteor.call("tickets.getById", id, function (error, result) {
    if (result) {
      self.daftarChat.set(result.message);
    } else {
      console.log(error);
    }
  })
})

Template.chatTicket.helpers({
  daftarChat() {
    return Template.instance().daftarChat.get();
  }
})

Template.chatTicket.events({
  "click #btn_send"(e,t){
    const pesan = $("#input_message").val();
    const id = FlowRouter.getParam("_id");
    const saveData = {
      message: pesan,
      createdAt: new Date()
    }
    Meteor.call("tickets.sendMessage", id, saveData, function (error, result) {
      if (result) {
        location.reload()
      } else {
        console.log(error);
        alert(error)
      }
    })
  }
})

function checkDuplicateFileName(fileName, allFileNames) {
	const result = allFileNames;
	if(result.length == 0 || result == undefined){
		return fileName;
	}
	for (let i = 0; i < result.length; i++) {
		const element = result[i];
		const randomString = generateRandomString(5)
		if(fileName == element){
			const finalName = addRandomString(fileName, randomString)
			console.log(finalName);
			return finalName;
		}
		else{
			return fileName;
		}
	}
}

function generateRandomString(length) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let randomString = "";
  
	for (let i = 0; i < length; i++) {
	  const randomIndex = Math.floor(Math.random() * charset.length);
	  randomString += charset.charAt(randomIndex);
	}
	return randomString;
}

function addRandomString(inputString, appendString){
	const lastDotIndex = inputString.lastIndexOf('.');

  if (lastDotIndex !== -1) {
    // If a dot is found, insert the appendString before the last dot
    const modifiedString = inputString.substring(0, lastDotIndex) + '-' + appendString + inputString.substring(lastDotIndex);
    return modifiedString;
  } else {
    // If no dot is found, simply concatenate the appendString to the original string
    return inputString + '|' + appendString;
  }
}