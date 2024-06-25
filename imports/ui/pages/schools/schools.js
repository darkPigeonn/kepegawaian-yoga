import "./schools.html";

Template.listSchools.onCreated(function () {
  const self = this;

  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 10; // Jumlah data per halaman

  self.items = new ReactiveVar([]);
  self.totalItems = new ReactiveVar(0);
  self.searchQuery = new ReactiveVar("");

  this.autorun(() => {
    console.log(self.searchQuery.get());
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;
    Meteor.call(
      "schools.getAll",
      currentPage,
      perPage,
      self.searchQuery.get(),
      function (error, result) {
        if (error) {
          console.error("Error while fetching items(p):", error);
          exitPreloader();
        } else {
          self.items.set(result.items);
          self.totalItems.set(result.totalItems);
          exitPreloader();
        }
      }
    );
  });
});
Template.listSchools.helpers({
  listSchools() {
    return Template.instance().items.get();
  },
  getNumber(index) {
    const template = Template.instance();
    const currentPage = template.currentPage.get();
    const perPage = template.perPage;
    return (currentPage - 1) * perPage + index + 1;
  },
  getPageNumbers: function (totalPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  },
  isActive: function (pageNumber) {
    return Template.instance().currentPage.get() === pageNumber ? "active" : "";
  },
  totalPages() {
    const totalStudents = Template.instance().totalItems.get();
    const perPage = Template.instance().perPage;
    return Math.ceil(totalStudents / perPage);
  },
  // Mendapatkan nomor halaman saat ini
  getCurrentPageNumber(currentPage) {
    return currentPage;
  },

  // Mendapatkan nomor halaman berikutnya
  getNextPageNumber(currentPage) {
    return currentPage + 1;
  },

  // Menentukan apakah harus menampilkan tombol "Previous"
  showPrevious() {
    const currentPage = Template.instance().currentPage.get();
    return currentPage > 1;
  },

  // Menentukan apakah harus menampilkan tombol "Next"
  showNext(totalPages) {
    const currentPage = Template.instance().currentPage.get();
    return currentPage < totalPages;
  },
});
Template.listSchools.events({
  "click .page-link"(event, template) {
    event.preventDefault();
    const pageNumber = parseInt(event.target.getAttribute("data-page"));
    template.currentPage.set(pageNumber);
  },
  "input .search-input"(event, template) {
    event.preventDefault()
    template.searchQuery.set(event.target.value);
  }

});
