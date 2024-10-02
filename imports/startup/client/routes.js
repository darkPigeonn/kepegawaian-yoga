import { FlowRouter } from "meteor/ostrio:flow-router-extra";

// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/article/article.js";
import "../../ui/pages/not-found/not-found.js";
import "../../ui/pages/batch/batch.js";
import "../../ui/pages/notification/notification.js";
import "../../ui/pages/prayers/prayers.js";
import "../../ui/pages/news/news.js";
import "../../ui/pages/document/document.js";
import "../../ui/pages/user/user.js";
import "../../ui/pages/evaluations/evaluation.js";
import "../../ui/pages/proposal/proposal.js";
import "../../ui/pages/employees/employees.js";
import "../../ui/pages/pages/pages.js";
import "../../ui/pages/lms/lms.js"
import { timers } from "jquery";
// Set up all routes in the app
FlowRouter.route("/", {
  name: "App.home",
  action() {
    this.render("App_body", "App_home");
  },
});

FlowRouter.notFound = {
  action() {
    this.render("App_body", "App_notFound");
  },
};

FlowRouter.route("/batch", {
  name: "batch",
  action() {
    this.render("App_body", "batch_page");
  },
});
FlowRouter.route("/batch/create", {
  name: "batch create",
  action() {
    this.render("App_body", "batch_create");
  },
});
FlowRouter.route("/batch/detail/:_id", {
  name: "batch update",
  action() {
    this.render("App_body", "batch_detail");
  },
});

// Test Article
FlowRouter.route("/articles/create", {
  name: "article create",
  action() {
    this.render("App_body", "createArticle");
  },
});
FlowRouter.route("/articles/list", {
  name: "article list",
  action() {
    this.render("App_body", "listArticle");
  },
});
FlowRouter.route("/articles/edit/:_id", {
  name: "article edit",
  action() {
    this.render("App_body", "editArticle");
  },
});
FlowRouter.route("/articles/evaluation/:_id", {
  name: "article evaluation",
  action() {
    this.render("App_body", "evaluationForm");
  },
});

// Evaluation
FlowRouter.route("/evaluation/list", {
  name: "evaluation list",
  action() {
    this.render("App_body", "evaluationList");
  },
});

// Test Berita
FlowRouter.route("/news/list", {
  name: "news list",
  action() {
    this.render("App_body", "listNews");
  },
});

FlowRouter.route("/news/curation/list", {
  name: "news list curation",
  action() {
    this.render("App_body", "listNewsCuration");
  },
});

FlowRouter.route("/news/create", {
  name: "news create",
  action() {
    this.render("App_body", "createNews");
  },
});

FlowRouter.route("/news/edit/:_id", {
  name: "news edit",
  action() {
    this.render("App_body", "editNews");
  },
});

FlowRouter.route("/news/curate/:_id", {
  name: "news curate",
  action() {
    this.render("App_body", "curateNews");
  },
});

// Test Doa
FlowRouter.route("/prayers-group/list", {
  name: "prayer group list",
  action() {
    this.render("App_body", "listPrayersGroup");
  },
});
FlowRouter.route("/prayers-group/create", {
  name: "createPrayersGroup",
  action() {
    this.render("App_body", "createPrayersGroup");
  },
});
FlowRouter.route("/prayers-group/edit/:_id", {
  name: "editPrayersGroup",
  action() {
    this.render("App_body", "editPrayersGroup");
  },
});
FlowRouter.route("/prayers/list", {
  name: "prayer list",
  action() {
    this.render("App_body", "listPrayer");
  },
});
FlowRouter.route("/prayers/create", {
  name: "prayer create",
  action() {
    this.render("App_body", "createPrayer");
  },
});
FlowRouter.route("/prayers/edit/:_id", {
  name: "prayer edit",
  action() {
    this.render("App_body", "editPrayer");
  },
});
FlowRouter.route("/prayers/upload", {
  name: "prayer upload",
  // layoutTemplate: "printLayout",
  action() {
    this.render("App_body", "uploadPrayer");
  },
});

//USER
FlowRouter.route("/listUser", {
  name: "listUser",
  action() {
    this.render("App_body", "listUser");
  },
});

FlowRouter.route("/createAdmin", {
  name: "createAdmin",
  action() {
    this.render("App_body", "createAdmin");
  },
});

FlowRouter.route("/createUser", {
  name: "createUser",
  action() {
    this.render("App_body", "createUser");
  },
});

FlowRouter.route("/editUser/:_id", {
  name: "editUser",
  action() {
    this.render("App_body", "editUser");
  },
});

FlowRouter.route("/changePassUser/:_id", {
  name: "changePassUser",
  action() {
    this.render("App_body", "changePassUser");
  },
});

// PAGES CMS
FlowRouter.route("/pages/list", {
  name: "listPage",
  action() {
    this.render("App_body", "listPage");
  },
});
FlowRouter.route("/pages/createPage", {
  name: "createPage",
  action() {
    this.render("App_body", "createPage");
  },
});


FlowRouter.route("/lms/list",{
  name : "lmsPage",

  action(){
    this.render("App_body","lmsPage")
  }
})
FlowRouter.route("/lms/edit/:_id",{
  name : "lmsEdit",

  action(){
    this.render("App_body","lmsEdit")
  }
})