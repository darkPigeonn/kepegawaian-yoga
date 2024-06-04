// Client entry point, imports all client code

import "/imports/startup/client";
import "/imports/startup/both";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/js/bootstrap.min.js";

startSelect2 = function () {
  setTimeout(() => {
    $(".select2").select2();
  }, 1500);
};

const INACTIVITY_TIMEOUT = 300000; // 5 minutes in milliseconds

let inactivityTimer;
