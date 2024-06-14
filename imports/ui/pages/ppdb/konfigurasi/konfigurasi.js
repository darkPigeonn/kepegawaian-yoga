import "./konfigurasi.html";
import "/imports/ui/components/modals/modals";
import "/imports/ui/components/forms/forms";
import {
  convert2number,
  exitLoading,
  startSelect2,
} from "../../../../startup/client";
Template.konfigurasi.events({
  "click .tab-item"(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const tabId = target.getAttribute("data-tab");

    // Remove active class from all tab items
    document.querySelectorAll(".tab-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to clicked tab item
    target.classList.add("active");

    // Remove active class from all tab panes
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active");
    });

    // Add active class to corresponding tab pane
    document.getElementById(tabId).classList.add("active");
  },
});

Template.konfigurasiSchool.events({
  "click .tab-item"(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const tabId = target.getAttribute("data-tab");

    // Remove active class from all tab items
    document.querySelectorAll(".tab-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to clicked tab item
    target.classList.add("active");

    // Remove active class from all tab panes
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active");
    });

    // Add active class to corresponding tab pane
    document.getElementById(tabId).classList.add("active");
  },
});

Template.konfigurasiVa.onCreated(function () {
  const self = this;
  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 10; // Jumlah data per halaman
  self.items = new ReactiveVar([]);
  self.totalItems = new ReactiveVar(0);
  self.viewList = new ReactiveVar("0");
  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;

    Meteor.call("get-config-va", currentPage, perPage, (error, result) => {
      if (error) {
        console.error("Error while fetching students:", error);
        exitPreloader();
      } else {
        self.items.set(result.items);
        self.totalItems.set(result.totalItems);
        exitPreloader();
      }
    });
  });
});
Template.konfigurasiVa.helpers({
  items: function () {
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
  viewList() {
    return Template.instance().viewList.get();
  },
});
Template.konfigurasiVa.events({
  "click #btn-save-modal"(e, t) {
    e.preventDefault();

    startPreloader();
    const category = $("#select-category").val();
    let idUnit = "-";
    const code = $("#input-code").val();

    if (category == "0") {
      swalInfo("Silahkan pilih kategori");
      return false;
    }
    if (category == "unit") {
      idUnit = $("#select-perwakilan").val();
    }
    if (category == "schools") {
      idUnit = $("#select-schools").val();
    }
    if (category == "type") {
      idUnit = $("#select-post").val();
    }
    if (!idUnit || idUnit === "0") {
      swalInfo("Silahkan pilih perwakilan/type post");
      return false;
    }
    if (!code || code === "0") {
      swalInfo("Silahkan tulis kode va ");
      return false;
    }

    Meteor.call(
      "add-config-va",
      category,
      idUnit,
      code,
      function (error, result) {
        if (error) {
          failAlert(error);
        } else {
          successAlert("Berhasil");
        }
      }
    );
    exitPreloader();
  },
  "click #btn-add"(e, t) {
    setTimeout(() => {
      $(".select2").select2({});
    }, 500);
  },
  "change #select-category"(e, t) {
    e.preventDefault();

    t.viewList.set(e.target.value);
    startSelect2();
  },
  "click .btn-view-mode"(e, t) {
    e.preventDefault();

    // const self
  },
});

Template.periodePpdb.onCreated(function () {
  const self = this;
  self.items = new ReactiveVar();

  Meteor.call("periode-ppdb-getAll", function (error, result) {
    if (error) {
      console.log("fetch period error");
      exitPreloader();
    } else {
      self.items.set(result);
      exitPreloader();
    }
  });
});
Template.periodePpdb.helpers({
  periodePpdb() {
    return Template.instance().items.get();
  },
});
Template.periodePpdb.events({
  "submit #addForm"(e, t) {
    e.preventDefault();
    startPreloader();
    const name = $("#inputName").val();
    const year = $("#inputTahunAjaran").val();
    const code = $("#inputCodePeriode").val();

    const id = e.target.getAttribute("data-milik");

    let postUrl = "periode-ppdb-insert";
    if (id) {
      postUrl = "periode-ppdb-update";
    }

    Meteor.call(postUrl, name, year, code, id, function (error, result) {
      if (error) {
        failAlert(error);
        exitPreloader();
      } else {
        successAlert("Berhasil");
        exitPreloader();
        location.reload();
      }
    });
  },
});

Template.formInputPeriode.helpers({
  tahunAjaran() {
    return Template.instance().tahunAjaran.get();
  },
});
Template.formInputPeriode.onCreated(function () {
  this.tahunAjaran = new ReactiveVar("");

  if (this.data) {
    if (this.data.year) {
      this.tahunAjaran = new ReactiveVar(this.data.year);
    }
  }
});
Template.formInputPeriode.events({
  "keyup #inputTahunAjaran"(e, t) {
    e.preventDefault();
    let val = e.target.value;
    if (val.length <= 9) {
      val = val.replace(/\D/g, ""); // Hanya angka yang diperbolehkan
      val = val.slice(0, 8); // Batasi panjang input maksimal 8 karakter
      if (val.length > 4) {
        val = val.slice(0, 4) + "/" + val.slice(4);
      }
      t.tahunAjaran.set(val);
    } else {
      val = val.slice(0, 9);
      console.log(val);
      swalInfo("Melebihi jumlah  maksimal tahun periode ppdb");
      t.tahunAjaran.set("");
      setTimeout(() => {
        t.tahunAjaran.set(val);
      }, 500);
    }
  },
});

Template.gelombangPage.onCreated(function () {
  const self = this;

  self.items = new ReactiveVar();
  self.showEdit = new ReactiveVar(false);
  startPreloader();

  Meteor.call("getAll-gelombang-school", function (error, result) {
    if (error) {
      console.log("fetch failed :", error);
    } else {
      self.items.set(result);
    }
  });
});
Template.gelombangPage.helpers({
  listGelombang() {
    return Template.instance().items.get();
  },
  showEdit() {
    return Template.instance().showEdit.get();
  },
});
Template.gelombangPage.events({
  "submit #addForm"(e, t) {
    e.preventDefault();
    startPreloader();

    const name = $("#inputNameGelombang").val();
    const code = $("#inputCode").val();
    const feeForm = convert2number($("#inputUangForm").val());
    const feeSpp = convert2number($("#inputUangSpp").val());
    const feeEvent = convert2number($("#inputUangKegiatan").val());
    const feeUtilty = convert2number($("#inputUangAlat").val());
    const periodePpdb = $("#selectedPeriod").val();

    Meteor.call(
      "insert-gelombang-school",
      name,
      code,
      feeForm,
      feeSpp,
      feeEvent,
      feeUtilty,
      periodePpdb,
      function (error, result) {
        if (error) {
          swalInfo(error.reason);
          exitLoading();
        } else {
          successAlert("Berhasil");
          location.reload();
        }
      }
    );
  },
  "click #btn-update"(e, t) {
    e.preventDefault();
    t.showEdit.set(!t.showEdit.get());
  },
});

Template.paymentConfigSchool.onCreated(function () {
  const self = this;
  startPreloader();

  self.items = new ReactiveVar();

  Meteor.call("getAll-payment-school", function (error, result) {
    if (error) {
      console.log("fetch failed : ", error);
      exitPreloader();
    } else {
      self.items.set(result);
      exitPreloader();
    }
  });
});
Template.paymentConfigSchool.helpers({
  listPaymentConfig() {
    return Template.instance().items.get();
  },
});
Template.paymentConfigSchool.events({
  "submit #addForm"(e, t) {
    e.preventDefault();
    startPreloader();
    const name = $("#inputNamePayment").val();
    const category = $("#selectedCategory").val();
    const nominal = convert2number($("#inputWajib").val());

    if (!category || category == "0") {
      swalInfo("Silahkan pilih kategori pembayaran");
      exitPreloader();
      return false;
    }

    Meteor.call(
      "insert-payment-school",
      name,
      category,
      nominal,
      function (error, result) {
        if (error) {
          swalInfo(error.reason);
          exitLoading();
        } else {
          successAlert("Berhasil");
          location.reload();
        }
      }
    );
  },
});
