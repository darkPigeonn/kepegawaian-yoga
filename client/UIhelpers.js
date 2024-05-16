import Intl from "intl";
import "intl/locale-data/jsonp/id-ID";
import moment from "moment";
import 'moment/locale/id';

Handlebars.registerHelper('increment', function(value) {
  return value + 1;
});

Template.registerHelper("formatRp", function (context, options) {
  if (context)
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(context);
  else {
    return "Rp. 0";
  }

});


Template.registerHelper("lessThan", function (a, b) {
  return a < b;
});


Template.registerHelper(
  "formatTotalTimeWorking",
  function (startTime, endTime) {
    let dataReturn;

    if (startTime && endTime) {
      var now = moment(startTime); //todays date
      var end = moment(endTime); // another date
      var duration = moment.duration(end.diff(now));

      const hours = Math.floor(duration.asHours());
      const minutes = Math.floor(duration.asMinutes()) - 60 * hours;
      const seconds = Math.floor(duration.asSeconds()) - 3600 * hours;
      dataReturn = hours + " jam - " + minutes + " menit";
    } else {
      dataReturn = "-";
    }
    return dataReturn;
  }
);

Template.registerHelper("formatHRDate", function (context, options) { 
  if (context) moment.locale('id');
  return moment(context).format("D MMMM YYYY");
});



Template.registerHelper("formatHRDateShort", function (context, options) {
  if (context) moment.locale("id");
  return moment(context).format("DD MMM YYYY");
});

Template.registerHelper("formatTime", function (context, options) {
  if (context) return moment(context).format("HH:mm") + " WIB";
});

Template.registerHelper("daysDifference", function (context, options) {
  if (context) return moment(context).diff(moment(),'days');
});

Template.registerHelper("dateToHTML", function (context, options) {
  if (moment(context).isValid()) return moment(context).format(moment.HTML5_FMT.DATE)
  return ''
  // return moment(context).format("DD MMMM YYYY");
});

Template.registerHelper('toHTML', function (context, options) {
  return $("<div>").html(context).text();
});

Template.registerHelper('includes', function (a, b) {
  if(a && a.length && b) return a.includes(b);
});



// Template.registerHelper('formatRp', function (context, options) {
//   if (context != 0) {
//     return 'Rp. ' + numeral(context).format('0,0.[00]');
//   } else {
//     return 'FREE';
//   }
// });
Template.registerHelper("nomorUrut", function (context) {
  let nomor = context;
  if (context) {
    nomor = nomor + 1;
    return nomor;
  } else {
    return 1;
  }
});
Template.registerHelper("equals", function (a, b) {
  return a == b;
});
Template.registerHelper("fc_label", function (a) {
  let value = "";

  switch (a) {
    case "fc-1": {
      value = "Cacing Sutra";
    }
    case "fc-2": {
      value = "Pengli";
    }
    case "fc-3": {
      value = "PF-500";
    }
  }
  return value;
});
Template.registerHelper("capitalizeWord", function (a) {
  let text = a.toString();
  return text.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase());
});

Template.registerHelper("capitalizeWordLower", function (a) {
  let text = a.toString();
  return text.toLowerCase().replace(/(^\w{1})|(\s\w{1})/g, (match) => match.toLowerCase());
});

Template.registerHelper("toMeteorId", function (context) {
  if (context && typeof context === "object") {
    const meteorId = context.toHexString();
    if (meteorId) {
      return meteorId;
    }
  }
  return context;
});
Template.registerHelper("setTableNumber", function (value) {
  let number = parseInt(value);
  return number + 1;
});
Template.registerHelper("setJabatanFormat", function (value) { 
  let words = value.split('-');

  // Mengonversi setiap kata menjadi huruf kapital untuk memulai
  words = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  // Menggabungkan kembali kata-kata dan memisahkannya dengan spasi
  let result = words.join(' ');

  return result;
})
Template.registerHelper("formatFullname", function (value) {
    let thisUser = Meteor.users.findOne({
      _id: value,
    });
    console.log(thisUser);
    if (thisUser) {
      return thisUser.fullname;
    }
});
Template.registerHelper("isInRoles", function(roles) {
  if (Meteor.user() && Meteor.user().roles.includes("dosen")) {
    return true;
} else {
    return isInRoles(roles);
  }

  r
  
});



Template.registerHelper("formatFullname", function (value) {
  if (value) {
    let thisUser = Meteor.users.findOne({
      _id: value,
    });
    if (thisUser) {
      return thisUser.fullname;
    }
  } else {
    return "Sine Nomine";
  }
});

Template.registerHelper("statusDetail", function (data) {
  let status = "";
  switch (data) {
    case -1:
      status = "Draft";
      break;
    case 1:
      status = "Tersetujui";
      break;
    case 0:
      status = "Terkirim";
      break;
    case 20:
      status = "Sedang direview";
      break;
    case 90:
      status = "Ditolak dengan revisi";
      break;
    case 99:
      status = "Ditolak";
      break;
    case 60:
      status = "Diterima";
      break;
    default:
      status = "-";
  }
  return status;
});

// startSelect2 = function () {
//   setTimeout(() => {
//     $(".select2").select2();
//   }, 200);
//   // $(".firstSelect2").select2({ width: "100%" });
// };