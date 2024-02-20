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
FlowRouter.route('/articles/create',{
  name: 'article create',
  action() {
    this.render("App_body", 'createArticle');
  }
});
FlowRouter.route('/articles/list',{
  name: 'article list',
  action() {
    this.render("App_body", 'listArticle');
  }
});
FlowRouter.route('/articles/edit/:_id',{
  name: 'article edit',
  action() {
    this.render("App_body", 'editArticle');
  }
});
FlowRouter.route("/articles/evaluation/:_id", {
  name: "article evaluation",
  action() {
    this.render("App_body",'evaluationForm');
  }
});

// Evaluation
FlowRouter.route("/evaluation/list", {
  name: "evaluation list",
  action() {
    this.render("App_body",'evaluationList');
  }
});

// Test Berita
FlowRouter.route("/news/list", {
  name: "news list",
  action() {
    this.render("App_body", 'listNews');
  }
});

FlowRouter.route("/news/curation/list", {
  name: "news list curation",
  action() {
    this.render("App_body", 'listNewsCuration');
  }
});

FlowRouter.route("/news/create", {
  name: "news create",
  action() {
    this.render("App_body", 'createNews');
  }
});

FlowRouter.route("/news/edit/:_id", {
  name: "news edit",
  action() {
    this.render("App_body", 'editNews');
  }
});

FlowRouter.route("/news/curate/:_id", {
  name: "news curate",
  action() {
    this.render("App_body", 'curateNews');
  }
});

// Test Doa
FlowRouter.route("/prayers-group/list", {
  name: "prayer group list",
  action(){
    this.render("App_body", "listPrayersGroup")
  }
});
FlowRouter.route("/prayers-group/create", {
  name: "prayer group create",
  action(){
    this.render("App_body", "createPrayersGroup")
  }
});
FlowRouter.route("/prayers-group/edit/:_id", {
  name: "prayer group edit",
  action(){
    this.render("App_body", "editPrayersGroup")
  }
});
FlowRouter.route("/prayers/list", {
  name: "prayer list",
  action(){
    this.render("App_body", "listPrayer")
  }
});
FlowRouter.route("/prayers/create", {
  name: "prayer create",
  action(){
    this.render("App_body", "createPrayer")
  }
});
FlowRouter.route("/prayers/edit/:_id", {
  name: "prayer edit",
  action(){
    this.render("App_body", "editPrayer")
  }
});
FlowRouter.route("/prayers/upload", {
  name: "prayer upload",
  // layoutTemplate: "printLayout",
  action(){
    this.render("App_body", "uploadPrayer")
  }
});

// Employees
FlowRouter.route("/employees/create", {
  name: "employee create",
  action(){
    this.render("App_body", "employee_create")
  }
});
FlowRouter.route("/employees/edit/:_id", {
  name: "employee update",
  action(){
    this.render("App_body", "employee_edit")
  }
});
FlowRouter.route("/employees/remove/:_id", {
  name: "employee delete",
  action(){
    this.render("App_body", "employee_delete")
  }
});
FlowRouter.route("/employees/mutation/:_id", {
  name: "employee mutation",
  action(){
    this.render("App_body", "employee_mutation")
  }
});
FlowRouter.route("/employees", {
  name: "employee page",
  action(){
    this.render("App_body", "employee_page")
  }
});
FlowRouter.route("/employees/uploadCSV", {
  name: "uploadCSV",
  action(){
    this.render("App_body", "upload_CSV")
  }
});
FlowRouter.route("/employees/detail/:_id", {
  name: "employee detail",
  action(){
    this.render("App_body", "employee_detail")
  }
});
FlowRouter.route("/employees/detail/academicJob/:_id", {
  name: "employee detail academic and job",
  action(){
    this.render("App_body", "employee_detail_academicJob")
  }
});
FlowRouter.route("/employees/detail/emergencyContact/:_id", {
  name: "employee detail emergency contact",
  action(){
    this.render("App_body", "employee_detail_emergencyContact")
  }
});
FlowRouter.route("/employees/soon", {
  name: "comingSoon",
  action(){
    this.render("App_body", "comingSoon")
  }
});

// Departments
FlowRouter.route("/departements", {
  name: "departement page",
  action(){
    this.render("App_body", "departement_page")
  }
});
FlowRouter.route("/departements/create", {
  name: "departement create",
  action(){
    this.render("App_body", "departement_create")
  }
});
FlowRouter.route("/departements/edit/:_id", {
  name: "departement update",
  action(){
    this.render("App_body", "departement_edit")
  }
});
FlowRouter.route("/departements/detail/:_id", {
  name: "departement detail",
  action(){
    this.render("App_body", "departement_detail")
  }
});
FlowRouter.route("/departements/anggota/:_id", {
  name: "departement anggota",
  action(){
    this.render("App_body", "departement_anggota")
  }
});

// Notification
FlowRouter.route("/notification", {
  name: "notificationPage",
  action(){
    this.render("App_body", "notification_page")
  }
});

// Presensi
FlowRouter.route("/presensi", {
  name: "staffsAttendancePage",
  action(){
    this.render("App_body", "staffsAttendancePage")
  }
});

FlowRouter.route("/rekapPresensi", {
  name: "rekapAttendancePage",
  action(){
    this.render("App_body", "rekapAttendancePage")
  }
});

FlowRouter.route("/riwayatPresensi", {
  name: "historyAttendance",
  action(){
    this.render("App_body", "historyAttendance")
  }
});

FlowRouter.route("/cetak-rekap/:_code", {
  name: "cetakRekap",
  action(){
    this.render("App_body", "cetakRekap")
  }
});

FlowRouter.route("/cetak-rekap-riwayat/:_code", {
  name: "cetakRekapRiwayat",
  action(){
    this.render("App_body", "cetakRekapRiwayat")
  }
});

FlowRouter.route("/cetak-rekap-individu/:_month/:_userId", {
  name: "cetakRekapIndividu",
  action(){
    this.render("App_body", "cetakRekapIndividu")
  }
});

FlowRouter.route("/configurasi/list/", {
  name: "configurasiList",
  action(){
    this.render("App_body", "configurasiList")
  }
});

FlowRouter.route("/configurasi/details/:_id", {
  name: "configurasiDetails",
  action(){
    this.render("App_body", "configurasiDetails")
  }
});

FlowRouter.route("/detailWfh/:_id", {
  name:"detailWfh",
  action(){
    this.render("App_body", "detailWfh")
  }
});

//USER
FlowRouter.route("/listUser", {
  name:"listUser",
  action(){
    this.render("App_body", "listUser")
  }
});

FlowRouter.route("/createAdmin", {
  name: "createAdmin",
  action(){
    this.render("App_body", "createAdmin")
  }
});

FlowRouter.route("/createUser", {
  name:"createUser",
  action(){
    this.render("App_body", "createUser")
  }
});

FlowRouter.route("/editUser/:_id", {
  name:"editUser",
  action(){
    this.render("App_body", "editUser")
  }
});

FlowRouter.route("/changePassUser/:_id", {
  name:"changePassUser",
  action(){
    this.render("App_body", "changePassUser")
  }
});

//DOCUMENTS
FlowRouter.route("/documents", {
  name:"listDocument",
  action(){
    this.render("App_body", "list_document")
  }
});

FlowRouter.route("/documents/create", {
  name:"createDocument",
  action(){
    this.render("App_body", "create_document")
  }
});

FlowRouter.route("/documents/details/:_id", {
  name:"detailDocument",
  action(){
    this.render("App_body", "detailDocument")
  }
});

FlowRouter.route("/documents/review/:_id", {
  name:"reviewDocument",
  action(){
    this.render("App_body", "reviewDocument")
  }
});

//PROPOSAL
FlowRouter.route("/proposal/", {
  name:"listProposals",
  action(){
    this.render("App_body", "listProposals")
  }
});

FlowRouter.route("/proposal/create/:_id", {
  name:"createProposal",
  action(){
    this.render("App_body", "createProposal")
  }
});

FlowRouter.route("/proposal/edit/:_id", {
  name:"editProposal",
  action(){
    this.render("App_body", "editProposal")
  }
});

FlowRouter.route("/proposal/preview/:_id", {
  name: "previewProposal",
  action(){
    this.render("App_body", "previewProposal")
  }
});

FlowRouter.route("/proposal/view/:_id", {
  name: "viewProposal",
  action(){
    this.render("App_body", "viewProposal")
  }
});

FlowRouter.route("/proposal/print/:_id", {
  name: "printProposal",
  action(){
    this.render("App_body", "printProposal")
  }
});