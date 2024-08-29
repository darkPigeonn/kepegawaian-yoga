import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
// import { Article } from "../../../api/alma-v1/db/collections-articles.js";
import { generalPics } from "../../../api/alma-v1/db/collections-files.js";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import datatables from "datatables.net";
import _ from "underscore";
import * as htmlToImage from "html-to-image";
import "./article.html";
// import { Outlet } from "../../../api/alma-v1/db/collections-outlet";
import slugify from "slugify";
import QRCode from 'qrcode';

Template.listArticle.onCreated(function () {
  this.articles = new ReactiveVar([]);
  this.problemList = new ReactiveVar([])
  datatables(window, $);
});

Template.listArticle.onRendered(function () {
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("users-detail", userId, function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      const outlets = res.outlets;
      // console.log(res.outlets);
      Meteor.call("getArticles", outlets, function (error, result) {
        if (error) {
          failAlert(error);
        } else {
          // console.log(result);
          self.articles.set(result);
          setTimeout(() => {
            $("#mytable").DataTable();
          }, 500);
        }
      });
    }
  });
});

Template.listArticle.helpers({
  articles() {
    return Template.instance().articles.get();
  },
  problemList(){
    return Template.instance().problemList.get()
  },
  isInRoles(roles) {
    return isInRoles(roles);
  }
});

Template.listArticle.events({
  "click .toggle-article"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");

    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("toggleArticle", data, function (err, res) {
      if (res) {
        location.reload();
      }
      else{
        console.log(err);
      }
    });
  },
  "click #migratePartner"(e, t) {
    e.preventDefault();
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("articles-migratePartners", function (err, res) {
          if (res) {
            successAlert("Berhasil Migrasi Partner")
            t.problemList.set(res)
            // location.reload();
          }
          else{
            console.log(err);
          }
        });
      }
    });
  },
  "click #migrateHostName"(e, t) {
    e.preventDefault();
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("articles-migrateHostName", function (err, res) {
          if (res) {
            successAlert("Berhasil Migrasi Host Name")
            t.problemList.set(res)
            // location.reload();
          }
          else{
            console.log(err);
          }
        });
      }
    });
  },
  "click .delete-article"(e, t) {
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call(
          "article-delete",
          e.target.id,
          function (err, res) {
            if (err) {
              failAlert(err);
              location.reload();
            } else {
              location.reload();
            }
          }
        );
      }
    });
  },
  "click .toggle-featured"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    // console.log(value);
    // console.log(milik);
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("featuredArticle", data, function (err, res) {
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
    const page = "article";
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("repairDate", page, function (err, res) {
          if (err) {
            console.log(err);
            failAlert(err);
          } else {
            successAlert("Berhasil");
          }
        });
      }
    });
  },
  'click #openModalBtn'(e, t) {
    const listData = t.articles.get();

    const slug = $(e.target).data("milik")
    const thisData = _.find(listData, function (x) {
      return x.slug == slug;
    })
    // console.log(thisData);


    const modal = document.getElementById('myModal');
    const canvas = document.getElementById("canvas");
        if (canvas) {
          // console.log(result2)
          QRCode.toDataURL(canvas, `https://seminarigarum.sch.id/vecum-fest/${slug}`, {
            width: 360,
            margin: 2,
          })
            .then((url) => {
              // console.log(url);
            })
            .catch((err) => {
              console.error(err);
            });
        }
        const fullNameElement = document.getElementById('fullName');
        fullNameElement.textContent = thisData.title;
    modal.style.display = 'block';
  },
  "click #download"(e, t) {
    e.preventDefault();
    const fullNameElement = document.getElementById('fullName');
    let filename = 'barcode-'+fullNameElement.textContent + ".png";

    htmlToImage
      .toBlob(document.getElementById("boarding-pass"), {

      })
      .then(function (dataUrl) {
        saveAs(dataUrl, filename);
      });
  },
  'click .close'(e, t) {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  },
});

Template.formArticle.onCreated(function () {
  Tracker.autorun(() => {
    Meteor.subscribe("generalPicList", function () {
      console.log("generalPicList is ready");
    });
  });
  const self = this;
  self.logo = new ReactiveVar()
  self.availability = new ReactiveVar(false);
  self.partners = new ReactiveVar([]);
  self.currentUpload = new ReactiveVar(false);
  self.imageFile = new ReactiveVar();
  self.imageDir = new ReactiveVar();
  self.editor = new ReactiveVar();
  self.submitType = new ReactiveVar(self.data.submitType);
  self.outlets = new ReactiveVar([]);
  self.articles = new ReactiveVar([]);
  self.selectedPartner = new ReactiveVar();
  const id = FlowRouter.current().params._id;
  // const id = Router.current().params._id;
  const userId = Meteor.userId();

  self.documentFiles = new ReactiveVar([]);

  // console.log(userId);

  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      self.outlets.set(res);
    }
    else{
      console.log(err);
    }
  });
  Meteor.call("partners-getAll", function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      const partners = res;
      const pushedPartners = [];
      Meteor.call("users-detail", userId, function (err, res) {
        if (err) {
          failAlert(err);
        } else {

          partners.forEach((partner) => {
            res.partners.forEach((userPartner) => {
              if (userPartner === partner.code) {
                pushedPartners.push(partner);
              }
            });
          });

          self.partners.set(pushedPartners);
          if (pushedPartners.length === 1){
            self.selectedPartner.set(pushedPartners[0])
          }
          Meteor.call("article-details", id, function (err, getNews) {
            if (getNews) {
              self.selectedPartner.set(pushedPartners.find(element => element.code === getNews.partners))
            }
          });
        }
      });
    }
  });

  self.categories = new ReactiveVar();
  Meteor.call("getCategories", function (error, result) {
    if (result) {
      // console.log(result);
      self.categories.set(result);
    }
    else{
      console.log(error);
    }
  });
});

Template.formArticle.onRendered(function () {
  const context = Template.instance();
  setTimeout(() => {
    $(".select2").select2({
      width: "100%",
    });
  }, 100);
  if (this.submitType.get() === 2) {
    const id = FlowRouter.current().params._id;
    const self = this;

    Meteor.call("article-details", id, function (err, getArticle) {
      if (err) {
        // console.log(err);
        history.back();
      } else {
        if (getArticle) {
          self.articles.set(getArticle);
          $("#title").val(getArticle.title);
          $("#slug").val(getArticle.slug);
          $("#author").val(getArticle.author);
          $("#excerpt").val(getArticle.excerpt);
          $("#category").val(getArticle.category);
          $('#logoImage').attr('src', getArticle.imageLink)
          setTimeout(() => {
            getArticle.outlets.forEach((element) => {
              $("#outlet-" + element).prop("checked", true);
            });
          }, 500);
          initEditor(context, {
            content: getArticle.content,
          });
          $("#publish-date").val(
            moment(getArticle.publishDate).format("YYYY-MM-DD").toString()
          );
        } else {
          console.log(err);
          // history.back();
        }
      }
    });
  } else {
    initEditor(Template.instance());
  }
});
Template.formArticle.helpers({
  selectedPartner() {
    return Template.instance().selectedPartner.get()
  },
  logo (){
    return Template.instance().logo.get();
  },
  partners() {
    return Template.instance().partners.get();
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
    const categoriesArticles = _.filter(allCategories, {
      categoryType: "article",
    });
    return categoriesArticles;
  },
  documentFiles() {
    return Template.instance().documentFiles.get();
  },
  isInRoles(roles) {
    return isInRoles(roles);
  }
});
Template.formArticle.events({
  "change #select-partner" (e, t){
    t.selectedPartner.set(t.partners.get().find(element => element.code === e.target.value))
  },
  'change .input-logoFile'(e, t) {
    e.preventDefault();
    const file = e.target.files[0]
    if (file) {
      // console.log(file)
      t.logo.set(file);
      const reader = new FileReader()
      reader.addEventListener('load', function () {
        $('#logoImage').attr('src', this.result)
      });
      reader.readAsDataURL(file);
    }
    else {
      $('#logoImage').attr('src', '#')
    }
  },
  "change #paymentFile": function (e, t) {
    // const file = e.target.files[0];
    const documentFiles = t.documentFiles.get();

    const files = $("#paymentFile").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
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

    // for (let index = 0; index < files.length; index++) {
    //   const file = files[index];
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.addEventListener("load", function () {
    //       $("#paymentImage").attr("src", this.result);
    //     });
    //     reader.readAsDataURL(file);
    //   } else {
    //     $("#paymentImage").attr("src", "#");
    //   }
    // }
  },
  "click .remove-paymentFile": function (e, t) {
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
    $("#slug").val(slug);
  },
  "click .cancel"(e, t) {
    history.back();
  },
  "click #submit-form"(e, t) {
    const id = FlowRouter.current().params._id;
    // const id = Router.current().params._id;
    const objectId = new Meteor.Collection.ObjectID(id);
    const article = t.articles.get();
    checkSlug("articles", {
      editId: objectId,
    }).then((result) => {
      if (result) {
        if (checkValid(t.selectedPartner.get())){
          const partners = t.selectedPartner.get().code
          const slug = result;
          let author = $("#author").val();
          const publishDate = new Date($("#publish-date").val());
          const title = $("#title").val();
          const excerpt = $("#excerpt").val();
          const category = $("#category").val();
          const hostName = "https://my.imavi.org"
          let originalUrl = hostName + "/articles/" + slug;
          if (t.selectedPartner.get().hostName){
            originalUrl = t.selectedPartner.get().hostName+ "/articles/"+slug
          }
          const outlets = [];
          const logo = t.logo.get()
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
                  category,
                  originalUrl,
                  status: true,
                  outlets,
                  partners,
                  createdAt: new Date(),
                  createdBy: Meteor.userId(),
                  slug,
                };
                const submitType = t.submitType.get();
                let postRoute = "insertArticle";
                if (submitType === 2) {
                  postRoute = "updateArticle";
                  data.id = FlowRouter.current().params._id;
                }

                if (logo) {
                  const uploadData = {
                    type: 'articles',
                    Body: logo
                  };
                  const fileLink = await uploadFiles(uploadData)
                  data.imageLink = fileLink
                }

                Meteor.call(postRoute, data, async function (err, res) {
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
        else {
          failAlert("Partner harus diisi!")
        }

      }
    });
  },
  // "click .remove-image"(event, template) {
  //   event.preventDefault();
  //   const fileId = event.target.attributes.buttondata.value.toString();
  //   template.imageDir.set(undefined);
  //   template.imageFile.set(undefined);
  //   Meteor.call("deleteGeneralPic", fileId);
  // },
});

Template.createArticle.helpers({
  isInRoles(roles) {
    return isInRoles(roles);
  }
});
Template.editArticle.helpers({
  isInRoles(roles) {
    return isInRoles(roles);
  }
});