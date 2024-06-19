import Intl from "intl";
import "intl/locale-data/jsonp/id-ID";
import moment from "moment";

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
  if (context) moment.locale("id");
  return moment(context).format("DD MMMM YYYY");
});
Template.registerHelper("formatHRDate2", function (context, options) {
  if (!context) return "-";
  const dataDate = convertTanggal(context);
  if (dataDate) moment.locale("id");
  return moment(dataDate).format("DD MMMM YYYY");
});

Template.registerHelper("formatHRDateShort", function (context, options) {
  if (context) moment.locale("id");
  return moment(context).format("DD MMM YYYY");
});

Template.registerHelper("formatTime", function (context, options) {
  if (context) return moment(context).format("HH:mm") + " WIB";
});

Template.registerHelper("daysDifference", function (context, options) {
  if (context) return moment(context).diff(moment(), "days");
});

Template.registerHelper("dateToHTML", function (context, options) {
  if (moment(context).isValid())
    return moment(context).format(moment.HTML5_FMT.DATE);
  return "";
  // return moment(context).format("DD MMMM YYYY");
});

Template.registerHelper("toHTML", function (context, options) {
  return $("<div>").html(context).text();
});

Template.registerHelper("includes", function (a, b) {
  if (a && a.length && b) return a.includes(b);
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
  if (a) {
    let text = a.toString();
    return text
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
  }
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
  let words = value.split("-");

  // Mengonversi setiap kata menjadi huruf kapital untuk memulai
  words = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  // Menggabungkan kembali kata-kata dan memisahkannya dengan spasi
  let result = words.join(" ");

  return result;
});
Template.registerHelper("formatFullname", function (value) {
  let thisUser = Meteor.users.findOne({
    _id: value,
  });
  console.log(thisUser);
  if (thisUser) {
    return thisUser.fullname;
  }
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
Template.registerHelper("statusCredit", function (data) {
  let status = "";
  switch (data) {
    case 10:
      status = "Belum Terbayar";
      break;
    case 60:
      status = "Terbayar";
      break;
    default:
      status = "-";
  }
  return status;
});
Template.registerHelper("lessThan", function (a, b) {
  return a < b;
});
Template.registerHelper("isInRoles", function (roles, role) {
  return roles.includes(role);
});

Template.registerHelper("usia", function (dob) {
  const today = new Date();
  const selisih = today - dob;
  var years = moment().diff(dob, "years", false);
  return years;
});
// startSelect2 = function () {
//   setTimeout(() => {
//     $(".select2").select2();
//   }, 200);
//   // $(".firstSelect2").select2({ width: "100%" });
// };

Template.registerHelper("valueDate", function (dob) {
  if (dob) moment.locale("id");
  return moment(dob).format("YYYY-MM-DD");
});
Template.registerHelper("thisAge", function (tanggalLahir) {
  // Mengonversi bulan dari teks ke angka
  const bulanMapping = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  // Memecah tanggal ke dalam hari, bulan, dan tahun
  let [hari, bulan, tahun] = tanggalLahir.split("-");

  // Mengganti nama bulan dengan angka yang sesuai
  bulan = bulanMapping[bulan];

  // Menggabungkan kembali tanggal dalam format yang sesuai dengan Moment.js
  let formattedDate = `${tahun}-${bulan}-${hari}`;

  // Parsing tanggal menggunakan Moment.js
  let momentLahir = moment(formattedDate, "YYYY-MM-DD");
  let sekarang = moment();

  // Menghitung umur dalam tahun, bulan, dan hari
  let umurTahun = sekarang.diff(momentLahir, "years");
  momentLahir.add(umurTahun, "years");

  let umurBulan = sekarang.diff(momentLahir, "months");
  momentLahir.add(umurBulan, "months");

  let umurHari = sekarang.diff(momentLahir, "days");

  // Mengembalikan umur dalam format yang diinginkan
  return `${umurTahun} tahun ${umurBulan} bulan ${umurHari} hari`;
});

Template.registerHelper("statusPpdb", function (data) {
  let status = "";
  switch (data) {
    case 10:
      status = "Menunggu Pembayaran Formulir";
      break;
    case 20:
      status = "Mengisi Formulir PPDB";
      break;
    case 30:
      status = "Menunggu Pembayaran Uang Pangkal";
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
      status = "draft";
  }
  return status;
});

Template.registerHelper("categoryVa", function (data) {
  if (!data) {
    return "-";
  }
  let label = "-";
  if (data == "08") {
    label = "Va Formulir";
  }
  if (data == "90") {
    label = "Va Pembayaran Lunas";
  }
  if (data == "99") {
    label = "Va Pembayaran Cicil";
  }
  return label;
});
Template.registerHelper("statusVa", function (data) {
  let status = "";
  switch (data) {
    case 0:
      status = "Belum Aktif";
      break;
    case 10:
      status = "Aktif";
      break;
    case 20:
      status = "Terpakai";
      break;
    case 60:
      status = "Terbayar";
      break;
    default:
      status = "draft";
  }
  return status;
});

Template.registerHelper("lenghtBool", function (data) {
  if (data.length > 0) {
    return true;
  }
  return false;
});

function convertTanggal(tanggal) {
  // Mengonversi bulan dari teks ke angka
  const bulanMapping = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  // Memecah tanggal ke dalam hari, bulan, dan tahun
  let [hari, bulan, tahun] = tanggal.split("-");

  // Mengganti nama bulan dengan angka yang sesuai
  bulan = bulanMapping[bulan];

  // Menggabungkan kembali tanggal dalam format yang sesuai dengan Moment.js
  let formattedDate = `${tahun}-${bulan}-${hari}`;

  // Parsing tanggal menggunakan Moment.js
  let momentDate = moment(formattedDate, "YYYY-MM-DD");

  // Format ke format yang diinginkan
  return momentDate;
}
