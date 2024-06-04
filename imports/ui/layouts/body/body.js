import "./body.html";
import "../../components/navbar/navbar.js";
import { Meteor } from "meteor/meteor";
import Swal from "sweetalert2";
import { Random } from "meteor/random";

const INACTIVITY_TIMEOUT = 10000; // 5 minutes in milliseconds

let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    Swal.fire({
      title: "Anda tidak aktif beberapa saat",
      text: "Silahkan login kembali untuk menggunakan aplikasi ini.",
      icon: "warning",
    });
    Meteor.logout(() => {
      Router.go("/login");
      alert("You have been logged out due to inactivity.");
    });
  }, INACTIVITY_TIMEOUT);
};

const activityEvents = ["mousemove", "keydown", "click"];

const setupInactivityMonitor = () => {
  activityEvents.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });
  resetInactivityTimer(); // Initialize the timer
};

Template.App_body.onRendered(() => {
  setupInactivityMonitor();
  // Check if session token exists
  const sessionToken = sessionStorage.getItem("sessionToken");
  if (!sessionToken) {
    Meteor.logout(() => {
      Router.go("/login");
    });
  } else {
    resetInactivityTimer();
  }
});

Template.App_body.onDestroyed(() => {
  activityEvents.forEach((event) => {
    window.removeEventListener(event, resetInactivityTimer);
  });
});

// Clear session on logout
Accounts.onLogout(() => {
  sessionStorage.removeItem("sessionToken");
});

// Save session token on login
Tracker.autorun(() => {
  if (Meteor.userId()) {
    sessionStorage.setItem("sessionToken", Random.id());
  }
});

Template.login_page.events({
  "click .submit"(e, t) {
    e.preventDefault();
    const email = $("#input_username").val();
    const password = $("#input_password").val();
    if (email && password) {
      Meteor.loginWithPassword(email, password, function (error) {
        if (error) {
          alert(error);
        } else {
          Router.go("home");
        }
      });
    } else {
      alert("silahkan isi form dengan lengkap");
    }
  },
});
