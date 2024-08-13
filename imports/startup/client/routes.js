import { FlowRouter } from "meteor/ostrio:flow-router-extra";

// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/not-found/not-found.js";
import "../../ui/pages/batch/batch.js";
import "../../ui/pages/employee/employee.js";
import "../../ui/pages/departement/departement.js";
import "../../ui/pages/notification/notification.js";
import "../../ui/pages/projects/projects.js";
import "../../ui/pages/tasks/tasks.js";
import "../../ui/pages/attendance/attendance.js";
import "../../ui/pages/document/document.js";
import "../../ui/pages/user/user.js";
import "../../ui/pages/proposal/proposal.js";
import "../../ui/pages/configuration/configuration.js";
import "../../ui/pages/tickets/tickets.js";
import "../../ui/pages/perwakilan/perwakilan.js";
import "../../ui/pages/schools/schools.js";
import "../../ui/pages/ppdb/konfigurasi/konfigurasi.js";
import "../../ui/pages/ppdb/ppdb.js";
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

// Employees
FlowRouter.route("/employees/create", {
  name: "employee create",
  action() {
    this.render("App_body", "employee_create");
  },
});
FlowRouter.route("/employees/edit/:_id", {
  name: "employee update",
  action() {
    this.render("App_body", "employee_edit");
  },
});
FlowRouter.route("/employees/remove/:_id", {
  name: "employee delete",
  action() {
    this.render("App_body", "employee_delete");
  },
});
FlowRouter.route("/employees/mutation/:_id", {
  name: "employee mutation",
  action() {
    this.render("App_body", "employee_mutation");
  },
});
FlowRouter.route("/employees", {
  name: "employee page",
  action() {
    this.render("App_body", "employee_page");
  },
});
FlowRouter.route("/employees/uploadCSV", {
  name: "uploadCSV",
  action() {
    this.render("App_body", "upload_CSV");
  },
});
FlowRouter.route("/employees/detail/:_id", {
  name: "employee detail",
  action() {
    this.render("App_body", "employee_detail");
  },
});
FlowRouter.route("/employees/detail/academicJob/:_id", {
  name: "employee detail academic and job",
  action() {
    this.render("App_body", "employee_detail_academicJob");
  },
});
FlowRouter.route("/employees/detail/emergencyContact/:_id", {
  name: "employee detail emergency contact",
  action() {
    this.render("App_body", "employee_detail_emergencyContact");
  },
});
FlowRouter.route("/employees/detail/config/:_id", {
  name: "employee detail config",
  action() {
    this.render("App_body", "employee_detail_config");
  },
});
FlowRouter.route("/employees/search", {
  name: "employeeSearch",
  action() {
    this.render("App_body", "employeeSearch");
  },
});
FlowRouter.route("/employees/soon", {
  name: "comingSoon",
  action() {
    this.render("App_body", "comingSoon");
  },
});

// Departments
FlowRouter.route("/departements", {
  name: "departement page",
  action() {
    this.render("App_body", "departement_page");
  },
});
FlowRouter.route("/departements/create", {
  name: "departement create",
  action() {
    this.render("App_body", "departement_create");
  },
});
FlowRouter.route("/departements/edit/:_id", {
  name: "departement update",
  action() {
    this.render("App_body", "departement_edit");
  },
});
FlowRouter.route("/departements/detail/:_id", {
  name: "departement detail",
  action() {
    this.render("App_body", "departement_detail");
  },
});
FlowRouter.route("/departements/anggota/:_id", {
  name: "departement anggota",
  action() {
    this.render("App_body", "departement_anggota");
  },
});

// Notification
FlowRouter.route("/notification", {
  name: "notificationPage",
  action() {
    this.render("App_body", "notification_page");
  },
});

// Projects
FlowRouter.route("/projects", {
  name: "projectPage",
  action() {
    this.render("App_body", "projects_page");
  },
});
FlowRouter.route("/projects/create", {
  name: "projectCreate",
  action() {
    this.render("App_body", "projects_create");
  },
});
FlowRouter.route("/projects/edit/:_id", {
  name: "projectEdit",
  action() {
    this.render("App_body", "projects_edit");
  },
});
FlowRouter.route("/projects/detail/:_id", {
  name: "projectDetail",
  action() {
    this.render("App_body", "projects_detail");
  },
});
FlowRouter.route("/projects/detail/:_id/members", {
  name: "projectMembers",
  action() {
    this.render("App_body", "projects_members");
  },
});

// Tasks
FlowRouter.route("/tasks", {
  name: "taskUmum",
  action() {
    this.render("App_body", "tasks_page");
  },
});
FlowRouter.route("/tasks/create/:_id", {
  name: "taskCreate",
  action() {
    this.render("App_body", "tasks_create");
  },
});
FlowRouter.route("/tasks/edit/:_id", {
  name: "taskEdit",
  action() {
    this.render("App_body", "tasks_edit");
  },
});
FlowRouter.route("/tasks/detail/:_id", {
  name: "taskDetail",
  action() {
    this.render("App_body", "tasks_detail");
  },
});
FlowRouter.route("/tasks/detail/:_id/members", {
  name: "taskMembers",
  action() {
    this.render("App_body", "tasks_members");
  },
});

// Presensi
FlowRouter.route("/presensi", {
  name: "staffsAttendancePage",
  action() {
    this.render("App_body", "staffsAttendancePage");
  },
});

FlowRouter.route("/rekapPresensi", {
  name: "rekapAttendancePage",
  action() {
    this.render("App_body", "rekapAttendancePage");
  },
});

FlowRouter.route("/riwayatPresensi", {
  name: "historyAttendance",
  action() {
    this.render("App_body", "historyAttendance");
  },
});

FlowRouter.route("/cetak-rekap/:_code", {
  name: "cetakRekap",
  action() {
    this.render("App_body", "cetakRekap");
  },
});

FlowRouter.route("/cetak-rekap-riwayat/:_code", {
  name: "cetakRekapRiwayat",
  action() {
    this.render("App_body", "cetakRekapRiwayat");
  },
});

FlowRouter.route("/cetak-rekap-individu/:_month/:_userId", {
  name: "cetakRekapIndividu",
  action() {
    this.render("App_body", "cetakRekapIndividu");
  },
});

FlowRouter.route("/configurasi/list/", {
  name: "configurasiList",
  action() {
    this.render("App_body", "configurasiList");
  },
});

FlowRouter.route("/configurasi/details/:_id", {
  name: "configurasiDetails",
  action() {
    this.render("App_body", "configurasiDetails");
  },
});

FlowRouter.route("/detailWfh/:_id", {
  name: "detailWfh",
  action() {
    this.render("App_body", "detailWfh");
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

FlowRouter.route("/createEmployeeAdmin", {
  name: "createEmployeeAdmin",
  action() {
    this.render("App_body", "createEmployeeAdmin");
  },
});

FlowRouter.route("/connectEmployeeAppUser", {
  name: "connectEmployeeAppUser",
  action() {
    this.render("App_body", "connectEmployeeAppUser");
  },
});

//DOCUMENTS
FlowRouter.route("/documents", {
  name: "listDocument",
  action() {
    this.render("App_body", "list_document");
  },
});

FlowRouter.route("/documents/create", {
  name: "createDocument",
  action() {
    this.render("App_body", "create_document");
  },
});

FlowRouter.route("/documents/details/:_id", {
  name: "detailDocument",
  action() {
    this.render("App_body", "detailDocument");
  },
});

FlowRouter.route("/documents/review/:_id", {
  name: "reviewDocument",
  action() {
    this.render("App_body", "reviewDocument");
  },
});

//PROPOSAL
FlowRouter.route("/proposal/", {
  name: "listProposals",
  action() {
    this.render("App_body", "listProposals");
  },
});

FlowRouter.route("/proposal/create/:_id", {
  name: "createProposal",
  action() {
    this.render("App_body", "createProposal");
  },
});

FlowRouter.route("/proposal/edit/:_id", {
  name: "editProposal",
  action() {
    this.render("App_body", "editProposal");
  },
});

FlowRouter.route("/proposal/preview/:_id", {
  name: "previewProposal",
  action() {
    this.render("App_body", "previewProposal");
  },
});

FlowRouter.route("/proposal/view/:_id", {
  name: "viewProposal",
  action() {
    this.render("App_body", "viewProposal");
  },
});

FlowRouter.route("/proposal/print/:_id", {
  name: "printProposal",
  action() {
    this.render("App_body", "printProposal");
  },
});

//TICKETS
FlowRouter.route("/tickets", {
  name: "listTicket",
  action() {
    this.render("App_body", "listTicket");
  },
});
FlowRouter.route("/tickets/create", {
  name: "createTicket",
  action() {
    this.render("App_body", "createTicket");
  },
});
FlowRouter.route("/tickets/edit/:_id", {
  name: "editTicket",
  action() {
    this.render("App_body", "editTicket");
  },
});
FlowRouter.route("/tickets/detail/:_id", {
  name: "detailTicket",
  action() {
    this.render("App_body", "detailTicket");
  },
});
FlowRouter.route("/tickets/message/:_id", {
  name: "chatTicket",
  action() {
    this.render("App_body", "chatTicket");
  },
});

// korespondensi
FlowRouter.route("/korespondensi/", {
  name: "korespondensi",
  action() {
    this.render("App_body", "listKorespondensi");
  },
});
FlowRouter.route("/createKorespondensi/", {
  name: "createKorespondensi",
  action() {
    this.render("App_body", "createKorespondensi");
  },
});
FlowRouter.route("/editKorespondensi/:_id", {
  name: "editKorespondensi",
  action() {
    this.render("App_body", "editKorespondensi");
  },
});
FlowRouter.route("/editKorespondensiAlur/:_id", {
  name: "editKorespondensiAlur",
  action() {
    this.render("App_body", "editKorespondensiAlur");
  },
});

//konfigurasi
FlowRouter.route("/listKonfigurasi/", {
  name: "listKonfigurasi",
  action() {
    this.render("App_body", "listKonfigurasi");
  },
});
FlowRouter.route("/listKonfigurasi/listKategoriSurat", {
  name: "listKategoriSurat",
  action() {
    this.render("App_body", "listKategoriSurat");
  },
});
FlowRouter.route("/listKonfigurasi/createKategoriSurat", {
  name: "createKategoriSurat",
  action() {
    this.render("App_body", "createKategoriSurat");
  },
});
FlowRouter.route("/listKonfigurasi/editKategoriSurat/:_id", {
  name: "editKategoriSurat",
  action() {
    this.render("App_body", "editKategoriSurat");
  },
});
FlowRouter.route("/detailKorespondensi/:_id", {
  name: "detailKorespondensi",
  action() {
    this.render("App_body", "detailKorespondensi");
  },
});
FlowRouter.route("/perwakilan/list", {
  name: "listPerwakilan",
  action() {
    this.render("App_body", "listPerwakilan");
  },
});

FlowRouter.route("/ppdb", {
  name: "ppdb",
  action() {
    this.render("App_body", "pagePpdb");
  },
});
FlowRouter.route("/ppdb/konfigurasi", {
  name: "konfigurasi",
  action() {
    this.render("App_body", "konfigurasi");
  },
});

FlowRouter.route("/ppdb/va", {
  name: "va",
  action() {
    this.render("App_body", "pageVa");
  },
});
FlowRouter.route("/ppdb/va/generate", {
  name: "generateVa",
  action() {
    this.render("App_body", "pageGenerateVa");
  },
});
FlowRouter.route("/payment", {
  name: "payment",
  action() {
    this.render("App_body", "paymentPage");
  },
});
FlowRouter.route("/paymentFinalPage", {
  name: "paymentFinalPage",
  action() {
    this.render("App_body", "paymentFinalPage");
  },
});

FlowRouter.route("/ppdb/details/:_id", {
  name: "Detail Registrans",
  action() {
    this.render("App_body", "detailRegistran");
  },
});
FlowRouter.route("/ppdb/details/:_id/setCicil", {
  name: "Cicilan Registrans",
  action() {
    this.render("App_body", "cicilanRegistran");
  },
});
FlowRouter.route("/forgotPassword", {
  name: "forgotPassword",
  action() {
    this.render("forgotPassword");
  },
});
FlowRouter.route("/ppdb/:schoolId", {
  name: "pagePpdbSchool",
  action() {
    this.render("App_body", "pagePpdbSchool");
  },
});
