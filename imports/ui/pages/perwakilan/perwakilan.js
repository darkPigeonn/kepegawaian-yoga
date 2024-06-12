import "./perwakilan.html";

Template.listPerwakilan.onCreated(function () {
  const self = this;

  startPreloader();

  this.currentPage = new ReactiveVar(1);
  this.perPage = 10; // Jumlah data per halaman

  self.items = new ReactiveVar([]);
  self.totalItems = new ReactiveVar(0);

  this.autorun(() => {
    const currentPage = this.currentPage.get();
    const perPage = this.perPage;
    Meteor.call(
      "perwakilan.getAll",
      currentPage,
      perPage,
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
Template.listPerwakilan.helpers({
  listPerwakilan() {
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
});
