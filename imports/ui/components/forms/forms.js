import { formatRupiah } from "../../../startup/client";
import "./forms.html";

Template.formAddPaymentSchool.onCreated(function () {
  const self = this;

  self.total = new ReactiveVar(0);
});
Template.formAddPaymentSchool.helpers({
  listPeriode() {
    return Template.instance().listPeriode.get();
  },
  total() {
    return Template.instance().total.get();
  },
});
Template.formAddPaymentSchool.events({
  "keyup #inputWajib"(e, t) {
    e.preventDefault();
    e.target.value = formatRupiah(e.target.value, "Rp. ");
  },
});

Template.formAddGelombang.onCreated(function () {
  const self = this;
  self.listPeriode = new ReactiveVar();

  Meteor.call("periode-ppdb-getAll", function (error, result) {
    if (error) {
      console.log("fetch error:", error);
    } else {
      console.log(result);
      self.listPeriode.set(result);
    }
  });
});
Template.formAddGelombang.onRendered(function () {
  const self = this;
  console.log(this.data);
  if (this.data) {
    $("#selectedPeriod").val();
  }
});
Template.formAddGelombang.helpers({
  listPeriode() {
    return Template.instance().listPeriode.get();
  },
});
Template.formAddGelombang.events({
  "keyup .inputNominal"(e, t) {
    e.preventDefault();
    e.target.value = formatRupiah(e.target.value, "Rp. ");
  },
});

Template.formUnduhVa.onCreated(function () {
  const self = this;
  startPreloader();
  self.items = new ReactiveVar();
  self.schools = new ReactiveVar();

  Meteor.call("perwakilan.getAll", function (error, result) {
    if (error) {
      console.log("Error fetching items(p):", error);
      exitPreloader();
    } else {
      self.items.set(result.items);
      exitPreloader();
    }
  });
});
Template.formUnduhVa.onRendered(function () {
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
Template.formUnduhVa.helpers({
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
Template.formUnduhVa.events({
  "change #select-perwakilan"(e, t) {
    e.preventDefault();
    // startPreloader();

    const templateInstance = t;

    t.autorun(() => {
      Meteor.call(
        "schools.getByPerwakilan",
        e.target.value,
        function (error, result) {
          if (error) {
            failAlert(error);
            exitPreloaderLoading();
          } else {
            if (result && result.length > 0) {
              setTimeout(() => {
                templateInstance.$("#select-school").select2({
                  minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
                });
              }, 500);
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

    $("#btn-generate").prop("disabled", false);
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
          console.log("Error fetching", error);
          exitPreloader();
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
