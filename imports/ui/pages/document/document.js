import "./document.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from "papaparse";
import { filter, result, template } from "underscore";
import { HTTP } from "meteor/http";
import "meteor/pascoual:pdfjs";

Template.list_document.onCreated(function () {
  const self = this;
  self.dataDocument = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  self.dataDocumentByRole = new ReactiveVar();
  self.dataDocumentHistoryByRole = new ReactiveVar();
  const userId = Meteor.userId();
  // console.log(userId);
  // if (userId) {
  //   Meteor.call("employee.getDataLogin", userId, function (error, result) {
  //     if (result) {
  //       const dataRole = result[0];
  //       self.jabatanLogin.set(dataRole);
  //       Meteor.call(
  //         "document.getDocumentByRoles",
  //         dataRole,
  //         function (error, result) {
  //           // console.log(roleLogin);
  //           if (result) {
  //             // console.log(result);
  //             self.dataDocumentByRole.set(result);
  //           } else {
  //             console.log(error);
  //           }
  //         }
  //       );
  //       Meteor.call(
  //         "document.getHistoryByPengisi",
  //         dataRole,
  //         function (error, result) {
  //           if (result) {
  //             self.dataDocumentHistoryByRole.set(result);
  //           } else {
  //             console.log(error);
  //           }
  //         }
  //       );
  //     } else {
  //       console.log(error);
  //     }
  //   });
  // }
  Meteor.call("document.getAllDocuments", function (error1, result1) {
    if (result1) {
      // console.log(result1);
      self.dataDocument.set(result1);
    } else {
      console.log(error1);
    }
  });
});

Template.list_document.helpers({
  dataDocument() {
    return Template.instance().dataDocument.get();
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  dataDocumentByRole() {
    return Template.instance().dataDocumentByRole.get();
  },
  dataDocumentHistoryByRole() {
    return Template.instance().dataDocumentHistoryByRole.get();
  },
  listKorespondensiSigner() {
    return Template.instance().listKorespondensi
  }
});

Template.list_document.events({
  "click #btn-search"(e, t) {
    e.preventDefault();
    const name = $("#documentName").val();
    const source = $("#documentSource").val();
    const date = $("#date").val()
    console.log(name, source, date);
    const data = {
      name,
      source,
      date
    }
    Meteor.call("document.search", data, function(error, result) {
      if(result) {
        t.dataDocument.set(result)
      }
      else {
        console.log(error);
        failAlert(error)
      }
    })
  },
  "click #btn-refresh"(e, t) {
    e.preventDefault();
    Meteor.call("document.getAllDocuments", function (error, result) {
      if (result) {
        t.dataDocument.set(result);
      } else {
        console.log(error);
      }
    });
  }
})

Template.detailDocument.onCreated(function () {
  const self = this;
  self.dataDetailDokumen = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  const id = FlowRouter.getParam("_id");
  const userId = Meteor.userId();
  Meteor.call("document.getDocumentsByID", id, function (error, result) {
    if (result) {
      self.dataDetailDokumen.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.detailDocument.helpers({
  dataDokumen() {
    return Template.instance().dataDetailDokumen.get();
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
});

Template.detailDocument.events({
  async "click #submit"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const full_name = $("#input_fullName").val();
    const sumber = $("#input_sumber").val();
    const tanggal = $("#input_tanggal").val();
    const jenisDokumen = $("#input_jenisDokumen").val();
    const file = $(`#filePDF`).prop("files");
    let dataSave = {
      name: full_name,
      source: sumber,
      date: tanggal,
      documentType: jenisDokumen
    };
    let thisForm = {};
    if (file[0]) {
      const uploadData = {
        fileName: "kepegawaian/documents/" + file[0].name,
        type: ".pdf",
        Body: file[0],
      };
      thisForm.fileData = await uploadFiles(uploadData);
      dataSave.link = thisForm.fileData;
    }

    const id = FlowRouter.getParam("_id");
    console.log(id);
    Meteor.call("document.update", dataSave, id, function(error, result) {
      if(result) {
        Swal.close();
        successAlert("Data berhasil diubah");
        location.reload();
      }
      else {
        Swal.close();
        failAlert(error);
        console.log(error);
      }
    })
  }
});

// Template.resepsionisDocument.helpers({
//     dataDocument() {
//         return Template.instance().dataDocument.get();
//     },
// })

Template.create_document.onCreated(function () {
  const self = this;
  self.data = new ReactiveVar();
  self.daftarAlur = new ReactiveVar([]);
  startSelect2();
});

Template.create_document.helpers({
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  daftarAlur() {
    return Template.instance().daftarAlur.get();
  },

});

Template.create_document.events({

  "click #btn-add-alur"(e, t) {
    e.preventDefault();
    const dataRow = t.daftarAlur.get();
    const selectedAlur = $("#input_alur").val();
    Swal.fire({
      title: "Konfirmasi Tambah Alur",
      text: "Apakah anda yakin menambah " + selectedAlur + " kedalam alur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectedAlur.length > 0) {
          for (let index = 0; index < selectedAlur.length; index++) {
            const element = selectedAlur[index];
            dataRow.push(element);
          }
        }
        t.daftarAlur.set(dataRow);
      }
    });
  },
  async "click #btn_save"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
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
    const file = $(`#filePDF`).prop("files");
    let dataSave = {
      name: full_name,
      source: sumber,
      date: tanggal,
      documentType: jenisDokumen
    };
    let thisForm = {};
    if (file[0]) {
      const uploadData = {
        fileName: "kepegawaian/documents/" + file[0].name,
        type: ".pdf",
        Body: file[0],
      };
      thisForm.fileData = await uploadFiles(uploadData);
      dataSave.link = thisForm.fileData;
    }

    Meteor.call("document.tambahDokumen", dataSave, function(error, result) {
      if(result) {
        Swal.close();
        successAlert("Data berhasil disimpan");
        location.reload();
        history.back();
      }
      else {
        console.log(error);
        failAlert(error);
      }
    })

  }
});

Template.reviewDocument.onCreated(function () {
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
  dataDocument() {
    return Template.instance().dataDetailDokumen.get();
  },
});

Template.reviewDocument.events({
  "click #btn_setuju"(e, t) {
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
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "document.updateReview",
          id,
          userId,
          dataReview,
          function (error, result) {
            if (result) {
              // console.log(result);
              Swal.fire({
                title: "Berhasil",
                text: "Anda berhasil melakukan review dokumen ini",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              console.log(error);
            }
          }
        );
      }
    });
  },
  "click #btn_tolak"(e, t) {
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
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "document.updateReviewTolak",
          id,
          userId,
          dataReview,
          function (error, result) {
            if (result) {
              // console.log(result);
              Swal.fire({
                title: "Berhasil",
                text: "Anda berhasil melakukan review dokumen ini",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              console.log(error);
            }
          }
        );
      }
    });
  },
});

//korespondensi

Template.createKorespondensi.onCreated(function () {
  const self = this;
  self.data = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  self.categoryLetters = new ReactiveVar();
  self.isSKLetter = new ReactiveVar();
  self.buktiSurat = new ReactiveVar([]);
  self.allFileNames = new ReactiveVar([]);
  const jenis = "kategori-surat"
  setTimeout(() => {
    startSelect2();
  }, 500)
  Meteor.call(
    "config.getConfig",
    jenis,
    function (error, result) {
      if (result) {
        console.log(result);
        self.categoryLetters.set(result)
      } else {
        console.log(error);
      }
    }
  );
  // Meteor.call('fileName.getAll', function (error, result) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log(result)
  //     self.allFileNames.set(result)
  //   }
  // })
});
Template.createKorespondensi.onRendered(function () {
  const template = Template.instance();
  const context = this;
  initEditor(template, context.optionsDescription);
  setTimeout(() => {
    startSelect2();
  }, 500)
});
Template.createKorespondensi.helpers({
  categoryLetters() {
    return Template.instance().categoryLetters.get();
  },
  isSKLetter() {
    return Template.instance().isSKLetter.get();
  },
  getUserFullName(userId) {
    const user = Meteor.users.findOne({ _id: userId });
    return user ? user.profile.fullName : '';
  },
  buktiSurat() {
    return Template.instance().buktiSurat.get();
  },
  allFileNames() {
    return Template.instance().allFileNames.get();
  },
})
Template.createKorespondensi.events({
  "change #buktiSurat": function (e, t) {
    const buktiSurat = t.buktiSurat.get();
    const files = $("#buktiSurat").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc") {
            $(`#buktiSurat-${buktiSurat.length - 1}`).attr(
              "href",
              this.result
            );
          }
        });
        reader.readAsDataURL(file);
        buktiSurat.push(body);
        t.buktiSurat.set(buktiSurat);
      }
    }
  },
  "click .remove-buktiSurat": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiSurat = t.buktiSurat.get();
    buktiSurat.splice(parseInt(index), 1);
    t.buktiSurat.set(buktiSurat);
  },
  "change #category"(e, t) {
    const categorySlug = e.target.options[e.target.selectedIndex].getAttribute("milik");
    console.log(categorySlug);
    if (categorySlug == "surat-keputusan") {
      t.isSKLetter.set(true);
    }
    else {
      t.isSKLetter.set(false)
    }
  },
  async "click #submit"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    const category = $("#category").val();
    const receiver = $("#receiver").val();
    const letterCode = $("#code").val();
    const about = $("#about").val()
    const skLetterTanggalAwal = $("#date-start").val();
    const skLetterTanggalAkhir = $("#date-end").val();
    const cekSK = t.isSKLetter.get();
    const data = {
      category,
      receiver,
      about,
      letterCode,
    };



    if (cekSK == true) {
      data.tanggalBerlaku = skLetterTanggalAwal;
      data.tanggalBerakhir = skLetterTanggalAkhir;
    }

    const files = t.buktiSurat.get();
    const thisForm = {};
    thisForm[files] = [];
    if (files.length > 0) {
      for (let index = 0; index < files.length; index++) {
        const fileName = files[index].file.name;
        const uploadData = {
          fileName: "kepegawaian/letters/" + fileName,
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
      data.links = thisForm[files]
    }

    Meteor.call("korespondensi.create", data, function (error, result) {
      if (result) {
        Swal.close();
        successAlert();
        location.reload();
        history.back();
      } else {
        Swal.close();
        console.log(error);
        failAlert(error);
      }
    });
  },
});

Template.listKorespondensi.onCreated(function () {
  const self = this;
  self.listItems = new ReactiveVar();
  self.jabatanLogin = new ReactiveVar();
  self.dataKorespondensi = new ReactiveVar();
  self.dataKorespondensiPembuat = new ReactiveVar();
  self.dataHistoryReviewer = new ReactiveVar();
  const listItems = []

  // const userId = Meteor.userId();
  // if (userId) {
  //   Meteor.call("employee.getDataLogin", userId, function (error, result) {
  //     if (result) {
  //       const dataRole = result[0];
  //       self.jabatanLogin.set(dataRole);
  //       console.log(dataRole);
  //       Meteor.call("korespondensi.getByRoles", dataRole, function (error, result) {
  //         if (result) {
  //           console.log(result);
  //           listItems.push(result);
  //           self.listItems.set(result)
  //         } else {
  //           console.log(error);
  //         }
  //       });

  //       Meteor.call("korespondensi.getHistoryByPengisi", dataRole, function (error, result) {
  //         console.log(result);
  //         if (result) {
  //           self.dataHistoryReviewer.set(result);
  //         } else {
  //           console.log(error);
  //         }
  //       });
  //     } else {
  //       console.log(error);
  //     }
  //   });
  // }
  Meteor.call("korespondensi.getAll", function (error1, result1) {
    if (result1) {
      self.dataKorespondensi.set(result1);
    } else {
      console.log(error1);
    }
  });

  // Meteor.call("korespondensi.getByCreator", function (error, result) {
  //   if (result) {
  //     self.dataKorespondensiPembuat.set(result);
  //     self.listItems.set(result);
  //   } else {
  //     console.log(error);
  //   }
  // });
});

Template.listKorespondensi.helpers({
  listItems() {
    return Template.instance().listItems.get();
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  dataKorespondensi() {
    return Template.instance().dataKorespondensi.get();
  },
  dataKorespondensiPembuat() {
    return Template.instance().dataKorespondensiPembuat.get();
  },
  dataHistoryReviewer() {
    return Template.instance().dataHistoryReviewer.get();
  }
});

Template.listKorespondensi.events({
  "click #btn_delete"(e, t) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    Swal.fire({
      title: "Konfirmasi Hapus Surat",
      text: "Apakah anda yakin menghapus surat ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("korespondensi.delete", id, function (error, result) {
          if (result) {
            successAlert();
            location.reload();
          } else {
            console.log(error);
            failAlert()
          }
        });
      }
    });
  },
  // seandainya tidak ingin menggunkan btn-search pakai saja input .search-input
  "click #btn-search"(e, t) {
    e.preventDefault();

    const nameOfPerihal = $("#nameOfPerihal").val();
    const nameOfExperiedDate = $("#nameOfExperiedDate").val();

    const data = {
      about: nameOfPerihal,
      tanggalBerakhir: nameOfExperiedDate
    }

    Meteor.call("korespondensi.search", data, function (error, result) {
      if(result) {
        t.dataKorespondensi.set(result);
      }
      else {
        console.log(error);
        failAlert("Error")
      }
    })

    // Template.instance().listItems.set(filteredItems);
  },

  "click #btn-refresh"(e, t) {
    e.preventDefault();

    const data = {
      about: nameOfPerihal,
      tanggalBerakhir: nameOfExperiedDate
    }

    Meteor.call("korespondensi.getAll", data, function (error, result) {
      if(result) {
        t.dataKorespondensi.set(result);
      }
      else {
        console.log(error);
        failAlert("Error")
      }
    })

    // Template.instance().listItems.set(filteredItems);
  }

});

Template.editKorespondensi.onCreated(function () {
  const self = this;
  self.fullname = new ReactiveVar();
  const template = Template.instance();
  self.dataKorespondensi = new ReactiveVar();
  self.daftarAlur = new ReactiveVar([]);
  self.jabatanLogin = new ReactiveVar();
  self.listKorespondensiSigner = new ReactiveVar([]);
  self.listTembusan = new ReactiveVar([]);
  const id = FlowRouter.getParam("_id");
  const userId = Meteor.userId();
  self.isSKLetter = new ReactiveVar();
  self.categoryLetters = new ReactiveVar();
  const jenis = "kategori-surat";



  startSelect2();
  if (userId) {
    Meteor.call("employee.getDataLogin", userId, function (error, result) {
      if (result) {
        console.log("Result", result);
        const dataRole = result[0];
        self.jabatanLogin.set(dataRole);
        Meteor.call("employee.getUser", userId, function (error, fullname) {
          if (fullname) {
            self.fullname.set(fullname);
            console.log("Fullname:", fullname);
          } else {
            console.log("Fullname not found.");
          }
        });
      } else {
        console.log(error);
      }
    });
  };
  Meteor.call("korespondensi.getById", id, function (error, result) {
    if (result) {
      self.dataKorespondensi.set(result)
      if (result.tanggalBerlaku || result.tanggalBerakhir) {
        self.isSKLetter.set(true);
      }
      else {
        self.isSKLetter.set(false);
      }
      console.log("Alur", result.alur.length);
      let dataAlur = [];
      let dataSigner = [];
      let dataTembusan = [];

      if (result.alur) {
        for (const iterator of result.alur) {
          dataAlur.push(iterator.jabatan);
        }
        self.daftarAlur.set(dataAlur);

      }

      if (result.signer) {
        for (const iterator of result.signer) {
          dataSigner.push({
            nameSignotory: iterator.nameSignotory,
            positionSignotory: iterator.positionSignotory
          });
        }
        self.listKorespondensiSigner.set(dataSigner);

      }
      if (result.tembusan) {
        for (const iterator of result.tembusan) {
          dataTembusan.push({
            tembusanName: iterator.tembusanName
          });
        }
        self.listTembusan.set(dataTembusan);

      }

      self.optionsDescription.content = result.desc;
      initEditor(template, self.optionsDescription);

    } else {
      console.log(error);
    }
  });

  Meteor.call(
    "config.getConfig",
    jenis,
    function (error, result) {
      if (result) {
        console.log(result);
        self.categoryLetters.set(result)
      } else {
        console.log(error);
      }
    }
  );
  self.editorDescription = new ReactiveVar();
  self.optionsDescription = {
    editorEl: "editorDescription",
    toolbarEl: "toolbar-containerDescription",
    templateField: "editorDescription"
  };
})

Template.editKorespondensi.helpers({
  dataKorespondensi() {
    return Template.instance().dataKorespondensi.get();
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
  daftarAlur() {
    return Template.instance().daftarAlur.get();
  },
  categoryLetters() {
    return Template.instance().categoryLetters.get();
  },
  listKorespondensiSigner() {
    return Template.instance().listKorespondensiSigner.get();
  },
  listTembusan() {
    return Template.instance().listTembusan.get();
  },
  isSKLetter() {
    return Template.instance().isSKLetter.get();
  },

})

Template.editKorespondensi.events({
  "change #category"(e, t) {
    const categorySlug = e.target.options[e.target.selectedIndex].getAttribute("milik");
    console.log(categorySlug);
    if (categorySlug == "surat-keputusan") {
      t.isSKLetter.set(true);
    }
    else {
      t.isSKLetter.set(false)
    }
  },
  "click .btn-remove-tembusan"(e, t) {
    e.preventDefault();
    const index = $(e.target).attr("tembusan");
    let dataTembusan = t.listTembusan.get();
    if (index != undefined) {
      dataTembusan.splice(index, 1);
      t.listTembusan.set(dataTembusan);
    }
  },

  "click #btn-add-signer"(e, t) {
    e.preventDefault();
    const listKorespondensiSigner = t.listKorespondensiSigner.get();
    let nameSignotory = '';
    let positionSignotory = '';
    let isCreator = false;

    const sameWithMakerChecked = $("#sameWithMaker").prop("checked");
    const letterMakerChecked = $("#letterMaker").prop("checked");

    if (sameWithMakerChecked) {
      const fullname = t.fullname.get();
      const dataRole = t.jabatanLogin.get();

      if (fullname) {
        // const user = Meteor.users.findOne(userId);
        // console.log('id',user);


        if (letterMakerChecked) {
          nameSignotory = fullname;
          positionSignotory = dataRole;
          isCreator = true;
        } if (!letterMakerChecked) {
          nameSignotory = fullname;
          positionSignotory = dataRole;
          isCreator;
        }
      }
    } else {

      if (letterMakerChecked) {
        nameSignotory = $("#nameSignotory").val();
        positionSignotory = $("#positionSignotory").val();
        isCreator = true;

      } if (!letterMakerChecked) {
        nameSignotory = $("#nameSignotory").val();
        positionSignotory = $("#positionSignotory").val();
        isCreator;
      }

    }



    listKorespondensiSigner.push({
      nameSignotory,
      positionSignotory,
      isCreator
    });

    t.listKorespondensiSigner.set(listKorespondensiSigner);
  },
  "click .btn-remove-signer"(e, t) {
    e.preventDefault();
    const index = $(e.currentTarget).data('index');
    const listKorespondensiSigner = t.listKorespondensiSigner.get();
    listKorespondensiSigner.splice(index, 1);
    t.listKorespondensiSigner.set(listKorespondensiSigner);
  },
  "click #btn-add-tembusan"(e, t) {
    e.preventDefault()
    const listTembusan = t.listTembusan.get()
    const tembusanName = $("#tembusanName").val()

    const data = {
      tembusanName
    }
    listTembusan.push(data)
    t.listTembusan.set(listTembusan)
  },
  "click .btn-remove-tembusan"(e, t) {
    e.preventDefault();
    const index = $(e.currentTarget).data('index');
    const listTembusan = t.listTembusan.get();

    // Remove the tembusan at the specified index
    listTembusan.splice(index, 1);

    // Update the reactive variable
    t.listTembusan.set(listTembusan);
  },


  "click #btn-add-alur"(e, t) {
    e.preventDefault();
    const dataRow = t.daftarAlur.get();
    const selectedAlur = $("#input_alur").val();

    Swal.fire({
      title: "Konfirmasi Tambah Alur",
      text: "Apakah anda yakin menambah " + selectedAlur + " kedalam alur?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectedAlur.length > 0) {
          for (let index = 0; index < selectedAlur.length; index++) {
            const element = selectedAlur[index];
            dataRow.push(element);
          }
        }
        t.daftarAlur.set(dataRow);
        console.log(t.daftarAlur.get());
      }
    });
  },


  "click .btn-remove"(e, t) {
    e.preventDefault()
    console.log(this);
    const index = $(e.target).attr("posisi");
    let dataAlur = t.daftarAlur.get();
    console.log(index, dataAlur);
    if (index != undefined) {
      dataAlur.splice(index, 1);
    }
    t.daftarAlur.set(dataAlur);
  },
  "click #submit"(e, t) {
    e.preventDefault();
    const category = $("#category").val();
    const note = $("#noteOfLetter").val();
    const purpose = $("#toLetter").val();
    const attachment = $("#attach").val();
    const subject = $("#about").val();
    const desc = t.editorDescription.get().getData();
    let dataAlur = t.daftarAlur.get();
    let dataSigner = t.listKorespondensiSigner.get();
    let dataTembusan = t.listTembusan.get();
    const id = FlowRouter.getParam("_id");
    const cekSK = t.isSKLetter.get();
    const skLetterTanggalAwal = $("#date-start").val();
    const skLetterTanggalAkhir = $("#date-end").val();
    if (dataAlur.length == 0) {
      dataAlur = null
    }
    console.log("data signer:", dataSigner);

    //categori
    const data = {
      category,
      note,
      purpose,
      attachment,
      subject,
      desc,
      dataAlur,
      dataSigner,
      dataTembusan
    };

    if (cekSK == true) {
      data.tanggalBerlaku = skLetterTanggalAwal;
      data.tanggalBerakhir = skLetterTanggalAkhir;
    }

    Meteor.call("korespondensi.editSimpan", id, data, function (error, result) {
      if (result) {
        successAlert();
        location.reload();
        history.back();
      } else {
        console.log(error);
        failAlert(error);
      }
    });
  },
  "click #btn-send": function (e, t) {
    e.preventDefault();
    const category = $("#category").val();
    const note = $("#noteOfLetter").val();
    const purpose = $("#toLetter").val();
    const attachment = $("#attach").val();
    const subject = $("#about").val();
    const desc = t.editorDescription.get().getData();
    let dataAlur = t.daftarAlur.get();
    let listKorespondensiSigner = t.listKorespondensiSigner.get();
    let listTembusan = t.listTembusan.get();
    console.log(dataAlur);
    const id = FlowRouter.getParam("_id");
    const cekSK = t.isSKLetter.get();
    const skLetterTanggalAwal = $("#date-start").val();
    const skLetterTanggalAkhir = $("#date-end").val();
    //categori
    const data = {
      category,
      note,
      purpose,
      attachment,
      subject,
      desc,
      dataAlur,
      listKorespondensiSigner,
      listTembusan
    };

    if (cekSK == true) {
      data.tanggalBerlaku = skLetterTanggalAwal;
      data.tanggalBerakhir = skLetterTanggalAkhir;
    }

    Meteor.call("korespondensi.editKirim", id, data, function (error, result) {
      if (result) {
        successAlert();
        location.reload();
        history.back();
      } else {
        console.log(error);
        failAlert(error);
      }
    });
  },
});
Template.detailKorespondensi.onCreated(function () {
  const self = this;
  self.formSubmit = new ReactiveVar(0);
  self.categoryLetters = new ReactiveVar();
  self.isSKLetter = new ReactiveVar();
  self.buktiSurat = new ReactiveVar([]);
  self.buktiSuratTTD = new ReactiveVar([]);
  const id = FlowRouter.current().params._id;
  const jenis = "kategori-surat"
  self.letterData = new ReactiveVar();
  Meteor.call('korespondensi.getById', id, function (error, result) {
    if (result) {
      self.letterData.set(result);
      if (result.tanggalBerlaku || result.tanggalBerakhir) {
        self.isSKLetter.set(true);
      }
      else {
        self.isSKLetter.set(false);
      }
    }
  });
  Meteor.call(
    "config.getConfig",
    jenis,
    function (error, result) {
      if (result) {
        self.categoryLetters.set(result)
      } else {
        console.log(error);
      }
    }
  );
});

Template.detailKorespondensi.helpers({
  letterData: function () {
    return Template.instance().letterData.get();
  },
  formSubmit: function () {
    return Template.instance().formSubmit.get();
  },
  statusRevisi: function () {
    const data = Template.instance().letterData.get();
    const approval1 = data.approval1;
    const approval2 = data.approval2;

    let statusRevisi = 1;
    if (approval2.status == 1) {
      statusRevisi = 0;
    }
    return statusRevisi;
  },
  categoryLetters() {
    return Template.instance().categoryLetters.get();
  },
  isSKLetter() {
    return Template.instance().isSKLetter.get();
  },
  buktiSurat() {
    return Template.instance().buktiSurat.get();
  },
  buktiSuratTTD() {
    return Template.instance().buktiSuratTTD.get();
  }
});
Template.detailKorespondensi.events({
  "change #buktiSurat": function (e, t) {
    const buktiSurat = t.buktiSurat.get();
    const files = $("#buktiSurat").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc") {
            $(`#buktiSurat-${buktiSurat.length - 1}`).attr(
              "href",
              this.result
            );
          }
        });
        reader.readAsDataURL(file);
        buktiSurat.push(body);
        t.buktiSurat.set(buktiSurat);
      }
    }
  },
  "click .remove-buktiSurat": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiSurat = t.buktiSurat.get();
    buktiSurat.splice(parseInt(index), 1);
    t.buktiSurat.set(buktiSurat);
  },
  "change #buktiSuratTTD": function (e, t) {
    const buktiSuratTTD = t.buktiSuratTTD.get();
    const files = $("#buktiSuratTTD").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc") {
            $(`#buktiSuratTTD-${buktiSuratTTD.length - 1}`).attr(
              "href",
              this.result
            );
          }
        });
        reader.readAsDataURL(file);
        buktiSuratTTD.push(body);
        t.buktiSuratTTD.set(buktiSuratTTD);
      }
    }
  },
  "click .remove-buktiSuratTTD": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiSuratTTD = t.buktiSuratTTD.get();
    buktiSuratTTD.splice(parseInt(index), 1);
    t.buktiSuratTTD.set(buktiSuratTTD);
  },
  async "click #submit"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Loading...",
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });
    Swal.fire({
      title: "Konfirmasi Ubah Surat",
      text: "Apakah anda yakin mengubah surat ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const id = FlowRouter.getParam("_id");
        const receiver = $("#receiver").val();
        const about = $("#about").val()
        const data = {
          receiver,
          about,
        };

        const files = t.buktiSurat.get();
        const thisForm = {};
        thisForm[files] = [];
        if (files.length > 0) {
          for (let index = 0; index < files.length; index++) {
            const fileName = files[index].file.name;
            const uploadData = {
              fileName: "kepegawaian/letters/" + fileName,
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
          data.links = thisForm[files]
        }

        const filesTTD = t.buktiSuratTTD.get();
        const thisFormTTD = {};
        thisFormTTD[filesTTD] = [];
        if (filesTTD.length > 0) {
          for (let index = 0; index < filesTTD.length; index++) {
            const fileName = filesTTD[index].file.name;
            const uploadData = {
              fileName: "kepegawaian/letters/" + fileName,
              type: "image/png",
              Body: filesTTD[index].file
            }
            const linkUpload = await uploadFiles(uploadData);
            thisFormTTD[filesTTD].push(
              {
                name: filesTTD[index].file.name,
                link: linkUpload
              });
          }
          data.linksTTD = thisFormTTD[filesTTD]
        }

        Meteor.call("korespondensi.editSimpan", data, id, function (error, result) {
          if (result) {
            Swal.close();
            successAlert();
            location.reload();
            history.back();
          } else {
            Swal.close();
            console.log(error);
            failAlert(error);
          }
        });
      }
    });
    
  },

  'click #btn-revisi': function (e, t) {
    t.formSubmit.set(1);
  },
  'click #revisi-save': function (e, t) {
    const note = $('#note').val();
    const letterId = Router.current().params._id;
    const status = 99;

    const data = {
      note,
      letterId,
      status
    }
    Meteor.call('update.revisionLetter', data, function (error, result) {
      if (result) {
        alert('berhasil update');
        history.back();
      } else {
        alert('gagal update');
      }
    })
  },
  "click #btn-approve"(e, t) {
    const letterId = $(e.target).attr("milik");
    const status = 1;
    const data = {
      letterId,
      status
    };
    Meteor.call('update.statusLetter', data, function (error, result) {
      if (result) {
        history.back();
      } else { }
    });

  }
});

Template.arsipKorespondensi.onCreated(function () {
  const self = this;
  self.buktiSurat = new ReactiveVar([]);
  self.allFileNames = new ReactiveVar([]);
  self.arsipFile = new ReactiveVar([]);
  const id = FlowRouter.getParam("_id")
  Meteor.call('fileName.getAll', function (error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(result)
      self.allFileNames.set(result)
    }
  })

  Meteor.call('korespondensi.getById', id, function (error, result) {
    if (error) {
      console.log(error);
    }
    else {
      console.log(result);
      let arrayData = [];
      if (result.linksArsip) {
        for (const iterator of result.linksArsip) {
          arrayData.push(iterator)
        }
        self.arsipFile.set(arrayData)
        console.log(self.arsipFile.get());
      }
    }
  })

})

Template.arsipKorespondensi.helpers({
  buktiSurat() {
    return Template.instance().buktiSurat.get();
  },
  allFileNames() {
    return Template.instance().allFileNames.get();
  },
  arsipFile() {
    return Template.instance().arsipFile.get();
  }
})

Template.arsipKorespondensi.events({
  "change #buktiSurat": function (e, t) {
    const buktiSurat = t.buktiSurat.get();
    console.log(buktiSurat);
    const files = $("#buktiSurat").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (file.type != ".pdf" || file.type != ".docx" || file.type != ".doc") {
            $(`#buktiSurat-${buktiSurat.length - 1}`).attr(
              "href",
              this.result
            );
          }
        });
        reader.readAsDataURL(file);
        buktiSurat.push(body);
        t.buktiSurat.set(buktiSurat);
      }
    }
  },
  "click .remove-buktiSurat": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const buktiSurat = t.buktiSurat.get();
    buktiSurat.splice(parseInt(index), 1);
    t.buktiSurat.set(buktiSurat);
    // console.log(t.buktiSurat.get());
  },
  "click #btn-save"(e, t) {
    e.preventDefault()
    console.log("masuk");
    const id = FlowRouter.getParam("_id");
    const files = t.buktiSurat.get();
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
      if (result.isConfirmed) {
        Swal.fire({
          title: "Loading...",
          allowOutsideClick: false,
          showConfirmButton: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          },
        });

        for (let index = 0; index < files.length; index++) {
          const fileName = files[index].file.name;
          const sendFileName = checkDuplicateFileName(fileName, allFileNames);
          const uploadData = {
            fileName: "kepegawaian/arsip-surat/" + sendFileName,
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
        console.log(linksBukti);
        const data = {
          linksArsip: linksBukti
        }
        Meteor.call(
          "korespondensi.uploadArsip",
          data, id,
          function (error, result) {
            if (result) {
              Swal.close();
              Swal.fire({
                title: "Berhasil",
                text: "Data arsip berhasil dibuat",
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
    })
  }
})

Template.timelineWorkProgram.onCreated(function () {

  this.timeline = new ReactiveVar();

  this.autorun(() => {
    const data = Template.currentData();
    if (data && data.timelines) {
      this.timeline.set(data.timelines);
    }
  });
});

Template.timelineWorkProgram.helpers({
  timeline() {
    const timeline = Template.instance().timeline.get();
    return timeline;
    if (timeline) {
      // const a = timeline.sort((a, b) => a.timestamp - b.timestamp);
      // return a;
    }
    else {
      return []
    }
  }
});

// Template.letterKopTemplate.onCreated(function (){
//   const self = this;
//   self.thisUser = new ReactiveVar();

//   Meteor.call("document.getDocumentsByID", id, function (error, result) {
//     if (result) {
//       self.data.set(result);
//     }
//   });
// });
function checkDuplicateFileName(fileName, allFileNames) {
  const result = allFileNames;
  if (result.length == 0 || result == undefined) {
    return fileName;
  }
  for (let i = 0; i < result.length; i++) {
    const element = result[i];
    const randomString = generateRandomString(5)
    if (fileName == element) {
      const finalName = addRandomString(fileName, randomString)
      console.log(finalName);
      return finalName;
    }
    else {
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

function addRandomString(inputString, appendString) {
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
