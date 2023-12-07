// Import server startup through a single index entry point

import "./fixtures.js";
import "./register-api.js";

isEmptyData = function (data) {
    let dataReturn = 0;
    Object.keys(data).forEach(function (key) {
      const value = data[key];
      if (value === "") {
        dataReturn = 1;
      }
    });
  
    //return 0 : filled, 1 : not filled
    return dataReturn;
  };