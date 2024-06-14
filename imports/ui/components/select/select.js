import "./select.html";

Template.c_select.onRendered(function () {
  // In your Javascript (external .js resource or <script> tag)
  $(document).ready(function () {
    $(".select2").select2();
  });
});

// <-- virtual account -->
Template.c_selectPerwakilan.onCreated(function () {
  const self = this;
  self.items = new ReactiveVar();
  Meteor.call("perwakilan.getAll", function (error, result) {
    if (error) {
      console.log("Error fetching items(p):", error);
    } else {
      self.items.set(result.items);
    }
  });
});

Template.c_selectPerwakilan.onRendered(function () {
  const templateInstance = this;
  setTimeout(() => {
    this.autorun(() => {
      const items = Template.instance().items.get();
      if (items && items.length > 0) {
        templateInstance.$("#select-perwakilan").select2({
          placeholder: "Silahkan Pilih Perwakilan",
          allowClear: true,
          minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
        });
        templateInstance.$("#select-perwakilan").select2({});
      }
    });
  }, 500);
});

Template.c_selectPerwakilan.helpers({
  listPerwakilan() {
    return Template.instance().items.get();
  },
});
Template.c_selectSchools.onCreated(function () {
  const self = this;
  self.items = new ReactiveVar();
  Meteor.call("schools.getAll", function (error, result) {
    if (error) {
      console.log("Error fetching items(p):", error);
    } else {
      console.log(result);
      self.items.set(result.items);
    }
  });
});

Template.c_selectSchools.onRendered(function () {
  const templateInstance = this;
  setTimeout(() => {
    this.autorun(() => {
      const items = Template.instance().items.get();
      if (items && items.length > 0) {
        templateInstance.$("#select-schools").select2({
          placeholder: "Silahkan Pilih Perwakilan",
          allowClear: true,
          minimumResultsForSearch: 0, // Menampilkan semua opsi langsung tanpa kotak pencarian
        });
        templateInstance.$("#select-schools").select2({});
      }
    });
  }, 500);
});

Template.c_selectSchools.helpers({
  listSchools() {
    return Template.instance().items.get();
  },
});
