// Import client startup through a single index entry point

import "./routes.js";
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import Swal from "sweetalert2";
import slugify from "slugify";
import DecoupledEditor from "../../../public/ckeditor/build/ckeditor";
import moment from "moment/moment.js";
import { Random } from "meteor/random";
// import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

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

// Old Version (Bawaan Kepegawaian)
// uploadFiles = async function (uploadData) {
//     const s3Client = new S3({
//       endpoint: Meteor.settings.public.s3.endpoint,
//       region: Meteor.settings.public.s3.region,
//       credentials: {
//         accessKeyId: Meteor.settings.public.s3.credentials.accessKeyId,
//         secretAccessKey: Meteor.settings.public.s3.credentials.secretAccessKey,
//       },
//     });
//     try {
//       await s3Client.send(
//         new PutObjectCommand({
//           Bucket: "imavistatic",
//           Key: uploadData.fileName,
//           Body: uploadData.Body,
//           ACL: "public-read",
//           CacheControl: "no-cache",
//         })
//       );
//       return "https://cdn.imavi.org/" + uploadData.fileName;
//     } catch (err) {
//       console.log("Error " + err);
//     }
// };

// New Version (Ambil dari alma-next)
uploadFiles = async function (uploadData) {
  // Ini Default dari alma-next
  // const s3Client = new S3({
  //   endpoint: Meteor.settings.public.s3.endpoint,
  //   region: Meteor.settings.public.s3.region,
  //   credentials: {
  //     accessKeyId: Meteor.settings.public.s3.credentials.accessKeyId,
  //     secretAccessKey: Meteor.settings.public.s3.credentials.secretAccessKey,
  //   },
  // });
  // Ini coba-coba
  const s3Client = new S3({
    endpoint: "https://sgp1.digitaloceanspaces.com/",
    region: "sgp1",
    credentials: {
      accessKeyId: "JCF6N7HWI4BIHYE5QLMD",
      secretAccessKey: "7aGiKWmNa/hy78c9SrYHPkoPwhjoSl4YGVM9PHuFL/Y",
    },
  });
  let fileName;
  if (uploadData.fileLink) {
    const identifier = uploadData.fileLink.split("-")[1].split(".")[0];
    fileName =
      uploadData.type +
      "-" +
      identifier +
      "." +
      uploadData.Body.name.split(".").pop();
  } else {
    if (uploadData.type.split("-")[0] === "parokis") {
      fileName = uploadData.type + "." + uploadData.Body.name.split(".").pop();
    } else {
      fileName =
        uploadData.type + "~" + Random.id(7) + "~" + uploadData.Body.name;
    }
  }
  try {
    const x = await s3Client.send(
      new PutObjectCommand({
        Bucket: "imavistatic",
        Key: fileName,
        Body: uploadData.Body,
        ACL: "public-read",
        CacheControl: "no-cache",
      })
    );
    return "https://cdn.imavi.org/" + fileName;
  } catch (err) {
    failAlert("Error " + err);
  }
};

churchOperationalDays = [
  { code: "0", label: "Minggu" },
  { code: "1", label: "Senin" },
  { code: "2", label: "Selasa" },
  { code: "3", label: "Rabu" },
  { code: "4", label: "Kamis" },
  { code: "5", label: "Jumat" },
  { code: "6", label: "Sabtu" },
];

function basicStyle(message, type) {
  let style = {
    html: '<div style="color: white; text-align: left">' + message + "</div>",
    backdrop: false,
    position: "top-right",
    timer: 2000,
    showConfirmButton: false,
    width: "300px",
    customClass: {
      header: "align-items-unset padding-0",
      content: "align-items-unset padding-0",
    },
    allowOutsideClick: false,
  };
  if (type == "success") {
    style.background = "#087830";
    style.title = '<div style="color: white; text-align: left;">Sukses</div>';
  } else if (type == "fail") {
    style.background = "#F47174";
    style.title = '<div style="color: white; text-align: left;">Error</div>';
  }
  return style;
}

// successAlert = function (message) {
//   if (typeof message === "undefined") {
//     message = "Berhasil!";
//   }
//   Swal.fire(basicStyle(message, "success"));
// };

successAlert = function (message) {
  if (typeof message === "undefined") {
    message = "Berhasil!";
  }
  Swal.fire(basicStyle(message, "success"));
};
(loadingAlert = function (message) {
  Swal.fire({
    title: "Mohon tunggu!",
    html: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
      // Meteor.call("getPairings", function (error, result) {
      //   if (error) {
      //     Bert.alert({
      //       title: "Error",
      //       message: "Gagal mendapatkan daftar evaluasi",
      //       type: "danger",
      //       style: "growl-top-right",
      //       icon: "fa-times",
      //     });
      //     Swal.close()
      //   } else {
      //     self.assesseesList.set(result);
      //     console.log(result);
      //     self.nowLoading.set(false);
      //     Swal.close()
      //   }
      // });
    },
  });
}),
  (successAlertBack = function (message) {
    if (typeof message === "undefined") {
      message = "Berhasil!";
    }
    Swal.fire(basicStyle(message, "success"));
    history.back();
  });

failAlert = function (message) {
  if (typeof message === "object" && message !== null) {
    message = message.reason;
  }
  Swal.fire(basicStyle(message, "fail"));
};

function isNumber(value) {
  return /^\d+$/.test(value);
}

function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters from the phone number
  const cleanedNumber = phoneNumber.toString().replace(/\D/g, "");

  // Check if the number starts with '0', indicating it's a local number
  if (cleanedNumber.startsWith("0")) {
    // Remove the leading '0' and prepend the country code '62'
    const formattedNumber = "62" + cleanedNumber.slice(1);
    return formattedNumber;
  }

  // The number is already in international format, return as is
  return cleanedNumber;
}

function formatRupiah(angka, prefix) {
  var number_string = angka.replace(/[^,\d]/g, "").toString(),
    split = number_string.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  // tambahkan titik jika yang di input sudah menjadi angka ribuan
  if (ribuan) {
    separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  console.log(rupiah);
  return rupiah;
}

function convert2number(data) {
  let temp = data.replace(/\./g, ""); // merubah . jadi ""
  return parseFloat(temp);
}

export const startSelect2 = function () {
  setTimeout(() => {
    $(".select2").select2();
  }, 300);
};

/* Tujuan:
-Inisiasi WYSIWYG menggunakan CKEditor 5 DecoupledEditor
-Agar proses inisiasi cukup memanggil method ini tanpa perlu tulis kodingan inisiasi berulang-ulang */
initEditor = async function (template, options) {
  /*     Deskripsi :
    Function ini akan memulai pembuatan WYSIWYG menggunakan Id Elemen yang disediakan
    dan menghasilkan editor yang disimpan di template.editor*/
  let editorEl = "editor";
  let toolbarEl = "toolbar-container";
  let content = "";
  let templateField = "editor";
  if (options) {
    // console.log(options)
    if (options.editorEl) {
      editorEl = options.editorEl;
    }
    if (options.toolbarEl) {
      toolbarEl = options.toolbarEl;
    }
    if (options.content) {
      content = options.content;
    }
    if (options.templateField) {
      templateField = options.templateField;
    }
  }
  DecoupledEditor.create(document.querySelector("#" + editorEl), {
    image: {
      toolbar: [
        "imageStyle:full",
        "imageStyle:side",
        "imageStyle:alignLeft",
        "imageStyle:alignCenter",
        "imageStyle:alignRight",
        "|",
        "imageStyle:sideLeft",
        "|",
        "imageTextAlternative",
        "toggleImageCaption",
      ],
    },
  })
    .then((editor) => {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
      };
      // Jika .create-nya selesai maka akan menghasilkan editor di parameternya
      // Ini untuk toolbarnya yang seperti MS Word
      const toolbarContainer = document.querySelector("#" + toolbarEl);
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
      editor.setData(content);
      // Ini diperlukan agar template pemanggilnya bisa mengakses nilainya

      template[templateField].set(editor);
    })
    .catch((error) => {
      console.log(error);
    });
};

initMultipleEditor = async function (id, template, options) {
  /*     Deskripsi :
    Function ini akan memulai pembuatan WYSIWYG menggunakan Id Elemen yang disediakan
    dan menghasilkan editor yang disimpan di template.editor*/
  let editorEl = "editor-" + id;
  let toolbarEl = "toolbar-container-" + id;
  let content = "";
  let templateField = "editor";
  if (options) {
    // console.log(options)
    if (options.editorEl) {
      editorEl = options.editorEl;
    }
    if (options.toolbarEl) {
      toolbarEl = options.toolbarEl;
    }
    if (options.content) {
      content = options.content;
    }
    if (options.templateField) {
      templateField = options.templateField;
    }
  }
  DecoupledEditor.create(document.querySelector("#" + editorEl), {
    image: {
      toolbar: [
        "imageStyle:full",
        "imageStyle:side",
        "imageStyle:alignLeft",
        "imageStyle:alignCenter",
        "imageStyle:alignRight",
        "|",
        "imageStyle:sideLeft",
        "|",
        "imageTextAlternative",
        "toggleImageCaption",
      ],
    },
  })
    .then((editor) => {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
      };

      // Jika .create-nya selesai maka akan menghasilkan editor di parameternya
      // Ini untuk toolbarnya yang seperti MS Word
      const toolbarContainer = document.querySelector("#" + toolbarEl);
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
      editor.setData(content);
      // Ini diperlukan agar template pemanggilnya bisa mengakses nilainya

      template[templateField].set(editor);
    })
    .catch((error) => {
      console.error(error);
    });
};

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
    // this.url = '/uploadsApi/';
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          this._initListeners(file, resolve, reject);
        })
    );
  }
  async _initListeners(file, resolve, reject) {
    const s3Client = new S3({
      endpoint: Meteor.settings.public.s3.endpoint,
      region: Meteor.settings.public.s3.region,
      credentials: {
        accessKeyId: Meteor.settings.public.s3.credentials.accessKeyId,
        secretAccessKey: Meteor.settings.public.s3.credentials.secretAccessKey,
      },
    });
    try {
      const today = moment(new Date()).format("MMDDYYhhmmss");
      await s3Client.send(
        new PutObjectCommand({
          Bucket: "imavistatic",
          Key: file.name + "-pastoral" + today + file.name.split(".")[1],
          Body: file,
          ACL: "public-read",
        })
      );
      resolve({
        default:
          "https://imavistatic.sgp1.digitaloceanspaces.com/" +
          file.name +
          "-pastoral" +
          today +
          file.name.split(".")[1],
      });
    } catch (err) {
      reject();
      console.log("Error", err);
    }
  }
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
}

confirmationAlertAsync = async function (additionalMessage) {
  if (typeof message === "undefined") {
    additionalMessage = "";
  }
  try {
    let result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah anda yakin? " + additionalMessage,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    });
    return result;
  } catch (e) {
    console.error(e);
  }
};

checkValid = function (data) {
  switch (data) {
    case "":
      return false;
    case "null":
      return false;
    case null:
      return false;
    case undefined:
      return false;
    default:
      return true;
  }
};

checkSlug = async function (code, options) {
  /*     Deskripsi :
    Function ini akan mengembalikan promise yang akan
    dichain dengan proses lainnya */
  return await new Promise((resolve, reject) => {
    // Merupakan id textbox yang digunakan untuk edit nilai slugnya
    // jika tidak disertakan di option maka nilai defaultnya adalah 'slug'
    let inputId = "slug";
    if (options) {
      if (options.inputId) {
        inputId = options.inputId;
      }
    }
    // Untuk sanitize slugnya mengingat slugnya bisa diedit
    // setelah sanitize masukkin ke textboxnya
    const slug = slugify($("#" + inputId).val(), {
      lower: true,
      strict: true,
    });
    $("#" + inputId).val(slug);
    if (checkValid(slug) && slug.length <= 60) {
      const body = {
        code,
        slug,
        dbField: "slug", // Field apa yang digunakan collection untuk menampung slugnya
      };
      if (options) {
        if (options.editId) {
          // Menjamin agar saat proses edit dan slugnya tidak berubah
          // , tidak dianggap error oleh methodnya
          body.editId = options.editId;
        }
        if (options.dbField) {
          body.dbField = options.dbField;
        }
      }
      // Jika error atau nilainya tidak sesuai gunakan reject
      // Gunakan resolve untuk mengembalikan hasil yang akan dipakai proses berikutnya
      Meteor.call("cim-checkSlug", body, function (error, result) {
        if (error) {
          failAlert(error);
          reject(error.reason);
        } else if (result) {
          failAlert("Silahkan gunakan slug yang lain");
          reject("Silahkan gunakan slug yang lain");
        } else {
          resolve(slug);
        }
      });
    } else {
      failAlert("Slug harus ada dan panjangnya maksimum 60 karakter");
    }
  });
};

enterLoading = function () {
  $("button").attr("disabled", true);
  $("body").addClass("loading");
};

exitLoading = function (successState, callback) {
  if (successState) {
    $("button").attr("disabled", false);
    $("body").removeClass("loading");
    if (callback) {
      callback();
    }
  } else {
    $("button").attr("disabled", false);
    $("body").removeClass("loading");
    if (callback) {
      callback();
    }
  }
};
