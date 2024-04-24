import { FlowRouter } from "meteor/ostrio:flow-router-extra";

// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/not-found/not-found.js";
import "../../ui/pages/notification/notification.js";
import "../../ui/pages/lecturers/lecturers.js";
import "../../ui/pages/user/user.js";
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

// Notification
FlowRouter.route("/notification", {
  name: "notificationPage",
  action(){
    this.render("App_body", "notification_page")
  }
});

FlowRouter.route('/password/edit/:_id', {
  name: 'passwordEdit',
  action() {
    this.render("App_body", "passwordEdit");
  }
});

FlowRouter.route("/forgot-password", {
  name: "forgotPassword",
  action(){
    this.render("passwordForm", "forgotPassword")
  }
});

FlowRouter.route("/reset-password", {
  name: "resetPassword",
  action(){
    this.render("resetPasswordForm", "resetPassword")
  }
});

// Lecturers
FlowRouter.route("/lecturers/add", {
  name: "lecturer add",
  action() {
    this.render("App_body","lecturers_add");
  }
});

FlowRouter.route("/lecturers/edit/:_id", {
  name: "lecturer edit",
  action() {
    this.render("App_body","lecturers_edit");
  }
});

FlowRouter.route("/lecturers/detail/:_id", {
  name: "lecturer detail",
  action() {
    this.render("App_body","lecturers_detail");
  }
});

//USER
// FlowRouter.route("/listUser", {
//   name:"listUser",
//   action(){
//     this.render("App_body", "listUser")
//   }
// });

// FlowRouter.route("/createAdmin", {
//   name: "createAdmin",
//   action(){
//     this.render("App_body", "createAdmin")
//   }
// });

// FlowRouter.route("/createUser", {
//   name:"createUser",
//   action(){
//     this.render("App_body", "createUser")
//   }
// });

// FlowRouter.route("/editUser/:_id", {
//   name:"editUser",
//   action(){
//     this.render("App_body", "editUser")
//   }
// });

// FlowRouter.route("/changePassUser/:_id", {
//   name:"changePassUser",
//   action(){
//     this.render("App_body", "changePassUser")
//   }
// });
