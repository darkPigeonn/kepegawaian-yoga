import "./employee.html";
import "../../components/card/card";
import "../../components/tables/tables";
import "../../components/select/select";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from "papaparse";
import { result } from "underscore";
import { HTTP } from "meteor/http";
import {
  enterLoading,
  exitLoading,
  startSelect2,
} from "../../../startup/client";

Template.employee_page.onCreated(function () {
  const self = this;
  isLoading(true);
  self.employees = new ReactiveVar();
  self.filter = new ReactiveVar({
    type: "",
    data: "",
  });
  self.jabatanLogin = new ReactiveVar();
  const userId = Meteor.userId();

  Meteor.call("employee.getAll", function (error, result) {
    if (result) {
      // console.log(result);
      self.employees.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call("employee.getDataLogin", userId, function (error, result) {
    if (result) {
      const dataRole = result[0];
      self.jabatanLogin.set(dataRole);
    } else {
      console.log(error);
    }
  });
  setTimeout(() => {
    new DataTable("#table-pegawai", {
      responsive: true,
      order: [[0, "asc"]],
    });
    isLoading(false);
  }, 1000);
});

Template.employee_page.helpers({
  employees() {
    const t = Template.instance();
    const employee = t.employees.get();
    const filter = t.filter.get();
    // console.log(employee);
    if (employee) {
      const result = employee.filter((x) => {
        const query = filter.data.toString().toLowerCase();
        if (filter.type == "job_position") {
          return x.job_position.toString().toLowerCase().includes(query);
        }
        if (filter.type == "start_date") {
          const thisStartDate = x.start_date;
          return moment(thisStartDate).format("YYYY").includes(query);
        }
        if (filter.type == "masa_jabatan") {
          const thisStartDate = x.start_date;
          const diff = moment().diff(thisStartDate, "year");
          return diff.toString().includes(query);
        }
        if (filter.type == "department_unit") {
          return x.department_unit.toString().toLowerCase().includes(query);
        }
        if (filter.type == "full_name") {
          return x.full_name.toString().toLowerCase().includes(query);
        }
        return true;
      });
      // console.log(result);
      return result;
    } else {
      return [];
    }
  },
  jabatanLogin() {
    return Template.instance().jabatanLogin.get();
  },
});

Template.employee_page.events({
  "click #btn_delete"(e, t) {
    e.preventDefault();

    const id = e.target.getAttribute("data-id");
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete pegawai ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("employee.remove", id, function (error, result) {
          if (result) {
            // alert("Delete Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Delete berhasil",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          } else {
            Swal.fire({
              title: "Gagal",
              text: "Delete gagal",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            console.log(error);
          }
        });
      }
    });

    // console.log(id);
  },
  "input .filter"(e, t) {
    e.preventDefault();

    const type = $("#input_type").val();
    const data = $("#input_data").val();
    t.filter.set({
      type,
      data,
    });
  },
  "change .filter"(e, t) {
    // e.preventDefault();

    const type = $("#input_type").val();
    const data = $("#input_data").val();
    t.filter.set({
      type,
      data,
    });
  },
});

Template.employee_create.onCreated(function () {
  const self = this;

  self.departements = new ReactiveVar();
  self.viewMode = new ReactiveVar("1");
  self.listSchool = new ReactiveVar();
  Meteor.call("departement.getAll", function (error, result) {
    if (result) {
      // console.log(result);
      self.departements.set(result);
      isLoading(false);
    } else {
      console.log(error);
      isLoading(false);
    }
  });

  Meteor.call("schools.getAll", function (error, result) {
    if (result) {
      self.listSchool.set(result);
      // startSelect2();
    } else {
      console.log("Gagal", error);
    }
  });
});

Template.employee_create.helpers({
  departements() {
    return Template.instance().departements.get();
  },
  listSchool() {
    return Template.instance().listSchool.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
});

Template.employee_create.events({
  "keyup #input_baseSalery"(e, t) {
    const idInput = $("#input_baseSalery").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "keyup #input_allowances"(e, t) {
    const idInput = $("#input_allowances").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "keyup #input_deductions"(e, t) {
    const idInput = $("#input_deductions").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "click .change-page"(e, t) {
    const val = $(e.target).val();
    t.viewMode.set(val);
  },

  "change #select_school": function (e, t) {
    const listSchool = t.listSchool.get();

    const id = e.target.value;
    const findSchool = listSchool.find((item) => {
      return item._id === id;
    });
    if (!findSchool) {
      alert("Data sekolah tidak lengkap");
    }

    $("#input_perwakilan").val(findSchool.unitName);
    $("#input_cityUnit").val(findSchool.city);
    $("#input_npsn").val(findSchool.npsn);
    $("#input_jenjang").val(findSchool.jenjang);
  },

  async "click #btn_save"(e, t) {
    e.preventDefault();
    // info diri
    const formData = {
      fullName: $("#input_fullName").val(),
      gelar: $("#input_gelar").val(),
      nik: $("#input_identificationNumber").val(),
      pob: $("#input_placeOfBirth").val(),
      dob: new Date($("#input_dateOfBirth").val()),
      religion: $("#input_religi").val(),
      gender: $("#input_gender").val(),
      blood: $("#input_golonganDarah").val(),
      motherName: $("#input_motherName").val(),
      npwp: $("#input_npwp").val(),
      address: $("#input_address").val(),
      marital_status: $("#select_marrital").val(),
      totalChildren: $("#input_numberOfChildren").val(),
      postalCode: $("#input_postal").val(),
      unit: {
        school: $("#select_school").val(),
        npsn: $("#input_npsn").val(),
        jenjang: $("#input_jenjang").val(),
        perwakilan: $("#input_perwakilan").val(),
        cityUnit: $("#input_cityUnit").val(),
      },
      pendidikan: {
        hightEducation: $("#select_highEducation").val(),
        nameIntitution: $("#input_educationInstitution").val(),
        major: $("#input_major").val(),
        yearGraduated: $("#input_educationGraduate").val(),
      },
      pekerjaan: {
        startDateWorking: new Date($("#input_startDateWorking").val()),
        startDateWorkSk: new Date($("#input_startDateWorkSk").val()),
        startDateAngkatanSk: new Date($("#input_startDateAngkatanSk").val()),
        endDateWorkSk: new Date($("#input_endDateWorkSk").val()),
        statusEmployee: $("#input_employmentStatus").val(),
        tuk: $("#input_tuk").val(),
        position: $("#selected_position").val(),
        gol: $("#selected_gol").val(),
        nuptk: $("#input_nuptk").val(),
        sertifikasiNumber: $("#input_sertifikasiNumber").val(),
        sertifikasiNumber2: $("#input_sertifikasiNumber2").val(),
        nuks: $("#input_nuks").val(),
      },
      asuransi: {
        bpjsTK: $("#input_bpjsTK").val(),
        startDateBpjsTK: new Date($("#input_dateBpjsTK").val()),
        amountBpjsTK: $("#input_amountBpjsTK").val(),
        npp: $("#input_npp").val(),
        companyName: $("#input_companyName").val(),
        bpjsKS: $("#select_kepesertaanBpjsKes").val(),
        startDateBpjsKS: new Date($("#input_dateBpjsKS").val()),
        amountBpjsKS: $("#input_amountBpjsKS").val(),
        note: $("#input_noteBpjsKS").val(),
      },
    };

    if (!linkGambar) {
      Swal.fire({
        title: "Warning",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak",
        text: "Gambar gagal diupload, apakah anda ingin melanjutkan unggah data pegawai",
      }).then((result) => {
        if (result.isConfirmed) {
          data.linkGambar = "";
          Meteor.call("employee.insert", formData, function (error, result) {
            if (result) {
              // alert("Sukses");
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  history.back();
                }
              });
              // location.reload();
            } else {
              Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
              console.log(error);
            }
          });
        }
      });
    } else {
      Swal.fire({
        title: "Warning",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak",
        text: "Apakah anda ingin menyimpan data pegawai ini",
      }).then((result) => {
        if (result.isConfirmed) {
          Meteor.call("employee.insert", formData, function (error, result) {
            if (result) {
              // alert("Sukses");
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  history.back();
                }
              });
              // location.reload();
            } else {
              Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
              console.log(error);
            }
          });
        }
      });
    }
  },
});

Template.inputFilesV2.onCreated(function () {
  const self = this;
  const data = self.data;
  self.file = new ReactiveVar();
  self.preview = new ReactiveVar();
  // for (const key in data) {
  //   console.log(key);
  // }
  // console.log(data);
  // console.log("mmasuk");
  if (data.src) {
    self.preview.set([
      {
        preview: data.src,
        type: "image",
      },
    ]);
  }

  Template.inputFilesV2.helpers({
    files() {
      return Template.instance().file.get();
    },
    preview() {
      return Template.instance().preview.get();
    },
  });
  Template.inputFilesV2.events({
    "change .fileUpload"(e, t) {
      // if(!actiontick())return
      const file = e.target.files[0];
      // const preview = $('#preview')
      // console.log(file)
      // console.log("masuk change");
      if (file) {
        t.file.set(file);
        t.preview.set([
          {
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
      }
    },
    "click .remove-image"(e, t) {
      // if(!actiontick())return
      const thisMilik = $(e.target).attr("milik");
      // console.log(thisMilik);
      const hasMilik = $(e.target).hasClass(thisMilik);
      if (hasMilik) {
        t.preview.set(null);
        $("#" + thisMilik).val(null);
      }
    },
  });
});

Template.employee_detail.onCreated(function () {
  const self = this;

  self.employee = new ReactiveVar();
  // self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");
  // console.log(id);
  self.viewMode = new ReactiveVar("0");

  Meteor.call("employee.getBy", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.employee.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_detail.helpers({
  employee() {
    return Template.instance().employee.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
});

Template.employee_detail.events({
  "click .submenu"(e, t) {
    const milik = $(e.target).attr("milik");
    $(".submenu").removeClass("active");
    $(e.target).addClass("active");
    t.viewMode.set(milik);
  },
  "click #btn-tambah-akun"(e, t) {
    e.preventDefault();
    const fullName = t.employee.get().full_name;
    const email = t.employee.get().email_address;
    const dob = moment(t.employee.get().dob).format("DD-MM-YYYY");
    const splitDob = dob.split("-");
    const jabatan = t.employee.get().job_position;
    const user = Meteor.user();
    const tempPassword = splitDob[0] + splitDob[1] + splitDob[2];
    const password = tempPassword;
    const partner = t.employee.get().partnerCode;
    const profileId = FlowRouter.getParam("_id");
    let roles = [];
    if (partner == "imavi") {
      roles.push("staff");
    }
    const body = {
      fullName,
      email,
      password,
      jabatan,
      outlets: [partner],
      partners: [partner],
      roles,
      dob,
    };
    Swal.fire({
      title: "Konfirmasi Buat Akun APP",
      text: "Apakah anda yakin membuat akun untuk APP",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Buat",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "employee.createApp",
          body,
          profileId,
          function (error, result) {
            if (result) {
              Swal.alert;
              Swal.fire({
                title: "Berhasil",
                text: `Akun APP berhasil dibuat dengan username ${email} dan password ${partner}.${password}`,
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            } else {
              if (error.error == 412) {
                Swal.fire({
                  title: "Gagal",
                  text: "Akun APP gagal dibuat, cek kembali bila user ini sudah memiliki akun APP",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              } else {
                Swal.fire({
                  title: "Gagal",
                  text: "Sistem bermasalah, silahkan hubungi administrasi",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
              // location.reload();
            }
          }
        );
      }
    });
  },
  "click #btn-tambah-akun-user"(e, t) {
    e.preventDefault();
    Swal.fire({
      title: "Konfirmasi Tambah User Pegawai",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        const email = t.employee.get().email_address;
        const fullName = t.employee.get().full_name;
        const role = [];
        const id = FlowRouter.getParam("_id");

        const dataSend = {
          username: email,
          password: email,
          fullname: fullName,
          role,
          idEmployee: id,
        };

        Meteor.call(
          "users.createAppMeteorEmployee",
          dataSend,
          function (error, result) {
            if (result) {
              // alert("Sukses");
              if (result.error == 403) {
                return Swal.fire({
                  title: "Gagal",
                  text: "Data gagal dimasukkan, username sudah ada",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
              Swal.fire({
                title: "Berhasil",
                text: `Data berhasil dimasukkan, user memiliki username ${dataSend.username} dan password ${dataSend.password}`,
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                }
              });
              // location.reload();
            } else {
              Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan, cek kembali data yang dimasukkan",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              // alert("Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya");
              console.log(error);
            }
          }
        );
      }
    });
  },
});

Template.employee_detail_academicJob.onCreated(function () {
  const self = this;

  self.employee = new ReactiveVar();
  // self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");
  // console.log(id);

  Meteor.call("employee.getBy", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.employee.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_detail_academicJob.helpers({
  employee() {
    return Template.instance().employee.get();
  },
});

Template.employee_detail_emergencyContact.onCreated(function () {
  const self = this;

  self.employee = new ReactiveVar();
  // self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");
  // console.log(id);

  Meteor.call("employee.getBy", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.employee.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_detail_emergencyContact.helpers({
  employee() {
    return Template.instance().employee.get();
  },
});

Template.employee_detail_config.onCreated(function () {
  const self = this;

  self.employee = new ReactiveVar();
  // self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");
  // console.log(id);

  Meteor.call("employee.getBy", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.employee.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_detail_config.helpers({
  employee() {
    return Template.instance().employee.get();
  },
});

Template.employee_detail_config.events({
  async "click #btn_saveWebsite"(e, t) {
    e.preventDefault();
    const passwordBaru = $("#input_passwordWebsite").val();
    const id = FlowRouter.getParam("_id");
    Swal.fire({
      title: "Warning",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
      text: "Apakah anda yakin ingin mengubah password akun website",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "usersEmployee.editPassword",
          id,
          passwordBaru,
          function (error, result) {
            if (result) {
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  history.back();
                }
              });
            } else {
              Swal.fire({
                title: "Gagal",
                text: "Data gagal diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              console.log(error);
            }
          }
        );
      }
    });
  },

  async "click #btn_saveApp"(e, t) {
    e.preventDefault();
    const passwordBaru = $("#input_passwordAplikasi").val();
    const id = FlowRouter.getParam("_id");
    console.log(passwordBaru, id);
    Swal.fire({
      title: "Warning",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
      text: "Apakah anda yakin ingin mengubah password akun website",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call(
          "usersEmployee.editPasswordApp",
          id,
          passwordBaru,
          function (error, result) {
            if (result) {
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  history.back();
                }
              });
            } else {
              Swal.fire({
                title: "Gagal",
                text: "Data gagal diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              console.log(error);
            }
          }
        );
      }
    });
  },
});

Template.employee_edit.onCreated(function () {
  const self = this;

  self.employee = new ReactiveVar();
  self.listSchool = new ReactiveVar();
  self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");

  // console.log(id);
  Meteor.call("employee.getBy", id, function (error, result) {
    if (result) {
      // console.log(result);
      self.employee.set(result);

      // //set otomatis berdasarkan field input
      // const listItem = Object.keys(result);
      // for (let item of listItem) {
      //   let field = result[item];
      //   console.log(item, "=>", field);
      //   $(`#input_${item}`).val("hallo");
      // }

      //set untuk selected
      $("#input_religi").val(result.religion);
      $("#input_gender").val(result.gender);
      $("#input_golonganDarah").val(result.blood);
      $("#select_marrital").val(result.marital_status);
      $("#input_employmentStatus").val(result.pekerjaan.statusEmployee);
      $("#selected_position").val(result.pekerjaan.position);
      $("#selected_gol").val(result.pekerjaan.gol);

      // setTimeout(() => {
      //   $("#select_school").val(result.unit.school);
      //   alert(result.unit.school);
      // }, 1000);

      //input
      $("#input_motherName").val(result.motherName);
      $("#input_npwp").val(result.npwp);
      $("#input_address").val(result.address);
      $("#input_address").val(result.address);
      $("#input_numberOfChildren").val(result.totalChildren);
      $("#input_postal").val(result.postalCode);
      //unit
      $("#input_npsn").val(result.unit.npsn);
      $("#input_jenjang").val(result.unit.jenjang);
      $("#input_perwakilan").val(result.unit.perwakilan);
      $("#input_cityUnit").val(result.unit.cityUnit);
      //pekerjaan
      $("#input_tuk").val(result.pekerjaan.tuk);
      $("#input_tuk").val(result.pekerjaan.tuk);
      $("#input_notePosition").val(result.pekerjaan.positionNote);
      $("#input_nuptk").val(result.pekerjaan.nuptk);
      $("#input_sertifikasiNumber").val(result.pekerjaan.sertifikasiNumber);
      $("#input_sertifikasiNumber2").val(result.pekerjaan.sertifikasiNumber2);
      $("#input_nuks").val(result.pekerjaan.nuks);
    } else {
      console.log(error);
    }
  });

  //
  Meteor.call("schools.getAll", function (error, result) {
    if (result) {
      self.listSchool.set(result);
      // startSelect2();
    } else {
      console.log("Gagal", error);
    }
  });
});

Template.employee_edit.helpers({
  employee() {
    return Template.instance().employee.get();
  },
  listSchool() {
    return Template.instance().listSchool.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
});

Template.employee_edit.events({
  "keyup #input_baseSalery"(e, t) {
    const idInput = $("#input_baseSalery").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "keyup #input_allowances"(e, t) {
    const idInput = $("#input_allowances").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "keyup #input_deductions"(e, t) {
    const idInput = $("#input_deductions").val();
    e.target.value = formatRupiah(idInput, "Rp. ");
    // console.log(e.target.value);
  },
  "click .change-page"(e, t) {
    const val = $(e.target).val();
    t.viewMode.set(val);
    const employee = t.employee.get();
    if (t.viewMode.get() === "2") {
      const pendidikan = employee.pendidikan;
      $("#select_highEducation").val(pendidikan.hightEducation);
      $("#input_educationInstitution").val(pendidikan.nameIntitution);
      $("#input_major").val(pendidikan.major);
      $("#input_educationGraduate").val(pendidikan.yearGraduated);
      //bpjs
      $("#input_amountBpjsTK").val(result.asuransi.amountBpjsTK ?? 0);
      $("#input_npp").val(result.asuransi.npp);
      $("#input_companyName").val(result.asuransi.companyName);
      $("#select_kepesertaanBpjsKes").val(result.asuransi.bpjsKS);
      $("#input_amountBpjsKS").val(result.asuransi.amountBpjsKS ?? 0);
      $("#input_noteBpjsKS").val(result.asuransi.noteBpjsKS);
    }
    if (t.viewMode.get() === "3") {
      $("#input_phoneNumber").val(result.asuransi.phoneNumber);
      $("#input_emauk").val(result.asuransi.email);
    }
  },
  async "click #btn_update"(e, t) {
    e.preventDefault();
    const id = FlowRouter.getParam("_id");
    const formData = {
      fullName: $("#input_fullName").val(),
      gelar: $("#input_gelar").val(),
      nik: $("#input_identificationNumber").val(),
      pob: $("#input_placeOfBirth").val(),
      dob: new Date($("#input_dateOfBirth").val()),
      religion: $("#input_religi").val(),
      gender: $("#input_gender").val(),
      blood: $("#input_golonganDarah").val(),
      motherName: $("#input_motherName").val(),
      npwp: $("#input_npwp").val(),
      address: $("#input_address").val(),
      marital_status: $("#select_marrital").val(),
      totalChildren: $("#input_numberOfChildren").val(),
      postalCode: $("#input_postal").val(),
      unit: {
        school: $("#select_school").val(),
        npsn: $("#input_npsn").val(),
        jenjang: $("#input_jenjang").val(),
        perwakilan: $("#input_perwakilan").val(),
        cityUnit: $("#input_cityUnit").val(),
      },
      pendidikan: {
        hightEducation: $("#select_highEducation").val(),
        nameIntitution: $("#input_educationInstitution").val(),
        major: $("#input_major").val(),
        yearGraduated: $("#input_educationGraduate").val(),
      },
      pekerjaan: {
        startDateWorking: $("#input_startDateWorking").val(),
        startDateWorkSk: $("#input_startDateWorkSk").val(),
        startDateAngkatanSk: $("#input_startDateAngkatanSk").val(),
        endDateWorkSk: $("#input_endDateWorkSk").val(),
        statusEmployee: $("#input_employmentStatus").val(),
        tuk: $("#input_tuk").val(),
        position: $("#selected_position").val(),
        gol: $("#selected_gol").val(),
        nuptk: $("#input_nuptk").val(),
        sertifikasiNumber: $("#input_sertifikasiNumber").val(),
        sertifikasiNumber2: $("#input_sertifikasiNumber2").val(),
        nuks: $("#input_nuks").val(),
      },
      asuransi: {
        bpjsTK: $("#input_bpjsTK").val(),
        startDateBpjsTK: $("#input_dateBpjsTK").val(),
        amountBpjsTK: $("#input_amountBpjsTK").val(),
        npp: $("#input_npp").val(),
        companyName: $("#input_companyName").val(),
        bpjsKS: $("#select_kepesertaanBpjsKes").val(),
        startDateBpjsKS: $("#input_dateBpjsKS").val(),
        amountBpjsKS: $("#input_amountBpjsKS").val(),
        note: $("#input_noteBpjsKS").val(),
      },
    };
    Swal.fire({
      title: "Warning",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
      text: "Apakah anda yakin ingin update data pegawai",
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.call("employee.update", id, formData, function (error, result) {
          if (result) {
            // console.log(result);
            // alert("Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil diupdate",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if (result.isConfirmed) {
                history.back();
              }
            });
          } else {
            // alert("Update employee error");
            Swal.fire({
              title: "Gagal",
              text: "Data gagal diupdate",
              showConfirmButton: true,
              allowOutsideClick: true,
            });
            console.log(error);
          }
        });
      }
    });
  },
});

Template.employee_mutation.onCreated(function () {
  const self = this;
  self.employee = new ReactiveVar();
  self.departements = new ReactiveVar();
  self.viewMode = new ReactiveVar("1");
  const id = FlowRouter.getParam("_id");
  // console.log(id);
  Meteor.call("employee.getBy", id, function (error, result) {
    // console.log(result);
    if (result) {
      self.employee.set(result);
    } else {
      console.log(error);
    }
  });

  Meteor.call("departement.getAll", function (error, result) {
    if (result) {
      // console.log(result);
      self.departements.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_mutation.helpers({
  employee() {
    return Template.instance().employee.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
  departements() {
    return Template.instance().departements.get();
  },
});

Template.employee_mutation.events({
  "click .btn-add-mutation"(e, t) {
    e.preventDefault();

    const mode = $(e.target).attr("milik");
    let value = "0";
    if (mode == "1") {
      value = "2";
    } else {
      value = "1";
    }

    t.viewMode.set(value);
  },

  "click #btn_save"(e, t) {
    e.preventDefault();

    const departement_unit = $("#input_departemen").val();
    const id = FlowRouter.getParam("_id");
    console.log(departement_unit, id);
    if (!departement_unit) {
      Swal.fire({
        title: "Gagal",
        text: "Nama Departement harus diisi",
        showConfirmButton: true,
        allowOutsideClick: true,
      });
      return;
    }
    Meteor.call(
      "employee.mutasiInsert",
      id,
      departement_unit,
      function (error, result) {
        if (result) {
          Swal.fire({
            title: "Berhasil",
            text: "Data berhasil dimasukkan",
            showConfirmButton: true,
            allowOutsideClick: true,
          }).then((result) => {
            if (result.isConfirmed) {
              history.back();
            }
          });
          // alert("sukses");
        } else {
          Swal.fire({
            title: "Gagal",
            text: "Data mutasi gagal dimasukkan",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
          // alert("Insert Mutation Error");
          console.log(error);
        }
      }
    );
  },
});

Template.upload_CSV.onCreated(function () {
  const self = this;
  self.items = new ReactiveVar([]);
  isLoading(false);
});

Template.upload_CSV.helpers({
  items() {
    return Template.instance().items.get();
  },
});

Template.upload_CSV.events({
  "change #csvFile"(e, t) {
    e.preventDefault();
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    //pakai yoga dulu ya
    const reader = new FileReader();
    let dataJson = [];

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[1]; // Ambil nama sheet pertama
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      for (let index = 3; index < jsonData.length; index++) {
        const element = jsonData[index];

        if (element[0]) {
          console.log(element);
          const newData = {
            niy: element[0],
            fullName: element[1],
            gelar: element[2],
            nik: element[14],
            pob: element[8],
            dob: element[9],
            religion: element[13],
            gender: element[11],
            blood: element[12],
            motherName: element[16],
            npwp: element[15],
            address: element[20],
            marital_status: element[22],
            totalChildren: element[23],
            postalCode: element[21],
            unit: {
              school: element[4],
              npsn: element[7],
              jenjang: element[5],
              perwakilan: element[3],
              cityUnit: element[3],
            },
            pendidikan: {
              hightEducation: element[17],
              nameIntitution: "-",
              major: element[18],
              yearGraduated: element[19],
            },
            pekerjaan: {
              startDateWorking: element[26],
              workPeriod: element[27],
              startDateWorkSk: element[28],
              startDateAngkatanSk: element[31],
              endDateWorkSk: element[29],
              statusEmployee: element[30],
              tuk: element[32],
              position: element[33],
              positionNote: element[34],
              gol: element[35],
              nuptk: element[36],
              sertifikasiNumber: element[37],
              sertifikasiNumber2: element[38],
              nuks: element[39],
            },
            asuransi: {
              bpjsTK: element[40],
              startDateBpjsTK: element[41],
              amountBpjsTK: element[42],
              npp: element[43],
              companyName: element[44],
              bpjsKS: element[45],
              startDateBpjsKS: element[46],
              amountBpjsKS: element[47],
              note: element[48],
            },
            phoneNumber: element[24],
            email: element[25],
          };
          dataJson.push(newData);
        }
        // if (element.length < 1) {
        //   index = jsonData.length;
        // } else {
        //   const indexKodeItem = 1;
        //   const indexKodePenilaian = 3;
        //   const indexAlasan = 4;
        //   const indexRencana = 5;

        //   //repair data kode item
        //   const codeItem = element[indexKodeItem]
        //     .split(":")[1]
        //     .split("\n")[0]
        //     .replace(" ", "");

        //   const newData = {
        //     namaSekolah: element[indexNameSchool],
        //     codeItemPertanyaan: codeItem,
        //     codePenilaian: element[indexKodePenilaian],
        //     reason: element[indexAlasan],
        //     plan: element[indexRencana],
        //   };
        //   listItems.push(newData);
        // }
      }
      t.items.set(dataJson);
    };
    reader.readAsArrayBuffer(file);
    // if (file) {
    //   Papa.parse(file, {
    //     header: true,
    //     dynamicTyping: true,
    //     skipEmptyLines: true,
    //     complete: function (results) {
    //       const parsedData = results.data;
    //       console.log(parsedData);
    //       const data = [
    //         "full_name",
    //         "identification_number",
    //         "place_of_birth",
    //         "dob",
    //         "gender",
    //         "address",
    //         "phone_number",
    //         "email_address",
    //         "job_position",
    //         "department_unit",
    //         "start_date",
    //         "employment_status",
    //         "base_salary",
    //         "allowances",
    //         "deductions",
    //         "highest_education",
    //         "education_institution",
    //         "major_in_highest_education",
    //         "academic_degree",
    //         "previous_work_experience",
    //         "marital_status",
    //         "number_of_children",
    //         "emergency_contact_name",
    //         "emergency_contact_phone",
    //         // 'employment_history',
    //         // 'partnerCode',
    //         "linkGambar",
    //         "golongan",
    //       ];
    //       // console.log(data);
    //       const arr = [];
    //       for (const thisData of parsedData) {
    //         const formData = {};
    //         for (const i of data) {
    //           formData[i] = thisData[i];
    //         }
    //         arr.push(formData);
    //       }
    //       console.log(arr);
    //       const filteredArr = arr.filter((obj, index) => {
    //         if (index !== arr.length - 1 && obj.full_name === null) {
    //           Swal.fire({
    //             title: "Warning",
    //             text: "Ada data yang tidak terdapat nama lengkap sehingga tidak ditampilkan pada preview",
    //             showConfirmButton: true,
    //             allowOutsideClick: true,
    //           });
    //           return false;
    //         }
    //         if (index == arr.length - 1 && obj.full_name === null) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       // console.log(filteredArr);
    //       t.items.set(filteredArr);
    //     },
    //   });
    // }
  },
  "submit #csvForm"(e, t) {
    e.preventDefault();
    enterLoading();
    //Pakai Yoga dulu
    const items = t.items.get();
    Meteor.call("employee.insertXlsx", items, function (error, result) {
      if (result) {
        alert("Berhasil");
        FlowRouter.go("/");
        exitLoading();
      } else {
        alert("error");
        exitLoading();
      }
    });

    // const fileInput = document.getElementById("csvFile");
    // const file = fileInput.files[0];
    // // console.log(file);
    // if (file) {
    //   Papa.parse(file, {
    //     header: true,
    //     dynamicTyping: true,
    //     skipEmptyLines: true,
    //     complete: function (results) {
    //       const parsedData = results.data;
    //       // console.log(typeof parsedData[0].identification_number);
    //       console.log(parsedData);
    //       for (const i of parsedData) {
    //         i.start_date = new Date(i.start_date);
    //         i.date_of_birth = new Date(i.date_of_birth);
    //         const day = i.start_date.getDate().toString().padStart(2, "0");
    //         const month = (i.start_date.getMonth() + 1)
    //           .toString()
    //           .padStart(2, "0");
    //         const year = i.start_date.getFullYear();
    //         const formattedDate = `${day}/${month}/${year}`;
    //         const dayBirth = i.date_of_birth
    //           .getDate()
    //           .toString()
    //           .padStart(2, "0");
    //         const monthBirth = (i.date_of_birth.getMonth() + 1)
    //           .toString()
    //           .padStart(2, "0");
    //         const yearBirth = i.date_of_birth.getFullYear();
    //         const formattedDateBirth = `${dayBirth}/${monthBirth}/${yearBirth}`;
    //         console.log(formattedDateBirth);
    //         i.start_date = formattedDate;
    //         i.date_of_birth = formattedDateBirth;
    //       }
    //       const data = [
    //         "full_name",
    //         "identification_number",
    //         "place_of_birth",
    //         "date_of_birth",
    //         "gender",
    //         "address",
    //         "phone_number",
    //         "email_address",
    //         "job_position",
    //         "department_unit",
    //         "start_date",
    //         "employment_status",
    //         "base_salary",
    //         "allowances",
    //         "deductions",
    //         "highest_education",
    //         "education_institution",
    //         "major_in_highest_education",
    //         "academic_degree",
    //         "previous_work_experience",
    //         "marital_status",
    //         "number_of_children",
    //         "emergency_contact_name",
    //         "emergency_contact_phone",
    //         // 'employment_history',
    //         // 'partnerCode',
    //         "linkGambar",
    //         "golongan",
    //       ];
    //       const arr = [];
    //       for (const thisData of parsedData) {
    //         const formData = {};
    //         for (const i of data) {
    //           formData[i] = thisData[i];
    //         }
    //         arr.push(formData);
    //       }

    //       let cek = false;
    //       const filteredArr = arr.filter((obj, index) => {
    //         if (index !== arr.length - 1 && obj.full_name === null) {
    //           cek = true;
    //           return false;
    //         }
    //         if (index == arr.length - 1 && obj.full_name === null) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       if (cek == false) {
    //         Swal.fire({
    //           title: "Konfirmasi Tambah Pegawai",
    //           text: "",
    //           icon: "warning",
    //           showCancelButton: true,
    //           confirmButtonText: "Iya",
    //           cancelButtonText: "Tidak",
    //         }).then((result) => {
    //           if (result.isConfirmed) {
    //             Meteor.call(
    //               "employee.insertCSV",
    //               filteredArr,
    //               function (error, result) {
    //                 // console.log(err, res);
    //                 if (result) {
    //                   Meteor.call(
    //                     "departement.getAll",
    //                     function (error, result) {
    //                       if (result) {
    //                         // console.log(result);
    //                         // console.log(filteredArr);
    //                         // const notFound = filteredArr.filter(filteredArr => !result.some(result => result.name === filteredArr.departement_unit));
    //                         // console.log("tidak ketemu : ", notFound);
    //                         const uniqueDepartements = {};
    //                         const notFound = filteredArr.filter((item) => {
    //                           const isDuplicate =
    //                             uniqueDepartements[item.department_unit];
    //                           uniqueDepartements[item.department_unit] = true;
    //                           return !isDuplicate;
    //                         });
    //                         console.log(notFound);
    //                         for (const i of notFound) {
    //                           console.log(i.department_unit);
    //                           const data = {
    //                             name: i.department_unit,
    //                             description: "-",
    //                           };
    //                           Meteor.call(
    //                             "departement.insert",
    //                             data,
    //                             function (error, result) {
    //                               if (result) {
    //                               } else {
    //                                 console.log(error);
    //                               }
    //                             }
    //                           );
    //                         }
    //                       }
    //                     }
    //                   );
    //                   Swal.fire({
    //                     title: "Berhasil",
    //                     text: "Data berhasil dimasukkan",
    //                     showConfirmButton: true,
    //                     allowOutsideClick: true,
    //                   }).then((result) => {
    //                     if (result.isConfirmed) {
    //                       location.reload();
    //                     }
    //                   });
    //                 } else {
    //                   Swal.fire({
    //                     title: "Gagal",
    //                     text: "Data gagal dimasukkan, silahkan cek kembali bila data excel sudah terisi dengan sesuai atau hubungin admin bila ada pertanyaan lebih lanjut",
    //                     showConfirmButton: true,
    //                     allowOutsideClick: true,
    //                   });
    //                   // location.reload();
    //                 }
    //               }
    //             );
    //           }
    //         });
    //       } else {
    //         Swal.fire({
    //           title: "Data Pegawai",
    //           text: "Ada data nama pegawai yang masih kosong, apakah anda ingin melanjutkan? Data yang memiliki nama lengkap kosong tidak akan dimasukkan",
    //           icon: "warning",
    //           showCancelButton: true,
    //           confirmButtonText: "Iya",
    //           cancelButtonText: "Tidak",
    //         }).then((result) => {
    //           if (result.isConfirmed) {
    //             Meteor.call(
    //               "employee.insertCSV",
    //               filteredArr,
    //               function (error, result) {
    //                 // console.log(err, res);
    //                 if (result) {
    //                   Meteor.call(
    //                     "departement.getAll",
    //                     function (error, result) {
    //                       if (result) {
    //                         // console.log(result);
    //                         // console.log(filteredArr)
    //                         const uniqueDepartements = {};
    //                         const notFound = filteredArr.filter((item) => {
    //                           const isDuplicate =
    //                             uniqueDepartements[item.department_unit];
    //                           uniqueDepartements[item.department_unit] = true;
    //                           return !isDuplicate;
    //                         });
    //                         console.log("filtered : ", filteredArr);
    //                         console.log("tidak ketemu : ", notFound);
    //                         for (const i of notFound) {
    //                           console.log(i);
    //                           const data = {
    //                             name: i.department_unit,
    //                             description: "-",
    //                           };
    //                           Meteor.call(
    //                             "departement.insert",
    //                             data,
    //                             function (error, result) {
    //                               if (result) {
    //                               } else {
    //                                 console.log(error);
    //                               }
    //                             }
    //                           );
    //                         }
    //                       }
    //                     }
    //                   );
    //                   Swal.fire({
    //                     title: "Berhasil",
    //                     text: "Data berhasil dimasukkan",
    //                     showConfirmButton: true,
    //                     allowOutsideClick: true,
    //                   }).then((result) => {
    //                     if (result.isConfirmed) {
    //                       location.reload();
    //                     }
    //                   });
    //                 } else {
    //                   Swal.fire({
    //                     title: "Gagal",
    //                     text: "Data gagal dimasukkan, silahkan cek kembali bila data excel sudah terisi",
    //                     showConfirmButton: true,
    //                     allowOutsideClick: true,
    //                   });
    //                   // location.reload();
    //                 }
    //               }
    //             );
    //           }
    //         });
    //       }
    //     },
    //   });
    // }
  },
});

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

Template.employeeSearch.onCreated(function (error, result) {
  const self = this;

  self.listEmployee = new ReactiveVar();
  self.listEmployeeSearch = new ReactiveVar();

  Meteor.call("employee.getAll", function (error, result) {
    if (result) {
      self.listEmployee.set(result);
    }
  });
});
Template.employeeSearch.helpers({
  listEmployeeSearch() {
    return Template.instance().listEmployeeSearch.get();
  },
});
Template.employeeSearch.events({
  "keyup #input-name"(e, t) {
    const value = e.target.value;
    if (value.length < 4) {
      return false;
    }
    const master = t.listEmployee.get();
    const searchEmployee = master.filter((item) => {
      return item.fullName.toLowerCase().includes(value.toLowerCase());
    });

    if (searchEmployee.length > 0) {
      t.listEmployeeSearch.set(searchEmployee);
    } else {
      t.listEmployeeSearch.set();
    }
  },
});
