import "./prayers.html";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import { generalPics } from "../../../api/alma-v1/db/collections-files.js";
import datatables from "datatables.net";
import _ from "underscore";
import Papa from "papaparse";
import slugify from "slugify";

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    if (obj.hasOwnProperty(name)) {
      return false;
    }
  }
  return true;
}

Template.listPrayer.onCreated(function () {
  this.articles = new ReactiveVar([]);
  datatables(window, $);
});

Template.listPrayer.onRendered(function () {
  setTimeout(() => {
    $("#mytable").DataTable();
  }, 500);
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("users-detail", userId, function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      const outlets = res.outlets;
      Meteor.call("getPrayers", outlets, function (error, result) {
        if (error) {
          failAlert(error);
        } else {
          self.articles.set(result);
        }
      });
    }
  });
});
Template.listPrayer.helpers({
  articles() {
    return Template.instance().articles.get();
  },
});

Template.listPrayer.events({
  "click .toggle-article"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");

    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("togglePrayer", data, function (err, res) {
      if (res) {
        location.reload();
      }
      else{
        console.log(err);
      }
    });
  },
  "click .toggle-featured"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("featuredPrayer", data, function (err, res) {
      if (value === true) {
        $("#" + milik).attr("status", true);
        $("#" + milik)
          .removeClass("text-white")
          .addClass("text-orange");
        $("#" + milik).val(true);
      } 
      else {
        $("#" + milik).removeAttr("status");
        $("#" + milik).removeAttr("value");
        $("#" + milik)
          .removeClass("text-orange")
          .addClass("text-white");
      }
    });
  },
  "click #repairDate"(e, t) {
    e.preventDefault();
    const page = "doa";
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("repairDate", page, function (err, res) {
          if (err) {
            failAlert(err);
          } else {
            successAlert("Berhasil");
          }
        });
      }
    });
  },
});

Template.formPrayer.onCreated(function () {
  Tracker.autorun(() => {
    Meteor.subscribe("generalPicList", function () {
      console.log("generalPicList is ready");
    });
  });
  this.pushedLanguage = new ReactiveVar({})
  this.languages = new ReactiveVar([
    {
      id: "01",
      name: "Bahasa Indonesia"
    },
    {
      id: "02",
      name: "Bahasa Inggris"
    },
    {
      id: "03",
      name: "Bahasa Latin"
    },
    {
      id: "04",
      name: "Bahasa Jawa"
    }
  ]);
  this.availability = new ReactiveVar(false);
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar();
  this.editor = new ReactiveVar();
  this.submitType = new ReactiveVar(this.data.submitType);
  this.outlets = new ReactiveVar([]);
  this.articles = new ReactiveVar([]);
  this.listPrayerContent = new ReactiveVar([]);
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      self.outlets.set(res);
    }
  });
  Meteor.call("users-detail", userId, function (err, res) {
    if (!res.outlets) {
      failAlert("Belum memiliki outlet! Silahkan hubungi admin.");
      // history.back();
    }
  });

  self.categories = new ReactiveVar();
  Meteor.call("getCategories", function (error, result) {
    if (result) {
      self.categories.set(result);
    }
  });
});
Template.formPrayer.onRendered(function () {
  const context = Template.instance();
  setTimeout(() => {
    $(".select2").select2({
      width: "100%",
    });
  }, 100);
  if (this.submitType.get() === 2) {
    const id = FlowRouter.current().params._id;
    const self = this;

    Meteor.call("getPrayerById", id, function (err, getPrayer) {
      if (err) {
        history.back();
      } else {
        if (getPrayer) {
          self.articles.set(getPrayer);
          $("#title").val(getPrayer.title);
          $("#slug").val(getPrayer.slug);
          $("#author").val(getPrayer.author);
          $("#excerpt").val(getPrayer.excerpt);
          $("#category").val(getPrayer.category);
          $("#paymentImage").attr("src", getPrayer.imageLink);
          if (getPrayer.languageId){
            const data = {
              id: getPrayer.languageId,
              name: getPrayer.languageName
            }
            self.pushedLanguage.set(data)
          }
          setTimeout(() => {
            getPrayer.outlets.forEach((element) => {
              $("#outlet-" + element).prop("checked", true);
            });
          }, 500);

          initEditor(context, {
            content: getPrayer.content,
          });
          $("#publish-date").val(
            moment(getPrayer.publishDate).format("YYYY-MM-DD").toString()
          );
        } else {
          history.back();
        }
      }
    });

    // Meteor.call('getPrayerById', objectId, function (error, result) {
    //     if (result) {

    //     }else{

    //         history.back()
    //     }
    // })
  } else {
    initEditor(Template.instance());
  }
});
Template.formPrayer.helpers({
  languages(){
    return Template.instance().languages.get()
  },
  pushedLanguage(){
    return Template.instance().pushedLanguage.get()
  },
  outlets() {
    return Template.instance().outlets.get();
  },
  articles() {
    return Template.instance().articles.get();
  },
  availability() {
    return Template.instance().availability.get();
  },
  imageFile() {
    return Template.instance().imageFile.get();
  },
  thisFile() {
    const image = generalPics.findOne({
      _id: Template.instance().imageFile.get(),
    });
    if (self && image) {
      Template.instance().imageDir.set(image);
      return image;
    }
  },
  categories() {
    const allCategories = Template.instance().categories.get();
    const categoriesPrayers = _.filter(allCategories, {
      categoryType: "article",
    });
    return categoriesPrayers;
  },
  listPrayerContent() {
    return Template.instance().listPrayerContent.get();
  },
});
Template.formPrayer.events({
  "change #select-language": function (e, t){
    const _id = e.target.value.split("-")[0]
    const thisLanguage = t.languages.get().find(element => element.id === _id)
    t.pushedLanguage.set(thisLanguage)
  },
  "change #paymentFile": function (e, t) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        console.log(this);
        $("#paymentImage").attr("src", this.result);
      });
      reader.readAsDataURL(file);
    } else {
      $("#paymentImage").attr("src", "#");
    }
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#slug").val(slug);
  },
  "click .cancel"(e, t) {
    history.back();
  },
  "click #submit-form"(e, t) {
    const id = FlowRouter.current().params._id;
    const objectId = new Meteor.Collection.ObjectID(id);
    checkSlug("prayers", {
      editId: objectId,
    }).then((result) => {
      if (result) {
        const article = t.articles.get();
        const paymentFile = $("#paymentFile").prop("files");
        const language = t.pushedLanguage.get()
        const slug = result;
        let author = $("#author").val();
        const publishDate = new Date($("#publish-date").val());
        const title = $("#title").val();
        const excerpt = $("#excerpt").val();
        const category = $("#category").val();
        const outlets = [];
        $(".outlet").each(function (index, element) {
          if ($(element).is(":checked")) {
            outlets.push($(element).val());
          }
        });
        const userId = Meteor.userId();
        Meteor.call("users-detail", userId, async function (err, currentUser) {
          if (err) {
            failAlert(err);
          } else {
            const outletCode = currentUser.outlets[0];
            if (outlets.length < 1) {
              outlets.push(outletCode);
            }
            if (outlets.length > 0) {
              if (author.length == 0) {
                author = Meteor.user().fullname;
              }
              const content = t.editor.get().getData();
              const data = {
                title,
                excerpt,
                author,
                publishDate,
                content,
                languageId: language.id,
                languageName: language.name,
                // contentPaskah: content,
                category,
                status: true,
                outlets,
                createdAt: new Date(),
                createdBy: Meteor.userId(),
                slug,
              };
              if (t.imageFile.get()) {
                data.imageLink = t.imageDir.get().link();
                data.imageId = t.imageFile.get();
              }
              const submitType = t.submitType.get();
              let postRoute = "insertPrayer";
              if (submitType === 2) {
                postRoute = "updatePrayer";
                data.id = FlowRouter.current().params._id;
                // if (paymentFile[0]) {
                //     // console.log(article)
                //     const uploadData = {
                //         type: 'prayers',
                //         fileLink: article.imageLink,
                //         Body: paymentFile[0]
                //     };
                //     console.log(uploadData)
                //     const fileLink = await uploadFiles(uploadData)
                //     data.imageLink = fileLink
                // }
              } else {
                // if (paymentFile[0]) {
                //     const uploadData = {
                //         type: 'prayers',
                //         Body: paymentFile[0]
                //     };
                //     const fileLink = await uploadFiles(uploadData)
                //     data.imageLink = fileLink
                // }
              }
              //   console.log(data);
              Meteor.call(postRoute, data, function (err, res) {
                if (err) {
                  failAlert(err);
                } else {
                  successAlertBack("Data berhasil disimpan");
                }
              });
            } else {
              failAlert("Outlet harus ada minimal satu!");
            }
          }
        });
      }
    });
  },
  "click .remove-image"(event, template) {
    event.preventDefault();
    const fileId = event.target.attributes.buttondata.value.toString();
    template.imageDir.set(undefined);
    template.imageFile.set(undefined);
    Meteor.call("deleteGeneralPic", fileId);
  },
  "click .add-list"(e, t) {
    e.preventDefault();

    const milik = $(e.target).data("milik");

    if (milik == "multi-language") {
      const listPrayerContent = t.listPrayerContent.get();
      const language = $("#label").val();
      const content = t.editor.get().getData();

      const data = {
        language,
        content,
      };
      listPrayerContent.push(data);
      console.log(listPrayerContent);
      t.listPrayerContent.set(listPrayerContent);
    }
  },
});

Template.listPrayersGroup.onCreated(function () {
  this.articles = new ReactiveVar([]);
  datatables(window, $);
});

Template.listPrayersGroup.onRendered(function () {
  setTimeout(() => {
    $("#mytable").DataTable();
  }, 500);
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("users-detail", userId, function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      const outlets = res.outlets;
      Meteor.call("getPrayersGroups", outlets, function (error, result) {
        if (error) {
          failAlert(error);
        } else {
          self.articles.set(result);
        }
      });
    }
  });
});
Template.listPrayersGroup.helpers({
  articles() {
    return Template.instance().articles.get();
  },
});

Template.listPrayersGroup.events({
  "click .delete-prayers"(e, t) {
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call(
          "prayersGroup-delete",
          e.target.id,
          function (err, res) {
            if (err) {
              failAlert(err);
            } else {
              successAlert("Berhasil Menghapus")
              location.reload();
            }
          }
        );
      }
    });
  },
  "click .toggle-article"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");

    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("togglePrayersGroup", data, function (err, res) {
      if (res) {
        location.reload();
      }
    });
  },
  "click .toggle-featured"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    console.log(value);
    console.log(milik);
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("featuredPrayersGroup", data, function (err, res) {
      if (value === true) {
        $("#" + milik).attr("status", true);
        $("#" + milik)
          .removeClass("text-white")
          .addClass("text-orange");
        $("#" + milik).val(true);
      } else {
        $("#" + milik).removeAttr("status");
        $("#" + milik).removeAttr("value");
        $("#" + milik)
          .removeClass("text-orange")
          .addClass("text-white");
      }
    });
  },
  "click #repairDate"(e, t) {
    e.preventDefault();
    const page = "doa";
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("repairDate", page, function (err, res) {
          if (err) {
            failAlert(err);
          } else {
            successAlert("Berhasil");
          }
        });
      }
    });
  },
});

Template.formPrayersGroup.onCreated(function () {
  Tracker.autorun(() => {
    Meteor.subscribe("generalPicList", function () {
      console.log("generalPicList is ready");
    });
  });
  this.availability = new ReactiveVar(false);
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar();
  this.editor = new ReactiveVar();
  this.submitType = new ReactiveVar(this.data.submitType);
  this.outlets = new ReactiveVar([]);
  this.articles = new ReactiveVar([]);
  this.listPrayersGroupContent = new ReactiveVar([]);
  this.pushedPrayers = new ReactiveVar([])
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      self.outlets.set(res);
    }
  });
  Meteor.call("users-detail", userId, function (err, res) {
    if (!res.outlets) {
      failAlert("Belum memiliki outlet! Silahkan hubungi admin.");
      // history.back();
    }
  });

  self.prayers = new ReactiveVar();
  Meteor.call("getPrayers", function (error, result) {
    if (result) {
      _.each(result, function (e, index){
        e._id = e._id.toHexString()
      })
      self.prayers.set(result);
    }
  });
});
Template.formPrayersGroup.onRendered(function () {
  const context = Template.instance();
  setTimeout(() => {
    $(".select2").select2({
      width: "100%",
    });
  }, 100);
  if (this.submitType.get() === 2) {
    const id = FlowRouter.current().params._id;
    const self = this;

    Meteor.call("getPrayersGroupById", id, function (err, getPrayersGroup) {
      if (err) {
        history.back();
      } else {
        if (getPrayersGroup) {
          self.articles.set(getPrayersGroup);
          $("#title").val(getPrayersGroup.name);
          $("#slug").val(getPrayersGroup.slug);
          initEditor(context, {
            content: getPrayersGroup.content,
          });
          setTimeout(() => {
            getPrayersGroup.outlets.forEach((element) => {
              $("#outlet-" + element).prop("checked", true);
            });
          }, 500);
          self.pushedPrayers.set(getPrayersGroup.prayers)
        } else {
          history.back();
        }
      }
    });

    // Meteor.call('getPrayersGroupById', objectId, function (error, result) {
    //     if (result) {

    //     }else{

    //         history.back()
    //     }
    // })
  } else {
    initEditor(Template.instance());
  }
});
Template.formPrayersGroup.helpers({
  pushedPrayers(){
    return Template.instance().pushedPrayers.get()
  },
  outlets() {
    return Template.instance().outlets.get();
  },
  articles() {
    return Template.instance().articles.get();
  },
  availability() {
    return Template.instance().availability.get();
  },
  imageFile() {
    return Template.instance().imageFile.get();
  },
  thisFile() {
    const image = generalPics.findOne({
      _id: Template.instance().imageFile.get(),
    });
    if (self && image) {
      Template.instance().imageDir.set(image);
      return image;
    }
  },
  prayers() {
    return Template.instance().prayers.get();
  },
  listPrayersGroupContent() {
    return Template.instance().listPrayersGroupContent.get();
  },
});
Template.formPrayersGroup.events({
  "change #select-prayers" : function (e, t){
    const pushedPrayers = t.pushedPrayers.get()
    console.log(pushedPrayers)
    const checkedPushedPrayers = pushedPrayers.find(element => element._id === e.target.value )
    if (checkedPushedPrayers){
      failAlert("Doa sudah ada!")
    } else {
      const selectedPrayer = t.prayers.get().find(element=> element._id === e.target.value)
      pushedPrayers.push(selectedPrayer)
      t.pushedPrayers.set(pushedPrayers)
    }
  },
  "click .delete-prayer" : function (e, t){
    const milik = $(e.target).data("milik")
    const pushedPrayers = t.pushedPrayers.get().filter(element => element._id !== milik)
    t.pushedPrayers.set(pushedPrayers)
  },
  "change #paymentFile": function (e, t) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        console.log(this);
        $("#paymentImage").attr("src", this.result);
      });
      reader.readAsDataURL(file);
    } else {
      $("#paymentImage").attr("src", "#");
    }
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#slug").val(slug);
  },
  "click .cancel"(e, t) {
    history.back();
  },
  "click #submit-form"(e, t) {
    const _id = FlowRouter.current().params._id
    const prayers = t.pushedPrayers.get()
    const name = $("#title").val()
    const userId = Meteor.userId();
    checkSlug("prayersGroup", {
      editId: _id,
    }).then((result) => {
      if (result){
        Meteor.call("users-detail", userId, async function (err, currentUser) {
          if (err) {
            failAlert(err);
          } else {
            const outlets = [];
            $(".outlet").each(function (index, element) {
              if ($(element).is(":checked")) {
                outlets.push($(element).val());
              }
            });
            const outletCode = currentUser.outlets[0];
            if (outlets.length < 1) {
              outlets.push(outletCode);
            }
            
            if (outlets.length > 0) {
              const slug = result;
              const data = {
                name,
                prayers,
                slug,
                outlets
              };
              const submitType = t.submitType.get();
              let postRoute = "insertPrayersGroup";
              if (submitType === 2) {
                postRoute = "updatePrayersGroup";
                data.id = FlowRouter.current().params._id;
              }
              Meteor.call(postRoute, data, function (err, res) {
                if (err) {
                  failAlert(err);
                } else {
                  successAlertBack("Data berhasil disimpan");
                }
              });
            } else {
              failAlert("Outlet harus ada minimal satu!");
            }
          }
        });
      } else {
        failAlert("Slug sudah terdaftar!")
      }
    })
  },
  "click .remove-image"(event, template) {
    event.preventDefault();
    const fileId = event.target.attributes.buttondata.value.toString();
    template.imageDir.set(undefined);
    template.imageFile.set(undefined);
    Meteor.call("deleteGeneralPic", fileId);
  },
  "click .add-list"(e, t) {
    e.preventDefault();

    const milik = $(e.target).data("milik");

    if (milik == "multi-language") {
      const listPrayersGroupContent = t.listPrayersGroupContent.get();
      const language = $("#label").val();
      const content = t.editor.get().getData();

      const data = {
        language,
        content,
      };
      listPrayersGroupContent.push(data);
      console.log(listPrayersGroupContent);
      t.listPrayersGroupContent.set(listPrayersGroupContent);
    }
  },
});

Template.uploadPrayer.onCreated(function () {
  const self = this;

  self.dataUploads = new ReactiveVar([]);
  setTimeout(() => {
    $("#mytable").DataTable();
  }, 500);
});

Template.uploadPrayer.helpers({
  dataUploads() {
    console.log(Template.instance().dataUploads.get());
    return Template.instance().dataUploads.get();
  },
});
Template.uploadPrayer.events({
  "click #btn-save"(e, t) {
    loadingAlert();

    Meteor.call("uploadPrayer", t.dataUploads.get(), function (error, result) {
      if (result) {
        successAlert("Berhasil!");
      } 
      else {
        failAlert(error);
        // console.log("error");
        console.log(error);
      }
    });
  },
  "change #input-upload"(e, t) {
    let paramId = FlowRouter.current().params._id;

    Papa.parse(e.target.files[0], {
      header: true,
      dynamicTyping: false,
      delimiter: "\t",
      complete(results, file) {
        // console.log(results);
        const tempArray = [];
        // Field. title - excerpt - content - sumber - content

        for (let index = 0; index < results.data.length; index++) {
          const element = results.data[index];

          const checkObject = isEmptyData(element);
          if (checkObject != 0) {
            element.status = 1;
          }

          element.number = index + 1;
          tempArray.push(element);
        }
        console.log(tempArray);
        t.dataUploads.set(tempArray);
      },
    });
  },
});
