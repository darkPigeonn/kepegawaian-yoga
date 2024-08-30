// Client entry point, imports all client code

import "/imports/startup/client";
import "/imports/startup/both";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/js/bootstrap.min.js";

startSelect2 = function () {
  setTimeout(() => {
    $(".select2").select2();
  }, 1500);
};

Meteor.startup(() => {
  // This will run once the page is fully loaded
  window.addEventListener("load", () => {
    // Hide the preloader once everything is loaded
    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }
  });
});
