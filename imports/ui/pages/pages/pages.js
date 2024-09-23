import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { generalPics } from "../../../api/alma-v1/db/collections-files.js";
import _ from "underscore";
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic/build/ckeditor';
import slugify from "slugify";
import datatables from "datatables.net";
import "./pages.html";
import { Page } from "../../../api/alma-v1/db/collections-pages";
import { Outlet } from "../../../api/alma-v1/db/collections-outlet";

Template.listPage.onCreated(function () {
  const self = this;
  self.pages = new ReactiveVar();
  Meteor.call("pages.getAll", function (err, res) {
    if (err) {
    } else {
      self.pages.set(res);
    }
  });
  datatables(window, $);
});

Template.listPage.onRendered(function () {
  setTimeout(() => {
    $("#mytable").DataTable();
  }, 500);
});

Template.listPage.helpers({
  pages() {
    return Template.instance().pages.get();
  },
});

Template.listPage.events({
  "click .toggle"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");

    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("togglePage", data, function (err, res) {
      if (res) {
        location.reload();
      }
    });
  },
});

Template.createPage.onCreated(function () {
  const self = this;
  self.currentUpload = new ReactiveVar(false);
  self.imageFile = new ReactiveVar();
  self.imageDir = new ReactiveVar();
  self.editor = new ReactiveVar();
  let tempOutlet = Outlet.find().fetch();
  self.outlets = new ReactiveVar(tempOutlet);
  self.documentFiles = new ReactiveVar([]);
  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      self.outlets.set(res);
    }
  });
});

Template.createPage.helpers({
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
  outlets() {
    return Template.instance().outlets.get();
  },
  documentFiles() {
    return Template.instance().documentFiles.get();
  },
});

Template.createPage.onRendered(function () {
  initEditor(Template.instance());
});

Template.createPage.events({
  "click #insert": async function (e, t) {
    checkSlug("pages", {
      inputId: "code",
      dbField: "code",
    }).then(async (result) => {
      if (result) {
        const code = result;
        const title = $("#title").val();
        const content = t.editor.get().getData();
        let files = t.documentFiles.get();
        const data = {
          title,
          content,
          status: true,
          createdBy: Meteor.userId(),
          createdAt: new Date(),
          code,
        };
        // if (t.imageFile.get()) {
        //   data.imageLink = t.imageDir.get().link()
        //   data.imageId = t.imageFile.get()
        // }
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
            data.outlets = outlets;

            const fileDocument = [];
            console.log(files);
            if (files.length > 0) {
              for (let index = 0; index < files.length; index++) {
                const element = files[index].file;
                console.log(element.name);
                if (element.name) {
                  const uploadData = {
                    type: "dokumenOrganisasi",
                    Body: element,
                  };
                  const fileLink = await uploadFiles(uploadData);
                  fileDocument.push(fileLink);
                } else {
                  fileDocument.push(element);
                }
              }

              data.imageLink = fileDocument;
            }

            console.log(data);

            if (outlets.length > 0) {
              Meteor.call("insertPage", data, function (err, res) {
                if (err) {
                  failAlert(err);
                  exitLoading(false);
                } else {
                  exitLoading(true);
                  successAlertBack();
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
  "change #documentFiles": function (e, t) {
    const documentFiles = t.documentFiles.get();
    // const file = e.target.files[0];
    const files = $("#documentFiles").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      console.log(file);
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (
            file.type != ".jpg" ||
            file.type != ".jpeg" ||
            file.type != ".png"
          ) {
            $(`#documentFiles-${documentFiles.length - 1}`).attr(
              "href",
              this.result
            );
          }
        });
        reader.readAsDataURL(file);
        documentFiles.push(body);
        t.documentFiles.set(documentFiles);
      }
    }
  },
  "click .remove-documentFiles": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const documentFiles = t.documentFiles.get();
    documentFiles.splice(parseInt(index), 1);
    t.documentFiles.set(documentFiles);
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#code").val(slug);
  },
});

Template.editPage.onCreated(function () {
  const param = Router.current().params._id;
  const self = this;
  let temppage = Page.findOne({ _id: param });
  if (!temppage) {
    temppage = Page.findOne({ _id: new Meteor.Collection.ObjectID(param) });
    if (!temppage) {
      history.back();
    }
  }
  if (temppage) {
    self.availability = new ReactiveVar(true);
    self.editor = new ReactiveVar();
    self.page = new ReactiveVar(temppage);
    self.currentUpload = new ReactiveVar(false);
    self.imageFile = new ReactiveVar();
    if (temppage.imageId) {
      self.imageFile.set(temppage.imageId);
    }
    self.imageDir = new ReactiveVar();
    let tempOutlet = Outlet.find().fetch();
    self.outlets = new ReactiveVar();
    const userId = Meteor.userId();
    Meteor.call("getAllOutlets", function (err, res) {
      if (res) {
        self.outlets.set(res);
      }
    });
    Meteor.call("users-detail", userId, function (err, res) {
      if (err) {
        failAlert(err);
      } else {
        if (!res.outlets) {
          failAlert("Belum memiliki outlet, silahkan hubungi Admin.");
          history.back();
        }
      }
    });
  }
});

Template.editPage.onRendered(function () {
  const data = this.page.get();
  setTimeout(() => {
    data.outlets.forEach((element) => {
      $("#outlet-" + element).prop("checked", true);
    });
  }, 500);
  initEditor(Template.instance(), {
    content: data.content,
  });
});

Template.editPage.helpers({
  outlets() {
    return Template.instance().outlets.get();
  },
  page() {
    return Template.instance().page.get();
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
});

Template.editPage.events({
  "click #save"(e, t) {
    const id = Router.current().params._id;
    checkSlug("pages", {
      editId: id,
      inputId: "code",
      dbField: "code",
    }).then((result) => {
      if (result) {
        const code = result;
        const title = $("#title").val();
        const content = t.editor.get().getData();
        const data = {
          id,
          title,
          content,
          code,
        };
        if (t.imageFile.get()) {
          data.imageLink = t.imageDir.get().link();
          data.imageId = t.imageFile.get();
        } else {
          data.imageLink = "";
          data.imageId = "";
        }
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
            data.outlets = outlets;
            if (outlets.length > 0) {
              Meteor.call("updatePage", data, function (err, res) {
                if (err) {
                  failAlert(err);
                  exitLoading(false);
                } else {
                  exitLoading(true);
                  successAlertBack();
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
  "change #uploadImage": function (event, template) {
    event.preventDefault();
    const checkFile = event.currentTarget.files;

    if (checkFile && checkFile.length > 0) {
      template.currentUpload.set(checkFile);

      _.each(checkFile, function (file) {
        const upload = generalPics.insert(
          {
            file: file,
            streams: "dynamic",
            chunkSize: "dynamic",
          },
          false
        );

        upload.on("start", function () {});

        upload.on("end", function (error, fileObj) {
          if (error) {
            console.log(error);
            exitLoading(false);
          } else {
            exitLoading(true);
          }
          const fileId = fileObj._id;
          alert(fileId);
          template.imageFile.set(fileId);
        });

        upload.start();
      });
      template.currentUpload.set(false);
    }
  },
  "click .remove-image"(event, template) {
    event.preventDefault();
    const fileId = event.target.attributes.buttondata.value.toString();
    template.imageDir.set(undefined);
    template.imageFile.set(undefined);
    Meteor.call("deleteGeneralPic", fileId);
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#code").val(slug);
  },
});
