import Swal from "sweetalert2";
import "./ppdb.html";
import "/imports/ui/components/modals/modals";
import "/imports/ui/components/forms/forms";
import {
  convert2number,
  formatRupiah,
  startSelect2,
} from "../../../startup/client";
import Papa from "papaparse";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import XLSX from "xlsx";
import moment from "moment";

Template.pagePpdb.onCreated(function () {
  const self = this;
  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 10; // Jumlah data per halaman
  self.students = new ReactiveVar([]);
  self.totalStudents = new ReactiveVar(0);
  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;

    Meteor.call("ppdb-school-getAll", currentPage, perPage, (error, result) => {
      if (error) {
        console.error("Error while fetching students:", error);
        exitPreloader();
      } else {
        self.students.set(result.registrans);
        self.totalStudents.set(result.totalRegistrans);
        exitPreloader();
      }
    });
  });
});
Template.pagePpdb.helpers({
  students: function () {
    console.log(Template.instance().students.get());
    console.log(Template.instance().totalStudents.get());
    return Template.instance().students.get();
  },
  totalPages: function () {
    const totalStudents = Template.instance().totalStudents.get();
    const perPage = Template.instance().perPage;
    return Math.ceil(totalStudents / perPage);
  },
  getPageNumbers: function (totalPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.perPage;
    return (currentPage - 1) * perPage + index + 1;
  },
});
Template.pagePpdb.events({
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
});

// <-- virtual account -->
Template.pageGenerateVa.onCreated(function () {
  const self = this;

  self.items = new ReactiveVar();
  self.schools = new ReactiveVar();
  self.listVa = new ReactiveVar();

  //pagination client
  this.currentPage = new ReactiveVar(1);
  this.pageSize = new ReactiveVar(20);

  Meteor.call("perwakilan.getAll", function (error, result) {
    if (error) {
      console.log("Error fetching items(p):", error);
    } else {
      self.items.set(result.items);
    }
  });

  self.listPeriode = new ReactiveVar();

  // Meteor.call("periode-ppdb-getAll", function (error, result) {
  //   if (error) {
  //     console.log("fetch error:", error);
  //   } else {
  //     console.log(result);
  //     self.listPeriode.set(result);
  //   }
  // });
});
Template.pageGenerateVa.onRendered(function () {
  const templateInstance = this;
  this.$("#select-school[disabled]").tooltip({
    title: "Silahkan pilih perwakilan terlebih dahulu",
    placement: "top",
    trigger: "hover",
  });
  this.$("#btn-generate[disabled]").tooltip({
    title: "Silahkan pilih perwakilan terlebih dahulu",
    placement: "top",
    trigger: "hover",
  });
  this.autorun(() => {
    const items = Template.instance().items.get();

    if (items && items.length > 0) {
      templateInstance.$("#select-perwakilan").select2({
        placeholder: "Silahkan Pilih Perwakilan",
        allowClear: true,
        minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
        data: items.map((item) => ({
          id: item._id,
          text: item.name,
        })),
      });
      templateInstance.$("#select-perwakilan").select2({});
    }
  });
});
Template.pageGenerateVa.helpers({
  listPerwakilan() {
    return Template.instance().items.get();
  },
  listSchools() {
    return Template.instance().schools.get();
  },
  listVa() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const startIndex = (currentPage - 1) * pageSize;
    return instance.listVa.get().slice(startIndex, startIndex + pageSize);
  },
  currentPage() {
    return Template.instance().currentPage.get();
  },
  totalPages() {
    const instance = Template.instance();
    const pageSize = instance.pageSize.get();
    return Math.ceil(instance.listVa.get().length / pageSize);
  },
  isFirstPage() {
    return Template.instance().currentPage.get() === 1;
  },
  isLastPage() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const totalPages = Math.ceil(instance.listVa.get().length / pageSize);
    return currentPage === totalPages;
  },
  pageNumbers() {
    const instance = Template.instance();
    const totalPages = Math.ceil(
      instance.listVa.get().length / instance.pageSize.get()
    );
    return Array.from({ length: totalPages }, (v, k) => k + 1);
  },
  prevDisabled() {
    return Template.instance().currentPage.get() === 1 ? "disabled" : "";
  },
  nextDisabled() {
    const instance = Template.instance();
    const currentPage = instance.currentPage.get();
    const pageSize = instance.pageSize.get();
    const totalPages = Math.ceil(data.length / pageSize);
    return currentPage === totalPages ? "disabled" : "";
  },
  isCurrentPage(page) {
    const currentPage = Template.instance().currentPage.get();
    return page === currentPage ? "selected" : "";
  },
  getPageNumbers: function (totalPages) {
    if (totalPages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.pageSize.get();
    return (currentPage - 1) * perPage + index + 1;
  },
  listPeriode() {
    return Template.instance().listPeriode.get();
  },
});

Template.pageGenerateVa.events({
  "change #select-perwakilan"(e, t) {
    e.preventDefault();
    startPreloader();
    const templateInstance = t;

    t.autorun(() => {
      Meteor.call(
        "schools.getByPerwakilan",
        e.target.value,
        function (error, result) {
          if (error) {
            failAlert(error);
          } else {
            $("#select-school").prop("disabled", false);
            if (result && result.length > 0) {
              templateInstance.$("#select-school").select2({
                placeholder: "Silahkan Pilih Sekolah",
                allowClear: true,
                minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
              });
              t.schools.set(result);
              exitPreloaderLoading();
            }
          }
        }
      );
    });
  },
  "change #select-school"(e, t) {
    e.preventDefault();
    const schoolId = e.target.value;

    Meteor.call(
      "getAll-gelombang-bySchoolId",
      schoolId,
      function (error, result) {
        if (error) {
          failAlert("Gelombang belum di atur sekolah");
        } else {
          t.listPeriode.set(result);
          $("#btn-generate").prop("disabled", false);
        }
      }
    );
  },
  "click #btn-generate"(e, t) {
    e.preventDefault();
    startPreloader();
    const selectedPerwakilans = $("#select-perwakilan").val();
    const selectedSchools = $("#select-school").val();
    const inputKodePeriode = $("#selectedPeriode").val();
    const selectedTag = $("#select-tag").val();
    if (!selectedTag || selectedTag == "0" || selectedTag == "null") {
      failAlert("Silahkan pilih tag");
      exitPreloader();
      return false;
    }
    Meteor.call(
      "va-generate-va",
      selectedPerwakilans,
      selectedSchools,
      inputKodePeriode,
      selectedTag,
      function (error, result) {
        if (error) {
          swalInfo(error.reason);
          setTimeout(() => {
            exitPreloader();
          }, 2000);
        } else {
          t.listVa.set(result);
          exitPreloader();
        }
      }
    );
  },
  "click #btn-save"(e, t) {
    e.preventDefault();

    startPreloader();

    const listVa = t.listVa.get();

    Meteor.call("va-insert", listVa, function (error, result) {
      if (error) {
        failAlert("Gagal", error);
        exitPreloader();
      } else {
        successAlert("Berhasil");
        location.reload();
      }
    });
  },
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
});

Template.paymentPage.onCreated(function () {
  const self = this;

  self.items = new ReactiveVar();
  self.listFail = new ReactiveVar();
});
Template.paymentPage.helpers({
  listFail() {
    return Template.instance().listFail.get();
  },
  listPaymentVa() {
    return Template.instance().items.get();
  },
});
Template.paymentPage.events({
  "change #upload-csv"(e, t) {
    e.preventDefault();
    startPreloader();
    const file = e.target.files[0];
    //pakai yoga dulu ya
    const reader = new FileReader();
    let dataJson = [];

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0]; // Ambil nama sheet pertama
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      for (let index = 1; index < jsonData.length; index++) {
        const element = jsonData[index];

        if (element.length > 0) {
          const dateTemp = new Date(element[6]);
          dateTemp.setDate(dateTemp.getDate() + 1);
          const dateFormatted = dateTemp.toISOString().split("T")[0];
          const newData = {
            compCode: element[0],
            numberCustomer: element[2],
            va: element[0].toString() + element[2].toString(),
            name: element[3],
            amount: element[5],
            date: dateFormatted,
            time: element[7],
            note: element[9],
          };
          dataJson.push(newData);
        }
      }
      t.items.set(dataJson);
    };
    reader.readAsArrayBuffer(file);

    exitPreloader();
  },
  "click #btn-save"(e, t) {
    e.preventDefault();
    startPreloader();

    const items = t.items.get();

    Meteor.call("konfirmasi-payment-upload", items, function (error, result) {
      if (error) {
        failAlert("Gagal");
        exitPreloader();
      } else {
        successAlert("Berhasil");
        exitPreloader();
        console.log(result);
        if (result.status == 200) {
          setTimeout(() => {
            location.reload();
          }, 500);
        } else {
          t.listFail.set(result.items);
        }
      }
    });
  },
});

Template.detailRegistran.onCreated(function () {
  const self = this;
  startPreloader();
  self.detail = new ReactiveVar();
  self.detailFinal = new ReactiveVar();
  self.photoStudent = new ReactiveVar("-");
  self.formInterview = new ReactiveVar(false);
  const id = FlowRouter.current().params._id;
  Meteor.call("ppdb-registran-detail", id, function (error, result) {
    if (error) {
      console.log("Error fetch data");
      exitPreloader();
    } else {
      self.detail.set(result);

      if (result.finalForm) {
        self.detailFinal.set(result.finalForm);
      }
      if (result.links) {
        const thisPhoto = result.links.find((item) => item.code === "pasFoto");

        self.photoStudent.set(thisPhoto);
      }
      exitPreloader();
    }
  });
});
Template.detailRegistran.helpers({
  formInterview() {
    return Template.instance().formInterview.get();
  },
  registran() {
    return Template.instance().detail.get();
  },
  registranFinal() {
    return Template.instance().detailFinal.get();
  },
  photoStudent() {
    return Template.instance().photoStudent.get();
  },
});
Template.detailRegistran.events({
  "click .btn-create-schedule"(e, t) {
    e.preventDefault();
    t.formInterview.set(!t.formInterview.get());
    setTimeout(() => {
      document
        .getElementById("formInterview")
        .scrollIntoView({ behavior: "smooth" });
    }, 500);
  },
  "click .btn-accepted"(e, t) {
    e.preventDefault();
    startPreloader();
    const id = e.target.getAttribute("milik");

    Swal.fire({
      title: "Konfirmasi Penerimaan",
      text: "Apakah anda yakin menerima calon siswa ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Terima",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startPreloader();
        Meteor.call("ppdb-accepted-student", id, function (error, result) {
          // console.log(result, error);
          if (result) {
            successAlert("Berhasil");
            setTimeout(function () {
              location.reload();
            }, 200);
          } else {
            console.log(error);
            failAlert("Gagal!");
            exitPreloader();
          }
        });
      }
    });
  },
  "submit #setScheduleForm"(e, t) {
    e.preventDefault();
    startPreloader();
    const date = $("#inputDate").val();
    const time = $("#inputTime").val();
    const note = $("#inputNote").val();

    const thisData = t.detail.get();

    Meteor.call(
      "interviews.insert",
      thisData._id,
      date,
      time,
      note,
      function (error, result) {
        if (error) {
          failAlert(error.reason);
          exitPreloader();
        } else {
          successAlert("Berhasil");
          location.reload();
        }
      }
    );
  },
  "click .btn-interview-done"(e, t) {
    e.preventDefault();
    startPreloader();
    const id = FlowRouter.current().params._id;
    Swal.fire({
      title: "Konfirmasi Wawancara Selesai",
      text: "Apakah wawancara sudah selesai?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startPreloader();
        Meteor.call("ppdb-interview-done", id, function (error, result) {
          if (result) {
            if (result.code) {
              infoAlert(result.message);
              setTimeout(() => {
                exitPreloader();
              }, 2500);
            } else {
              successAlert("Berhasil");
              setTimeout(function () {
                location.reload();
              }, 200);
            }
          } else {
            console.log(error);
            failAlert("Gagal!");
            exitPreloader();
          }
        });
      }
    });
  },
  "click .btn-rejected"(e, t) {
    e.preventDefault();
    startPreloader();
    const id = e.target.getAttribute("milik");

    Swal.fire({
      title: "Konfirmasi Penerimaan",
      text: "Apakah anda yakin menolak calon siswa ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startPreloader();
        Swal.fire({
          title: "Tuliskan alasan penolakkan",
          input: "text",
          inputAttributes: {
            autocapitalize: "off",
          },
          preConfirm: (reason) => {
            Meteor.call(
              "ppdb-rejected-student",
              id,
              reason,
              function (error, result) {
                // console.log(result, error);
                if (result) {
                  successAlert("Berhasil");
                  setTimeout(function () {
                    location.reload();
                  }, 200);
                } else {
                  console.log(error);
                  failAlert("Gagal!");
                  exitPreloader();
                }
              }
            );
          },
        });
      }
    });
  },
});
Template.cicilanRegistran.onCreated(function () {
  const self = this;
  startPreloader();
  self.detail = new ReactiveVar();
  self.detailFinal = new ReactiveVar();
  self.photoStudent = new ReactiveVar("-");
  self.formCicilan = new ReactiveVar(false);
  self.isEdit = new ReactiveVar(false);
  self.selectedItem = new ReactiveVar({});
  const id = FlowRouter.current().params._id;
  Meteor.call("ppdb-registran-detailCicilan", id, function (error, result) {
    if (error) {
      console.log("Error fetch data");
      exitPreloader();
    } else {
      console.log(result);
      self.detail.set(result);

      if (result.finalForm) {
        self.detailFinal.set(result.finalForm);
      }
      if (result.links) {
        const thisPhoto = result.links.find((item) => item.code === "pasFoto");
        self.photoStudent.set(thisPhoto);
      }
      exitPreloader();
    }
  });
});
Template.cicilanRegistran.helpers({
  formCicilan() {
    return Template.instance().formCicilan.get();
  },
  registran() {
    return Template.instance().detail.get();
  },
  registranFinal() {
    return Template.instance().detailFinal.get();
  },
  photoStudent() {
    return Template.instance().photoStudent.get();
  },
});
Template.cicilanRegistran.events({
  "click #addCicilan"(e, t) {
    e.preventDefault();

    t.formCicilan.set(!t.formCicilan.get());
  },
  "click .btn-accepted"(e, t) {
    e.preventDefault();
    startPreloader();
    const id = e.target.getAttribute("milik");

    Swal.fire({
      title: "Konfirmasi Penerimaan",
      text: "Apakah anda yakin menerima calon siswa ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Terima",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startPreloader();
        Meteor.call("ppdb-accepted-student", id, function (error, result) {
          // console.log(result, error);
          if (result) {
            successAlert("Berhasil");
            setTimeout(function () {
              location.reload();
            }, 200);
          } else {
            console.log(error);
            failAlert("Gagal!");
            exitPreloader();
          }
        });
      }
    });
  },
  "submit #add-cicilan"(e, t) {
    e.preventDefault();
    startPreloader();

    const id = FlowRouter.current().params._id;
    const index = $("#input-index").val();
    const spp = convert2number($("#input-spp").val());
    const donation = convert2number($("#input-donation").val());
    const event = convert2number($("#input-event").val());
    const utility = convert2number($("#input-utility").val());

    //get remainings
    const thisDetail = t.detail.get();
    let remainings = thisDetail.remainings;

    let postRoute = "set-cicil-student";
    //handle edit
    let idCicil = "-";
    const isEdit = t.isEdit.get();
    if (isEdit) {
      postRoute = "update-cicil-student";
      idCicil = t.selectedItem.get()._id;
      //hitung ulan untuk penjagaan
      //1. get pembayaran
      const paid = thisDetail.paid;
      const config = thisDetail.config;
      //2. hitung ulan
      const thisItem = t.selectedItem.get();
      remainings.feeSpp = config.feeSpp + thisItem.feeSpp;
      remainings.feeDonation = config.feeDonation + thisItem.feeDonation;
      remainings.feeEvent = config.feeEvent + thisItem.feeEvent;
      remainings.feeUtility = config.feeUtility + thisItem.feeUtility;
      remainings.feeTotal =
        remainings.feeSpp +
        remainings.feeDonation +
        remainings.feeEvent +
        remainings.feeUtility;
      console.log(remainings);
    }
    console.log(remainings);
    if (remainings.feeTotal == 0) {
      infoAlert("Total Cicilan sudah terpenuhi");

      return false;
    }
    if (spp > remainings.feeSpp) {
      infoAlert("SPP yang diinputkan melebihi batas atas");
      return false;
    }
    if (donation > remainings.feeDonation) {
      infoAlert("Donasi yang diinputkan melebihi batas atas");
      return false;
    }
    if (event > remainings.feeEvent) {
      infoAlert("Event yang diinputkan melebihi batas atas");
      return false;
    }
    if (utility > remainings.feeUtility) {
      infoAlert("Alat yang diinputkan melebihi batas atas");
      return false;
    }

    Meteor.call(
      postRoute,
      id,
      index,
      spp,
      donation,
      event,
      utility,
      idCicil,
      function (error, result) {
        if (error) {
          swalInfo(error.reason);
          setTimeout(() => {
            exitPreloader();
          }, 1000);
        } else {
          successAlert("Berhasil menyimpan set cicilan");
          location.reload();
        }
      }
    );
  },
  "keyup .inputNominal"(e, t) {
    e.preventDefault();
    e.target.value = formatRupiah(e.target.value, "Rp. ");
  },
  "click #lockCicilan"(e, t) {
    e.preventDefault();
    const id = FlowRouter.current().params._id;

    //cek current paid vs remainings
    const detail = t.detail.get();
    const remainings = detail.remainings;

    if (remainings.feeSpp > 0) {
      infoAlert(
        "Total Cicilan SPP masih belum sesuai, silahkan cek total cicilan SPP"
      );
      return false;
    }
    if (remainings.feeDonation > 0) {
      infoAlert(
        "Total Cicilan Sumbangan masih belum sesuai, silahkan cek total cicilan sumbangan"
      );
      return false;
    }
    if (remainings.feeEvent > 0) {
      infoAlert(
        "Total Cicilan Kegiatan masih belum sesuai, silahkan cek total cicilan kegiatan"
      );
      return false;
    }
    if (remainings.feeUtility > 0) {
      infoAlert(
        "Total Cicilan Alat masih belum sesuai, silahkan cek total cicilan alat"
      );
      return false;
    }

    Swal.fire({
      title: "Konfirmasi Pengkuncian",
      text: "Penguncian ini akan memembuka pembayaran cicilan untuk CSB & Tidak bisa dibuka kembali, apakah anda yakin?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startPreloader();
        Meteor.call("credit-lock", id, function (error, result) {
          // console.log(result, error);
          if (result) {
            successAlert("Berhasil");
            setTimeout(function () {
              location.reload();
            }, 200);
          } else {
            console.log(error);
            failAlert("Gagal!");
            exitPreloader();
          }
        });
      }
    });
  },
  "click .btn-edit"(e, t) {
    e.preventDefault();

    const registran = t.detail.get();
    const listCredits = registran.listCredits;

    const id = $(e.target).attr("milik");
    const thisData = listCredits.find((item) => item._id === id);
    t.selectedItem.set(thisData);
    t.isEdit.set(!t.isEdit.get());
    t.formCicilan.set(!t.formCicilan.get());
    $("html, body").animate(
      {
        scrollTop: $("#add-cicilan"),
      },
      1000
    );

    setTimeout(() => {
      $("#input-index").val(thisData.index);
      $("#input-spp").val(formatRupiah(thisData.feeSpp.toString(), "Rp. "));
      $("#input-donation").val(
        formatRupiah(thisData.feeDonation.toString(), "Rp. ")
      );
      $("#input-event").val(formatRupiah(thisData.feeEvent.toString(), "Rp. "));
      $("#input-utility").val(
        formatRupiah(thisData.feeUtility.toString(), "Rp. ")
      );
      $("#input-index").attr("disabled", true);
    }, 500);
  },
  "click .btn-hapus"(e, t) {
    e.preventDefault();

    const id = $(e.target).attr("milik");
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah anda yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("credit.delete", id, function (error, result) {
          if (error) {
            console.log(error);
            failAlert(error);
          } else {
            successAlert("Berhasil");
            location.reload();
          }
        });
      }
    });
  },
});

Template.pageVa.onCreated(function () {
  const self = this;
  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 30; // Jumlah data per halaman
  self.items = new ReactiveVar([]);
  self.totalItems = new ReactiveVar(0);
  self.formUnduh = new ReactiveVar(false);
  self.formAktif = new ReactiveVar(false);
  self.selectedCategori = new ReactiveVar();
  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;
    const queryReq = self.selectedCategori.get();
    Meteor.call(
      "va-school-getAll",
      currentPage,
      perPage,
      queryReq,
      (error, result) => {
        if (error) {
          console.error("Error while fetching students:", error);
          exitPreloader();
        } else {
          console.log(result);
          self.items.set(result.items);
          self.totalItems.set(result.totalItems);
          exitPreloader();
        }
      }
    );
  });
});
Template.pageVa.helpers({
  formUnduh() {
    return Template.instance().formUnduh.get();
  },
  formAktif() {
    return Template.instance().formAktif.get();
  },
  va: function () {
    return Template.instance().items.get();
  },
  totalPages: function () {
    const totalStudents = Template.instance().totalItems.get();
    const perPage = Template.instance().perPage;
    return Math.ceil(totalStudents / perPage);
  },
  getPageNumbers: function (totalPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.perPage;
    return (currentPage - 1) * perPage + index + 1;
  },
});
Template.pageVa.events({
  "change .selected-category"(event, template) {
    event.preventDefault();
    template.selectedCategori.set(event.target.value);
  },
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
  "click #btn-open-form-download"(e, t) {
    e.preventDefault();
    t.formUnduh.set(!t.formUnduh.get());
  },
  "click #btn-va-aktif"(e, t) {
    e.preventDefault();
    t.formAktif.set(!t.formAktif.get());
  },
  "click #btn-download"(e, t) {
    e.preventDefault();
    startPreloader();
    const unitId = $("#select-perwakilan").val();
    const schoolId = $("#select-school").val();
    const tag = $("#select-tag").val();

    if (!unitId || unitId === "0") {
      swalinfo("Silahkan Pilih Perwakilan");
      exitPreloader();
      return false;
    }
    if (!schoolId || schoolId === "0") {
      swalinfo("Silahkan Pilih Sekolah");
      exitPreloader();
      return false;
    }
    if (!tag || tag === "0") {
      swalinfo("Silahkan Pilih Tag");
      exitPreloader();
      return false;
    }

    Meteor.call("export-va", unitId, schoolId, tag, function (error, result) {
      if (error) {
        console.log("Fetch data gagal :", error);
        exitPreloader();
      } else {
        const fileNameExcel = "Dafta VA.xlsx";
        successAlert("Berhasil");
        exitPreloader();
        return XLSX.writeFile(result, fileNameExcel);
      }
    });
  },
  "click #btn-aktif-va"(e, t) {
    e.preventDefault();
    startPreloader();
    const unitId = $("#select-perwakilan").val();
    const schoolId = $("#select-school").val();
    const tag = $("#select-tag").val();

    if (!unitId || unitId === "0") {
      swalinfo("Silahkan Pilih Perwakilan");
      exitPreloader();
      return false;
    }
    if (!schoolId || schoolId === "0") {
      swalinfo("Silahkan Pilih Sekolah");
      exitPreloader();
      return false;
    }
    if (!tag || tag === "0") {
      swalinfo("Silahkan Pilih Tag");
      exitPreloader();
      return false;
    }

    Meteor.call(
      "set-aktif-va",
      unitId,
      schoolId,
      tag,
      function (error, result) {
        if (error) {
          console.log("Fetch data gagal :", error);
          exitPreloader();
        } else {
          successAlert("Berhasil");
          exitPreloader();
          location.reload();
        }
      }
    );
  },
});