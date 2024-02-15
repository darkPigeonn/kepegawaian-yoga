import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
// import { News } from "../../../api/alma-v1/db/collections-news";
import _ from "underscore";
import datatables from "datatables.net";
import Swal from "sweetalert2"
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./news.html";
import { Random } from "meteor/random";
// import { Outlet } from "../../../api/alma-v1/db/collections-outlet";
import { generalPics } from "../../../api/alma-v1/db/collections-files.js";
import slugify from "slugify";

Template.listNews.onCreated(function () {
  this.outlets = new ReactiveVar();
  this.news = new ReactiveVar([]);
  this.partners = new ReactiveVar([]);
  this.problemList = new ReactiveVar([]);
  this.filterMode = new ReactiveVar("1");
  datatables(window, $);
});

Template.listNews.onRendered(function () {
  const userId = Meteor.userId();
  const self = this;
  enterLoading()
  const loadingData = Swal.fire({
    title: "Loading",
    text: "Sedang mengambil data",
    showConfirmButton: false,
    allowOutsideClick: false,
  });
  Meteor.call("partners-getAll", function (err, res) {
    if (err) {
      failAlert(err);
      exitLoading()
      loadingData.close()
    } else {
      self.partners.set(res);
    }
  });
  Meteor.call("users-detail", userId, function (err, res) {
    if (err) {
      failAlert(err);
      exitLoading()
      loadingData.close()
    } else {
      const outlets = res.outlets;
      self.outlets.set(outlets);
      Meteor.call("getNews", outlets, function (error, result) {
        if (error) {
          failAlert(error);
        } else {
          self.news.set(result);
          setTimeout(() => {
              $('#myTable').DataTable();
          }, 500);
          exitLoading();
          loadingData.close();
        }
      });
    }
  });
  
});

Template.listNews.helpers({
  news() {
    return Template.instance().news.get();
  },
  partners() {
    return Template.instance().partners.get();
  },
  problemList(){
    return Template.instance().problemList.get()
  },
  filterMode() {
    return Template.instance().filterMode.get();
  },
});

Template.listNews.events({
  "click #migratePartner"(e, t) {
    e.preventDefault();
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("news-migratePartners", function (err, res) {
          if (res) {
            successAlert("Berhasil Migrasi Partner")
            t.problemList.set(res)
            // location.reload();
          }
        });
      }
    });
  },
  "click #migrateHostName"(e, t) {
    e.preventDefault();
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call("news-migrateHostName", function (err, res) {
          if (res) {
            successAlert("Berhasil Migrasi Host Name")
            t.problemList.set(res)
            // location.reload();
          }
        });
      }
    });
  },
  "change #select-partner"(e, t) {
    const outlets = e.target.value;
    Meteor.call("getNewsFiltered", outlets, function (error, result) {
      if (error) {
        failAlert(error);
      } else {
        t.news.set(result);
      }
    });
  },
  "click .delete-news"(e, t) {
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call(
          "news-delete",
          e.target.id,
          t.outlets.get(),
          function (err, res) {
            if (err) {
              failAlert(err);
            } else {
              t.news.set(res);
              location.reload();
            }
          }
        );
      }
    });
  },
  "click .toggle-news"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("toggleNews", data, function (err, res) {
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
    // console.log(milik);
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("featuredNews", data, function (err, res) {
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
    const page = "news";
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
  "click .btn-filter"(e, t){
    let filterMode = t.filterMode.get();
    if (filterMode == 1) {
        t.filterMode.set("2");
    }
    else if(filterMode == 2){
        t.filterMode.set("1");
    }
  }
});

Template.listNewsCuration.onCreated(function () {
  this.outlets = new ReactiveVar();
  this.news = new ReactiveVar([]);
  this.partners = new ReactiveVar([]);
    this.filterMode = new ReactiveVar("1");

  datatables(window, $);
});

Template.listNewsCuration.onRendered(function () {
  const userId = Meteor.userId();
  const self = this;
  Meteor.call("partners-getAll", function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      self.partners.set(res);
    }
  });
  Meteor.call("users-detail", userId, function (err, res) {
    if (err) {
      failAlert(err);
    } else {
      const outlets = res.outlets;
      // console.log(outlets);
      self.outlets.set(outlets);
      Meteor.call("getNewsCuration", outlets, function (error, result) {
        if (error) {
          console.log(error);
          failAlert(error);
        } else {
          // console.log(result);
          const news = result.filter(
            (element) =>
              (element.curatorId === res._id && element.curationStatus > 10) ||
              element.curationStatus === 10
          );
          self.news.set(news);
          setTimeout(() => {
            $('#myTable').DataTable();
          }, 500);
        }
      });
    }
  });
});

Template.listNewsCuration.helpers({
  news() {
    return Template.instance().news.get();
  },
  partners() {
    return Template.instance().partners.get();
  },
  filterMode() {
    return Template.instance().filterMode.get();
  },
});

Template.listNewsCuration.events({
  "change #select-partner"(e, t) {
    const outlets = e.target.value;
    Meteor.call("getNewsCuration", outlets, function (error, result) {
      if (error) {
        failAlert(error);
      } else {
        t.news.set(result);
      }
    });
  },
  "click .delete-news"(e, t) {
    confirmationAlertAsync().then(function (result) {
      if (result.value) {
        Meteor.call(
          "news-delete",
          e.target.id,
          t.outlets.get(),
          function (err, res) {
            if (err) {
              failAlert(err);
            } else {
              t.news.set(res);
              location.reload();
            }
          }
        );
      }
    });
  },
  "click .toggle-news"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("toggleNews", data, function (err, res) {
      if (res) {
        location.reload();
      }
    });
  },
  "click .toggle-featured"(e, t) {
    let value = $(e.target).attr("status");
    let milik = $(e.target).attr("milik");
    // console.log(milik);
    value = !value;
    let data = {
      id: milik,
      status: value,
    };
    Meteor.call("featuredNews", data, function (err, res) {
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
  "click .btn-filter"(e, t){
    let filterMode = t.filterMode.get();
    if (filterMode == 1) {
        t.filterMode.set("2");
    }
    else if(filterMode == 2){
        t.filterMode.set("1");
    }
  }
});

Template.formNews.onCreated(function () {
  Tracker.autorun(() => {
    Meteor.subscribe("generalPicList", function () {
      console.log("generalPicList is ready");
    });
  });
  this.assetsFile  = new ReactiveVar([]);
  this.logo = new ReactiveVar();
  this.partners = new ReactiveVar([]);
  this.availability = new ReactiveVar(false);
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar();
  this.editor = new ReactiveVar();
  this.submitType = new ReactiveVar(this.data.submitType);
  this.outlets = new ReactiveVar([]);
  this.news = new ReactiveVar();
  this.documentFiles = new ReactiveVar([]);
  this.selectedPartner = new ReactiveVar();

  const userId = Meteor.userId();
  const self = this;
  const id = FlowRouter.current().params._id;
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
          Meteor.call("news-details", id, function (err, getNews) {
            if (getNews) {
              self.selectedPartner.set(pushedPartners.find(element => element.code === getNews.partners))
            }
          });
        }
      });
    }
  });
  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      let outlets = res;
      if (self.submitType.get() === 3) {
        Meteor.call("news-details", id, function (err, getNews) {
          if (getNews) {
            outlets = outlets.filter(
              (element) => element.code !== getNews.outlets[0]
            );
            self.outlets.set(outlets);
          }
        });
      } else {
        self.outlets.set(res);
      }
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
Template.formNews.onRendered(function () {
  const context = this;
  setTimeout(() => {
    $(".select2").select2({
      width: "100%",
    });
  }, 100);
  if (this.submitType.get() === 2 || this.submitType.get() === 3) {
    const id = FlowRouter.current().params._id;

    Meteor.call("news-details", id, function (err, getNews) {
      if (getNews) {
        $("#title").val(getNews.title);
        $("#slug").val(getNews.slug);
        $("#author").val(getNews.author);
        $("#excerpt").val(getNews.excerpt);
        $("#category").val(getNews.category);
        $("#partner").html(getNews.partners);
        $('#logoImage').attr('src', getNews.imageLink)
        context.assetsFile.set(getNews.fileLink)
        initEditor(context, {
          content: getNews.content,
        });
        $("#publish-date").val(
          moment(getNews.publishDate).format("YYYY-MM-DD").toString()
        );
        setTimeout(() => {
          getNews.outlets.forEach((element) => {
            $("#outlet-" + element).prop("checked", true);
          });
        }, 500);
        context.news.set(getNews);
      } else {
        console.log(err);
        history.back();
      }
    });
  } else {
    initEditor(Template.instance());
  }
});
Template.formNews.helpers({
  selectedPartner(){
    return Template.instance().selectedPartner.get()
  },
  partners() {
    return Template.instance().partners.get();
  },
  outlets() {
    return Template.instance().outlets.get();
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
  submitType() {
    return Template.instance().submitType.get();
  },
  categories() {
    const allCategories = Template.instance().categories.get();
    const categoriesArticles = _.filter(allCategories, {
      categoryType: "news",
    });
    return categoriesArticles;
  },
  documentFiles() {
    return Template.instance().documentFiles.get();
  },
  logo() {
    return Template.instance().logo.get();
  }
});
Template.formNews.events({
  "click .remove-assetsFile": function (e, t) {
    e.preventDefault();
    const index = $(e.target).attr("milik");
    const assetsFile = t.assetsFile.get();
    assetsFile.splice(parseInt(index), 1);
    t.assetsFile.set(assetsFile);
  },
  "change #assetsFile": function (e, t) {
    const assetsFile = t.assetsFile.get();
    // console.log(assetsFile);
    const files = $("#assetsFile").prop("files");
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      // console.log(file);
      if (file) {
        const reader = new FileReader();
        const body = {
          file: file,
        };
        reader.addEventListener("load", function () {
          body.src = this.result;
          if (file.type !== "image/jpeg" && file.type !== "image/jpg" && file.type !== "image/png" && file.type !== "image/gif") {
            $(`#assetsFile-${assetsFile.length - 1}`).attr("href", this.result);
          } else {
            $(`#assetsFile-${assetsFile.length - 1}`).attr("src", this.result);
          }
        });
        reader.readAsDataURL(file);
        assetsFile.push(body);
        t.assetsFile.set(assetsFile);
      }
    }
  },
  "change #select-partner" (e, t){
    t.selectedPartner.set(t.partners.get().find(element => element.code === e.target.value))
  },
  "change .input-logoFile"(e, t) {
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
  "click #accept-curation"(e, t) {
    const news = t.news.get();
    news.status = "terima";
    Meteor.call("curateNews", news, function (err, res) {
      if (err) {
        failAlert(err);
      } else {
        successAlertBack("Berhasil Mengajukan Kurasi");
      }
    });
  },
  "click #decline-curation"(e, t) {
    const news = t.news.get();
    news.status = "tolak";
    Meteor.call("curateNews", news, function (err, res) {
      if (err) {
        failAlert(err);
      } else {
        successAlertBack("Berhasil Mengajukan Kurasi");
      }
    });
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#slug").val(slug);
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
          $(`#documentFiles-${documentFiles.length - 1}`).attr(
            "href",
            this.result
          );
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
  "click .cancel"(e, t) {
    history.back();
  },
  "click #submit-form"(e, t) {
    const id = FlowRouter.current().params._id;
    const objectId = new Meteor.Collection.ObjectID(id);
    checkSlug("news", {
      editId: objectId,
    }).then(async (result) => {
      if (result) {
        if (checkValid(t.selectedPartner.get())){
          const logo = t.logo.get()
          const files = t.assetsFile.get();
          const partners = t.selectedPartner.get().code
          const slug = result;
          let author = $("#author").val();
          const publishDate = new Date($("#publish-date").val());
          const title = $("#title").val();
          const excerpt = $("#excerpt").val();
          const category = $("#category").val();
          const hostName = "https://my.imavi.org"
          let originalUrl = hostName + "/news/" + slug;
          if (t.selectedPartner.get().hostName){
            originalUrl = t.selectedPartner.get().hostName+ "/news/"+slug
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

              if (outlets.length > 0) {
                if (author.length == 0) {
                  author = Meteor.user().fullname;
                }
                const content = t.editor.get().getData();
                const data = {
                  title,
                  originalUrl,
                  excerpt,
                  author,
                  publishDate,
                  partners,
                  content,
                  category,
                  status: true,
                  outlets,
                  createdAt: new Date(),
                  createdBy: Meteor.userId(),
                  slug,
                };
                const fileLink = []
                if (files) {
                  for (const [index, document] of files.entries()) {
                    if (!document.file) {
                      fileLink.push(document);
                    } else {
                      const uploadData = {
                        // 'code' dibawah ini entah darimana, error gara-gara ini.
                        // type: "newsFile-" + code + "-" + index,

                        // Utk encounter error, sementara pake random id aja
                        type: "newsFile-" + Random.id(10) + "-" + index,
                        Body: document.file,
                      };
                      const upload = await uploadFiles(uploadData);
                      fileLink.push(upload);
                    }
                  }
                  data.fileLink = fileLink;
                }

                const submitType = t.submitType.get();
                let postRoute = "insertNews";
                if (submitType === 2) {
                  postRoute = "updateNews";
                  data.id = FlowRouter.current().params._id;
                }
        
                if (logo) {
                  const uploadData = {
                    type: 'news',
                    Body: logo
                  };
                  const fileLink = await uploadFiles(uploadData)
                  data.imageLink = fileLink
                }
                
                Meteor.call(postRoute, data, async function (err, res) {
                  if (err) {
                    failAlert(err);
                  } 
                  else {
                    successAlertBack("Data berhasil disimpan");
                  }
                });
              } else {
                failAlert("Outlet harus ada minimal satu!");
              }
            }
          });
        } else {
          failAlert("Partner harus diisi!")
        }
      } 
    });
  },
  "click #curate"(e, t) {
    const news = t.news.get();
    if (news.curationStatus) {
      failAlert("Berita Sudah pernah diajukan");
      history.back();
    } else {
      Meteor.call("curateNews", news, function (err, res) {
        if (err) {
          failAlert(err);
        } else {
          successAlertBack("Berhasil Mengajukan Kurasi");
        }
      });
    }
  },
  // 'click .remove-image'(event, template) {
  //   event.preventDefault()
  //   const fileId = event.target.attributes.buttondata.value.toString();
  //   template.imageDir.set(undefined)
  //   template.imageFile.set(undefined)
  //   Meteor.call('deleteGeneralPic', fileId);
  // },
});

Template.newsDetail.onCreated(function () {
  Tracker.autorun(() => {
    Meteor.subscribe("generalPicList", function () {
      console.log("generalPicList is ready");
    });
  });
  this.partners = new ReactiveVar([]);
  this.availability = new ReactiveVar(false);
  this.currentUpload = new ReactiveVar(false);
  this.imageFile = new ReactiveVar();
  this.imageDir = new ReactiveVar();
  this.editor = new ReactiveVar();
  this.outlets = new ReactiveVar([]);
  this.confirmation = new ReactiveVar(1);
  this.news = new ReactiveVar();
  const userId = Meteor.userId();
  const self = this;
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
        }
      });
    }
  });
  const id = FlowRouter.current().params._id;
  Meteor.call("getAllOutlets", function (err, res) {
    if (res) {
      self.outlets.set(res);
    }
  });
  self.categories = new ReactiveVar();
  Meteor.call("getCategories", function (error, result) {
    if (result) {
      self.categories.set(result);
    }
  });
});
Template.newsDetail.onRendered(function () {
  const context = this;
  setTimeout(() => {
    $(".select2").select2({
      width: "100%",
    });
  }, 100);
  const id = FlowRouter.current().params._id;
  Meteor.call("news-details", id, function (err, getNews) {
    if (getNews) {
      $("#title").html(getNews.title);
      $("#slug").html(getNews.slug);
      $("#author").html(getNews.author);
      $("#excerpt").html(getNews.excerpt);
      $("#category").html(getNews.category);
      $("#partner").html(getNews.partners);
      $("#paymentImage").attr("src", getNews.imageLink);
      initEditor(context, {
        content: getNews.content,
      });
      $("#publish-date").html(
        moment(getNews.publishDate).format("YYYY-MM-DD").toString()
      );
      setTimeout(() => {
        $("#outlet-" + getNews.outlets[0]).attr("disabled", true);
        getNews.outlets.forEach((element) => {
          $("#outlet-" + element).prop("checked", true);
        });
      }, 500);
      context.news.set(getNews);
    } else {
      history.back();
    }
  });

  // Meteor.call('getArticleById', objectId, function (error, result) {
  //     if (result) {

  //     }else{

  //         history.back()
  //     }
  // })
});
Template.newsDetail.helpers({
  confirmation() {
    return Template.instance().confirmation.get();
  },
  partners() {
    return Template.instance().partners.get();
  },
  outlets() {
    return Template.instance().outlets.get();
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
  thisNews() {
    return Template.instance().news.get();
  },
  categories() {
    const allCategories = Template.instance().categories.get();
    const categoriesArticles = _.filter(allCategories, {
      categoryType: "news",
    });
    return categoriesArticles;
  },
});
Template.newsDetail.events({
  "click .confirm-btn"(e, t) {
    e.preventDefault();
    const idx = $(e.target).data("milik");
    t.confirmation.set(parseInt(idx));
    const id = FlowRouter.current().params._id;
    Meteor.call("news-details", id, function (err, getNews) {
      if (getNews) {
        setTimeout(() => {
          $("#outlet-" + getNews.outlets[0]).attr("disabled", true);
          getNews.outlets.forEach((element) => {
            $("#outlet-" + element).prop("checked", true);
          });
        }, 500);
      }
    });
  },
  "click #accept-curation"(e, t) {
    e.preventDefault();
    const news = t.news.get();
    const outlets = news.outlets;
    $(".outlet").each(function (index, element) {
      if ($(element).is(":checked") && news.outlets[0] !== element) {
        outlets.push($(element).val());
      }
    });
    news.status = "terima";
    Meteor.call("curateNews", news, function (err, res) {
      if (err) {
        failAlert(err);
      } else {
        successAlertBack("Berhasil Mengajukan Kurasi");
      }
    });
  },
  "click #cancel-curation"(e, t) {
    e.preventDefault();
    t.confirmation.set(1);
  },
  "click #decline-curation"(e, t) {
    e.preventDefault();
    const news = t.news.get();
    news.status = "tolak";
    news.declineReason = $("#reason").val();
    Meteor.call("curateNews", news, function (err, res) {
      if (err) {
        failAlert(err);
      } else {
        successAlertBack("Berhasil Menolak Kurasi");
      }
    });
  },
  "input #title"(e, t) {
    const value = e.target.value;
    const slug = slugify(value, {
      lower: true,
      strict: true,
    });
    $("#slug").val(slug);
  },
  "change #paymentFile": function (e, t) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        $("#paymentImage").attr("src", this.result);
      });
      reader.readAsDataURL(file);
    } else {
      $("#paymentImage").attr("src", "#");
    }
  },
  "click .cancel"(e, t) {
    history.back();
  },
  // "click #submit-form"(e, t) {
  //   const id = FlowRouter.current().params._id;
  //   const objectId = new Meteor.Collection.ObjectID(id);
  //   checkSlug("articles", {
  //     editId: objectId,
  //   }).then(async (result) => {
  //     if (result) {
  //       const news = t.news.get();
  //       const partners = $("#select-partner").val();
  //       const slug = result;
  //       let author = $("#author").val();
  //       const publishDate = new Date($("#publish-date").val());
  //       const paymentFile = $("#paymentFile").prop("files");
  //       const title = $("#title").val();
  //       const excerpt = $("#excerpt").val();
  //       const category = $("#category").val();
  //       const hostName = t.partners
  //         .get()
  //         .find((element) => element.code === partners).hostName;
  //       const originalUrl = hostName + "/news/" + slug;
  //       if (t.partners.)
  //       const outlets = [];
  //       $(".outlet").each(function (index, element) {
  //         if ($(element).is(":checked")) {
  //           outlets.push($(element).val());
  //         }
  //       });
  //       const currentUser = Meteor.user();
  //       const outletCode = currentUser.outlets[0];
  //       if (outlets.length < 1) {
  //         outlets.push(outletCode);
  //       }

  //       if (outlets.length > 0) {
  //         if (author.length == 0) {
  //           author = Meteor.user().fullname;
  //         }
  //         const content = t.editor.get().getData();
  //         const data = {
  //           title,
  //           originalUrl,
  //           excerpt,
  //           author,
  //           publishDate,
  //           partners,
  //           content,
  //           category,
  //           status: true,
  //           outlets,
  //           createdAt: new Date(),
  //           createdBy: Meteor.userId(),
  //           slug,
  //         };
  //         if (t.imageFile.get()) {
  //           data.imageLink = t.imageDir.get().link();
  //           data.imageId = t.imageFile.get();
  //         }
  //         const submitType = t.submitType.get();
  //         let postRoute = "insertNews";
  //         if (submitType === 2) {
  //           postRoute = "updateNews";
  //           data.id = FlowRouter.current().params._id;
  //           if (paymentFile[0]) {
  //             // console.log(article)
  //             const uploadData = {
  //               type: "news",
  //               fileLink: news.imageLink,
  //               Body: paymentFile[0],
  //             };
  //             const fileLink = await uploadFiles(uploadData);
  //             data.imageLink = fileLink;
  //           }
  //         } else {
  //           if (paymentFile[0]) {
  //             const uploadData = {
  //               type: "news",
  //               Body: paymentFile[0],
  //             };
  //             const fileLink = await uploadFiles(uploadData);
  //             data.imageLink = fileLink;
  //           }
  //         }

  //         Meteor.call(postRoute, data, async function (err, res) {
  //           if (err) {
  //             failAlert(err);
  //           } else {
  //             successAlertBack("Data berhasil disimpan");
  //           }
  //         });
  //       } else {
  //         failAlert("Outlet harus ada minimal satu!");
  //       }
  //     }
  //   });
  // },
  "click #curate"(e, t) {
    const news = t.news.get();
    if (news.curationStatus) {
      failAlert("Berita Sudah pernah diajukan");
      history.back();
    } else {
      Meteor.call("curateNews", news, function (err, res) {
        if (err) {
          failAlert(err);
        } else {
          successAlertBack("Berhasil Mengajukan Kurasi");
        }
      });
    }
  },
  "click .remove-image"(event, template) {
    event.preventDefault();
    const fileId = event.target.attributes.buttondata.value.toString();
    template.imageDir.set(undefined);
    template.imageFile.set(undefined);
    Meteor.call("deleteGeneralPic", fileId);
  },
});
