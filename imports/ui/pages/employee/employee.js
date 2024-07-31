import "./employee.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { result } from "underscore";
import { HTTP } from 'meteor/http';
import { Permits, StaffsAttendance } from "../../../api/attendance/attendance";
import { Employee } from "../../../api/employee/employee";

Template.employee_page.onCreated(function (){
    const self = this;

    self.employees = new ReactiveVar();
    self.filter = new ReactiveVar({
      type: '',
      data: ''
    })
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
        console.log(dataRole);
        self.jabatanLogin.set(dataRole);
      }
      else{
        console.log(error);
      }
    })
})

Template.employee_page.helpers({
    employees() {
      const t = Template.instance()
      const employee = t.employees.get();
      const filter = t.filter.get()
      // console.log(employee);
      if(employee){
        const result =  employee.filter((x) => {
          const query = filter.data.toString().toLowerCase()
          if(filter.type == 'job_position'){
            return x.job_position.toString().toLowerCase().includes(query)
          }
          if(filter.type == 'start_date'){
            const thisStartDate = x.start_date
            return moment(thisStartDate).format('YYYY').includes(query)
          }
          if(filter.type == 'masa_jabatan'){
            const thisStartDate = x.start_date
            const diff = moment().diff(thisStartDate, 'year')
            return diff.toString().includes(query)
          }
          if(filter.type == 'department_unit'){
            return x.department_unit.toString().toLowerCase().includes(query)
          }
          if(filter.type == 'full_name'){
            return x.full_name.toString().toLowerCase().includes(query);
          }
          return true
        })
        // console.log(result);
        return result
      }
      else{
        return []
      }
    },
    jabatanLogin() {
      return Template.instance().jabatanLogin.get();
    },
});

Template.employee_page.events({
  "click #btn_delete"(e, t){
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete pegawai ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed) {
        Meteor.call('employee.remove', id, function (error, result) {
          if(result){
            // alert("Delete Sukses");
            Swal.fire({
              title: "Berhasil",
              text: "Delete berhasil",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if(result.isConfirmed){
                location.reload();
              }
            });
          }else{
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
    })

    // console.log(id);
  },
  "input .filter"(e, t){
    e.preventDefault();

    const type = $("#input_type").val();
    const data = $('#input_data').val();
    t.filter.set({
      type,
      data
    })
  },
  "change .filter"(e, t){
    // e.preventDefault();

    const type = $("#input_type").val();
    const data = $('#input_data').val();
    t.filter.set({
      type,
      data
    })
  },
});

Template.dashboard.onCreated(function (){
  const self = this;

  self.employees = new ReactiveVar();
  self.permits = new ReactiveVar();
  self.todayStatus = new ReactiveVar([])
  self.events = new ReactiveVar()
  self.tasks = new ReactiveVar([])
  self.filter = new ReactiveVar({
    type: '',
    data: ''
  })
  self.jabatanLogin = new ReactiveVar();
  const userId = Meteor.userId();

  Tracker.autorun(() => {
    const handleAttendance = Meteor.subscribe('attendanceToday');
    const handleEmployee = Meteor.subscribe('myEmployee');
    const handlePermits = Meteor.subscribe('permitsToday');

    if (handleAttendance.ready() && handleEmployee.ready()) {
      const dataStaffsAttendance = StaffsAttendance.find({}).fetch();
      let myEmployee = Employee.find().fetch();
      let permitsToday = Permits.find().fetch()
      let listNew = [];

      myEmployee.forEach((x) => {
        const attendance = dataStaffsAttendance.find((y) => y.userId === x._id);
        if (attendance) {
          delete attendance._id;
          x = { fullName: x.full_name, ...attendance, imageLink: x.linkGambar };
        } else {
          x = { fullName: x.full_name, imageLink: x.linkGambar };
        }
        listNew.push(x);
      });

      listNew.sort((a, b) => {
        if (!a.checkIn && !b.checkIn) {
          return 0; // Jika keduanya tidak memiliki checkIn, tetap dalam urutan yang sama
        } else if (!a.checkIn) {
          return 1; // Jika a tidak memiliki checkIn, a ditempatkan di akhir
        } else if (!b.checkIn) {
          return -1; // Jika b tidak memiliki checkIn, b ditempatkan di akhir
        } else {
          return new Date(a.checkIn) - new Date(b.checkIn); // Jika keduanya memiliki checkIn, urutkan berdasarkan nilai checkIn
        }
      });

      self.todayStatus.set(listNew);
      self.permits.set(permitsToday)
    }
  });

  // Meteor.call("staffsAttendance.inThisDay", function (error, result) {
  //     if (result) {
  //       console.log(result);
  //       self.todayStatus.set(result);
  //     } else {
  //       console.log(error);
  //     }
  // });
  Meteor.call("tasks.getToday", function (error, result) {
    if (result) {
      self.tasks.set(result)
    }
    else{
      console.log(error);
    }
  })
  Meteor.call("events.thisWeek", function (error, result) {
    if (result) {
      self.events.set(result)
    }
    else{
      console.log(error);
    }
  })
})

Template.dashboard.onRendered(function () {
//   $('#myCarousel').carousel({
//     interval: 10000,
//     wrap: true,
//     keyboard: false,
//     pause: 'hover'
// });

// $('.carousel-control').hide();
});


Template.dashboard.helpers({
  events(){
    return Template.instance().events.get()
  },
  tasks(){
    return Template.instance().tasks.get()
  },
  todayStatus(){
    return Template.instance().todayStatus.get();
  },
  permits(){
    return Template.instance().permits.get()
  }
});

Template.dashboard.events({
"click #btn_delete"(e, t){
  e.preventDefault();

  const id = e.target.getAttribute('data-id');
  Swal.fire({
    title: "Konfirmasi Delete",
    text: "Apakah anda yakin melakukan delete pegawai ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal"
  }).then((result) => {
    if(result.isConfirmed) {
      Meteor.call('employee.remove', id, function (error, result) {
        if(result){
          // alert("Delete Sukses");
          Swal.fire({
            title: "Berhasil",
            text: "Delete berhasil",
            showConfirmButton: true,
            allowOutsideClick: true,
          }).then((result) => {
            if(result.isConfirmed){
              location.reload();
            }
          });
        }else{
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
  })

  // console.log(id);
},
"input .filter"(e, t){
  e.preventDefault();

  const type = $("#input_type").val();
  const data = $('#input_data').val();
  t.filter.set({
    type,
    data
  })
},
"change .filter"(e, t){
  // e.preventDefault();

  const type = $("#input_type").val();
  const data = $('#input_data').val();
  t.filter.set({
    type,
    data
  })
},
});

Template.employee_create.onCreated(function () {
  const self = this;
  self.departements = new ReactiveVar();
  self.viewMode = new ReactiveVar("1");
  self.changeBankAccountName = new ReactiveVar(false)
  Meteor.call("departement.getAll", function (error, result) {
    if (result) {
      // console.log(result);
      self.departements.set(result);
    } else {
      console.log(error);
    }
  });
});

Template.employee_create.helpers({
  departements() {
    return Template.instance().departements.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
  changeBankAccountName() {
    return Template.instance().changeBankAccountName.get();
  }
})

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
  "click .change-page" (e, t) {
    const val = $(e.target).val();
    t.viewMode.set(val);
  },
  "change #checkNamaAccount" (e, t) {
    const isChecked = e.target.checked;
    t.changeBankAccountName.set(isChecked);
  },
  async "click #btn_save"(e, t) {
    e.preventDefault();

    const full_name = $("#input_fullName").val();
    const identification_number = $("#input_identificationNumber").val();
    const place_of_birth = $("#input_placeOfBirth").val();
    let dob = $("#input_dateOfBirth").val();
    const gender = $("#input_gender").val();
    const address = $("#input_address").val();
    let phone_number = $("#input_phoneNumber").val();
    const email_address = $("#input_email").val();
    const job_position = $("#input_jobPosition").val();
    const department_unit = $("#input_departementUnit").val();
    let start_date = $("#input_startDate").val();
    const employment_status = $("#input_employmentStatus").val();
    const base_salary = convert2number($("#input_baseSalery").val());
    const allowances = convert2number($("#input_allowances").val());
    const deductions = convert2number($("#input_deductions").val());
    const highest_education = $("#input_highestEducation").val();
    const education_institution = $("#input_educationInstitution").val();
    const major_in_highest_education = $("#input_majorInHighestEducation").val();
    const academic_degree = $("#input_academicDegree").val();
    const previous_work_experience = $("#input_previousWorkExperience").val();
    const marital_status = $("#input_maritalStatus").val();
    const number_of_children = $("#input_numberOfChildren").val();
    const emergency_contact_name = $("#input_emergencyContactName").val();
    let emergency_contact_phone = $("#input_emergencyContactPhone").val();
    const golongan = $("#input_golongan").val();
    const accountNumber = $("#input_accountNumber").val();
    const accountNumberBank = $("#input_accountNumberBank").val();
    let accountNumberName;
    if(t.changeBankAccountName.get() == true) {
      accountNumberName = $("#input_accountNumberName").val();
    }
    else {
      accountNumberName = $("#input_fullName").val();
    }

    dob = new Date(dob);
    start_date = new Date(start_date);

    const dataForm = $(".form-control")
    let cek = false;
    for (let index = 0; index < dataForm.length; index++) {
      let data = dataForm[index].value;
      // console.log(data);
      if(dataForm[index].value == ""){
        cek = true;
      }
    }
    if(cek == true){
      Swal.fire({
        title: "Gagal",
        text: "Data harus diisi semua",
        showConfirmButton: true,
        allowOutsideClick: true,
      });
      return;
    }

    // console.log(base_salary, allowances, deductions);
    // return;

    if(!isNumber(emergency_contact_phone) || !isNumber(phone_number)){
      // console.log("gagal no telp masuk sini");
      Swal.fire({
        title: "Gagal",
        text: "Nomor Telepon harus angka dan diisi",
        showConfirmButton: true,
        allowOutsideClick: true,
      });
      return;
    }

    if(!base_salary){
      // console.log("gagal uang masuk sini");
      // alert("Gaji pokok atau Allowance harus angka");
      Swal.fire({
        title: "Gagal",
        text: "Gaji pokok atau Allowance harus angka dan diisi",
        showConfirmButton: true,
        allowOutsideClick: true,
      });
      return;
    }

    emergency_contact_phone = formatPhoneNumber(emergency_contact_phone);
    phone_number = formatPhoneNumber(phone_number);

    const file = $(`#gambar`).prop('files')
    console.log(file);
    const thisForm = {};
    thisForm[gambar] = "";
    // console.log(file[0].name);
    if(file[0]){
      const uploadData = {
        fileName: "employee/"+file[0].name,
        type: "image/png",
        Body: file[0]
      }
      thisForm[gambar] = await uploadFiles(uploadData)
    }

    const linkGambar = thisForm[gambar];
    if(!linkGambar){
      console.log('link url tidak ada');
    }
    console.log(linkGambar);
    // console.log(linkGambar);
    const data = {full_name,
      identification_number,
      place_of_birth,
      dob,
      gender,
      address,
      phone_number,
      email_address,
      job_position,
      department_unit,
      start_date,
      employment_status,
      base_salary,
      allowances,
      deductions,
      highest_education,
      education_institution,
      major_in_highest_education,
      academic_degree,
      previous_work_experience,
      marital_status,
      number_of_children,
      emergency_contact_name,
      emergency_contact_phone,
      // employment_history,
      // partnerCode,
      linkGambar,
      golongan,
      accountNumber,
      accountNumberBank,
      accountNumberName
    }
    if(!linkGambar){
      Swal.fire({
        title: "Warning",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak",
        text: "Gambar gagal diupload, apakah anda ingin melanjutkan unggah data pegawai",
      }).then((result) => {
        if(result.isConfirmed) {
          data.linkGambar = "";
          Meteor.call(
            "employee.insert",
            data,
            function (error, result) {
              if (result) {
                // alert("Sukses");
                Swal.fire({
                  title: "Berhasil",
                  text: "Data berhasil dimasukkan",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                }).then((result) => {
                  if(result.isConfirmed) {
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
            }
          );
        }
      });
    }
    else{
      Swal.fire({
        title: "Warning",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak",
        text: "Apakah anda ingin menyimpan data pegawai ini",
      }).then((result) => {
        if(result.isConfirmed) {
          Meteor.call(
            "employee.insert",
            data,
            function (error, result) {
              if (result) {
                // alert("Sukses");
                Swal.fire({
                  title: "Berhasil",
                  text: "Data berhasil dimasukkan",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                }).then((result) => {
                  if(result.isConfirmed) {
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
            }
          );
        }
      });
    }

  },
});

  Template.inputFilesV2.onCreated(function () {
    const self = this
    const data = self.data
    self.file = new ReactiveVar()
    self.preview = new ReactiveVar()
    if(data.src){
      self.preview.set([
        {
          preview: data.src,
          type: 'image'
        }
    ])
    }

    Template.inputFilesV2.helpers({
      files(){
        return Template.instance().file.get()
      },
      preview(){
        return Template.instance().preview.get()
      }
    })
    Template.inputFilesV2.events({
      'change .fileUpload'(e, t){
        const file = e.target.files[0];
          if (file) {
              t.file.set(file)
              t.preview.set(
                [{
                  preview: URL.createObjectURL(file),
                  name: file.name,
                  size: file.size,
                  type: file.type
                }]
              )
          }
      },
      'click .remove-image'(e, t){
        const thisMilik = $(e.target).attr('milik');
        const hasMilik = $(e.target).hasClass(thisMilik);
        if(hasMilik){
          t.preview.set(null)
          $('#'+thisMilik).val(null);
        }
      }
    })
  })

  Template.employee_detail.onCreated(function () {
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

  Template.employee_detail.helpers({
    employee() {
      return Template.instance().employee.get();
    },
  });

  Template.employee_detail.events({
    "click #btn-tambah-akun"(e,t){
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
       if(partner == "imavi") {
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
        dob
      }
      Swal.fire({
        title: "Konfirmasi Buat Akun APP",
        text: "Apakah anda yakin membuat akun untuk APP",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Buat",
        cancelButtonText: "Batal"
      }).then((result) => {
        if(result.isConfirmed){
          Meteor.call("employee.createApp", body, profileId, function(error, result){
            if(result){
              Swal.alert
              Swal.fire({
                title: "Berhasil",
                text: `Akun APP berhasil dibuat dengan username ${email} dan password ${partner}.${password}`,
                showConfirmButton: true,
                allowOutsideClick: true,
              });
              history.back();
            }
            else{
              if(error.error == 412) {
                Swal.fire({
                  title: "Gagal",
                  text: "Akun APP gagal dibuat, cek kembali bila user ini sudah memiliki akun APP",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
              else {
                Swal.fire({
                  title: "Gagal",
                  text: "Sistem bermasalah, silahkan hubungi administrasi",
                  showConfirmButton: true,
                  allowOutsideClick: true,
                });
              }
              // location.reload();
            }
          })
        }
      });

    },
    "click #btn-tambah-akun-user"(e, t){
      e.preventDefault()
      Swal.fire({
        title: "Konfirmasi Tambah User Pegawai",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Iya",
        cancelButtonText: "Tidak"
      }).then((result) => {
        if(result.isConfirmed) {
          const email = t.employee.get().email_address;
          const fullName = t.employee.get().full_name
          const role = [];
          const id = FlowRouter.getParam("_id");

          const dataSend = {
              username : email,
              fullname: fullName,
              role,
              idEmployee: id
          };

          Meteor.call("users.createAppMeteorEmployee", dataSend, function (error ,result) {
              if (result) {
                  // alert("Sukses");
                  if(result.error == 403){
                    return Swal.fire({
                      title: "Gagal",
                      text: "Data gagal dimasukkan, username sudah ada",
                      showConfirmButton: true,
                      allowOutsideClick: true,
                    });
                  }
                  Swal.fire({
                    title: "Berhasil",
                    text: `Data berhasil dimasukkan, user memiliki username ${dataSend.username} dan password ${result}`,
                    showConfirmButton: true,
                    allowOutsideClick: true,
                  }).then((result) => {
                    if(result.isConfirmed) {
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
          })
        }
      })
    },
  });

  Template.employee_detail_academicJob.onCreated( function () {
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
    }
  });

  Template.employee_detail_emergencyContact.onCreated( function () {
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
    }
  });

  Template.employee_detail_config.onCreated( function () {
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
    }
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
        if(result.isConfirmed){
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
                  if(result.isConfirmed){
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
        if(result.isConfirmed){
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
                  if(result.isConfirmed){
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
    }
  })

  Template.employee_edit.onCreated(function (){
    const self = this;

    self.employee = new ReactiveVar();
    self.viewMode = new ReactiveVar("1");
    self.changeBankAccountName = new ReactiveVar(false);
    const id = FlowRouter.getParam("_id");
    // console.log(id);
    Meteor.call("employee.getBy", id, function (error, result) {
      if (result) {
        self.employee.set(result);
        if(result.accountNumberName == result.full_name) self.changeBankAccountName.set(false)
        else self.changeBankAccountName.set(true)
      } else {
        console.log(error);
      }
    });
  });

  Template.employee_edit.helpers({
    employee() {
      return Template.instance().employee.get();
    },
    viewMode() {
      return Template.instance().viewMode.get();
    },
    changeBankAccountName() {
      return Template.instance().changeBankAccountName.get();
    }
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
    "click .change-page" (e, t) {
      const val = $(e.target).val();
      t.viewMode.set(val);
    },
    "change #checkNamaAccount" (e, t) {
      const isChecked = e.target.checked;
      t.changeBankAccountName.set(isChecked);
    },
    async "click #btn_update"(e, t) {
      e.preventDefault();

      const full_name = $("#input_fullName").val();
      const identification_number = $("#input_identificationNumber").val();
      const place_of_birth = $("#input_placeOfBirth").val();
      let dob = $("#input_dateOfBirth").val();
      const gender = $("#input_gender").val();
      const address = $("#input_address").val();
      let phone_number = parseInt($("#input_phoneNumber").val());
      const email_address = $("#input_email").val();
      const job_position = $("#input_jobPosition").val();
      const department_unit = $("#input_departementUnit").val();
      let start_date = $("#input_startDate").val();
      const employment_status = $("#input_employmentStatus").val();
      const base_salary = parseInt($("#input_baseSalery").val());
      const allowances = parseInt($("#input_allowances").val());
      const deductions = parseInt($("#input_deductions").val());
      const highest_education = $("#input_highestEducation").val();
      const education_institution = $("#input_educationInstitution").val();
      const major_in_highest_education = $("#input_majorInHighestEducation").val();
      const academic_degree = $("#input_academicDegree").val();
      const previous_work_experience = $("#input_previousWorkExperience").val();
      const marital_status = $("#input_maritalStatus").val();
      const number_of_children = $("#input_numberOfChildren").val();
      const emergency_contact_name = $("#input_emergencyContactName").val();
      let emergency_contact_phone = parseInt($("#input_emergencyContactPhone").val());
      const golongan = $("#input_golongan").val();
      const accountNumber = $("#input_accountNumber").val();
      const accountNumberBank = $("#input_accountNumberBank").val();
      let accountNumberName;
      if(t.changeBankAccountName.get() == true) {
        accountNumberName = $("#input_accountNumberName").val();
      }
      else {
        accountNumberName = $("#input_fullName").val();
      }
      dob = new Date(dob);
      start_date = new Date(start_date);

      const id = FlowRouter.getParam("_id");

      // const dataForm = $(".form-control")
      // let cek = false;
      // for (let index = 0; index < dataForm.length; index++) {
      //   if(dataForm[index].value == ""){
      //     cek = true;
      //   }
      // }
      // if(cek == true){
      //   Swal.fire({
      //     title: "Gagal",
      //     text: "Data harus diisi semua",
      //     showConfirmButton: true,
      //     allowOutsideClick: true,
      //   });
      //   return;
      // }

      if(base_salary == undefined || base_salary == null){
          Swal.fire({
            title: "Gagal",
            text: "Gaji pokok atau Allowance harus angka dan diisi",
            showConfirmButton: true,
            allowOutsideClick: true,
          });
          return;
      }
      if(!isNumber(emergency_contact_phone) || !isNumber(phone_number)){
        Swal.fire({
          title: "Gagal",
          text: "Nomor Telepon harus angka dan diisi",
          showConfirmButton: true,
          allowOutsideClick: true,
        });
          return;
      }
      emergency_contact_phone = formatPhoneNumber(emergency_contact_phone);
      phone_number = formatPhoneNumber(phone_number);

  const file = $(`#gambar`).prop('files');
  if(file.length == 0){
    const data = {full_name,
      identification_number,
      place_of_birth,
      dob,
      gender,
      address,
      phone_number,
      email_address,
      job_position,
      department_unit,
      start_date,
      employment_status,
      base_salary,
      allowances,
      deductions,
      highest_education,
      education_institution,
      major_in_highest_education,
      academic_degree,
      previous_work_experience,
      marital_status,
      number_of_children,
      emergency_contact_name,
      emergency_contact_phone,
      accountNumber,
      accountNumberBank,
      accountNumberName,
      golongan
    }
    Swal.fire({
      title: "Warning",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
      text: "Apakah anda yakin ingin update data pegawai",
    }).then((result) => {
      if(result.isConfirmed){
        Meteor.call(
          "employee.update",
          id,
          data,
          function (error, result) {
            if (result) {
              Swal.fire({
                title: "Berhasil",
                text: "Data berhasil diupdate",
                showConfirmButton: true,
                allowOutsideClick: true,
              }).then((result) => {
                if(result.isConfirmed){
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
    })
  } else {
    Swal.fire({
      title: 'Loading...',
      html: 'Sedang memproses gambar...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });
    const thisForm = {};
    thisForm[gambar] = "";
    if(file[0]){
      const uploadData = {
        fileName: "employee/"+file[0].name,
        type: "image/png",
        Body: file[0]
      }
      thisForm[gambar] = await uploadFiles(uploadData)
      const linkGambar = thisForm[gambar];
      const data = {full_name,
        identification_number,
        place_of_birth,
        dob,
        gender,
        address,
        phone_number,
        email_address,
        job_position,
        department_unit,
        start_date,
        employment_status,
        base_salary,
        allowances,
        deductions,
        highest_education,
        education_institution,
        major_in_highest_education,
        academic_degree,
        previous_work_experience,
        marital_status,
        number_of_children,
        emergency_contact_name,
        emergency_contact_phone,
        accountNumber,
        accountNumberBank,
        accountNumberName,
        linkGambar,
        golongan
      }
      Swal.hideLoading()
      if(!linkGambar){
        Swal.fire({
          title: "Warning",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Iya",
          cancelButtonText: "Tidak",
          text: "Gambar gagal diupload, apakah anda ingin melanjutkan update data pegawai",
        }).then((result) => {
          if(result.isConfirmed) {
            linkGambar = "";
            Meteor.call(
              "employee.updateWithPicture",
              id,
              data,
              function (error, result) {
                if (result) {
                  // console.log(result);
                  // alert("Sukses");
                  Swal.fire({
                    title: "Berhasil",
                    text: "Data berhasil diupdate",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                  }).then((result) => {
                    if(result.isConfirmed){
                      location.reload();
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
              }
            );
          }
        })
      }
      else{
        console.log(linkGambar);
        Swal.fire({
          title: "Warning",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Iya",
          cancelButtonText: "Tidak",
          text: "Apakah anda yakin ingin melakukan update data pegawai",
        }).then((result) => {
          if(result.isConfirmed){
            Meteor.call(
              "employee.updateWithPicture",
              id,
              data,
              function (error, result) {
                if (result) {
                  // console.log(result);
                  // alert("Sukses");
                  Swal.fire({
                    title: "Berhasil",
                    text: "Data berhasil diupdate",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                  }).then((result) => {
                    if(result.isConfirmed){
                      location.reload();
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
              }
            );
          }
        })
      }
    }
  }

    },
  });

  Template.employee_mutation.onCreated(function(){
    const self = this;
    self.employee = new ReactiveVar();
    self.departements = new ReactiveVar();
    self.viewMode = new ReactiveVar("1");
    const id = FlowRouter.getParam("_id");
    // console.log(id);
    Meteor.call("employee.getBy", id, function (error, result) {
      // console.log(result);
      if (result){
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
    employee(){
      return Template.instance().employee.get();
    },
    viewMode() {
      return Template.instance().viewMode.get();
    },
    departements() {
      return Template.instance().departements.get();
    }
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

    "click #btn_save" (e, t){
      e.preventDefault();

      const departement_unit = $("#input_departemen").val();
      const id = FlowRouter.getParam("_id");
      console.log(departement_unit, id);
      if(!departement_unit){
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
          if (result){
            Swal.fire({
              title: "Berhasil",
              text: "Data berhasil dimasukkan",
              showConfirmButton: true,
              allowOutsideClick: true,
            }).then((result) => {
              if(result.isConfirmed){
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
      )
    }
  });

  Template.upload_CSV.onCreated(function(){
    const self = this;
    self.items = new ReactiveVar([]);
  });

  Template.upload_CSV.helpers({
    items(){
      return Template.instance().items.get();
    },
  })

  Template.upload_CSV.events({
    'change #csvFile' (e,t) {
      e.preventDefault();
      const fileInput = document.getElementById('csvFile');
      const file = fileInput.files[0];
      if(file) {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: function(results) {
            const parsedData = results.data;
            console.log(parsedData);
              const data = [
                'full_name',
                'identification_number',
                'place_of_birth',
                'dob',
                'gender',
                'address',
                'phone_number',
                'email_address',
                'job_position',
                'department_unit',
                'start_date',
                'employment_status',
                'base_salary',
                'allowances',
                'deductions',
                'highest_education',
                'education_institution',
                'major_in_highest_education',
                'academic_degree',
                'previous_work_experience',
                'marital_status',
                'number_of_children',
                'emergency_contact_name',
                'emergency_contact_phone',
                // 'employment_history',
                // 'partnerCode',
                'linkGambar',
                'golongan'
              ]
              // console.log(data);
              const arr = []
              for (const thisData of parsedData) {
                const formData = {}
                for (const i of data) {
                  formData[i] = thisData[i]
                }
                arr.push(formData)
              }
              console.log(arr);
              const filteredArr = arr.filter((obj, index) => {
                if(index !== arr.length - 1 && obj.full_name === null) {
                  Swal.fire({
                    title: "Warning",
                    text: "Ada data yang tidak terdapat nama lengkap sehingga tidak ditampilkan pada preview",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                  });
                  return false;
                }
                if (index == arr.length -1 && obj.full_name === null) {
                  return false;
                }
                return true;
              });
              // console.log(filteredArr);
              t.items.set(filteredArr);
            }
        })
      }
    },
    'submit #csvForm' (e,t) {
      e.preventDefault();
      const fileInput = document.getElementById('csvFile');
      const file = fileInput.files[0];
      // console.log(file);
      if(file) {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: function(results) {
            const parsedData = results.data;
            // console.log(typeof parsedData[0].identification_number);
            console.log(parsedData);
            for (const i of parsedData) {
              i.start_date = new Date(i.start_date);
              i.date_of_birth = new Date(i.date_of_birth);
              const day = i.start_date.getDate().toString().padStart(2, '0');
              const month = (i.start_date.getMonth() + 1).toString().padStart(2, '0');
              const year = i.start_date.getFullYear();
              const formattedDate = `${day}/${month}/${year}`;
              const dayBirth = i.date_of_birth.getDate().toString().padStart(2, '0');
              const monthBirth = (i.date_of_birth.getMonth() + 1).toString().padStart(2, '0');
              const yearBirth = i.date_of_birth.getFullYear();
              const formattedDateBirth = `${dayBirth}/${monthBirth}/${yearBirth}`;
              console.log(formattedDateBirth);
              i.start_date = formattedDate
              i.date_of_birth = formattedDateBirth
            }
              const data = [
                'full_name',
                'identification_number',
                'place_of_birth',
                'date_of_birth',
                'gender',
                'address',
                'phone_number',
                'email_address',
                'job_position',
                'department_unit',
                'start_date',
                'employment_status',
                'base_salary',
                'allowances',
                'deductions',
                'highest_education',
                'education_institution',
                'major_in_highest_education',
                'academic_degree',
                'previous_work_experience',
                'marital_status',
                'number_of_children',
                'emergency_contact_name',
                'emergency_contact_phone',
                // 'employment_history',
                // 'partnerCode',
                'linkGambar',
                'golongan'
              ]
              const arr = []
              for (const thisData of parsedData) {
                const formData = {}
                for (const i of data) {
                  formData[i] = thisData[i]
                }
                arr.push(formData)
              }

              let cek = false;
              const filteredArr = arr.filter((obj, index) => {
                if(index !== arr.length - 1 && obj.full_name === null) {
                  cek = true
                  return false;
                }
                if (index == arr.length -1 && obj.full_name === null) {
                  return false;
                }
                return true;
              });
              if(cek == false){
                Swal.fire({
                  title: "Konfirmasi Tambah Pegawai",
                  text: "",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Iya",
                  cancelButtonText: "Tidak"
                }).then((result) => {
                  if(result.isConfirmed) {
                    Meteor.call('employee.insertCSV', filteredArr, function (error, result) {
                      // console.log(err, res);
                      if(result){
                        Meteor.call('departement.getAll', function (error, result) {
                          if(result){
                            // console.log(result);
                            // console.log(filteredArr);
                            // const notFound = filteredArr.filter(filteredArr => !result.some(result => result.name === filteredArr.departement_unit));
                            // console.log("tidak ketemu : ", notFound);
                            const uniqueDepartements = {};
                            const notFound = filteredArr.filter((item) => {
                              const isDuplicate = uniqueDepartements[item.department_unit];
                              uniqueDepartements[item.department_unit] = true;
                              return !isDuplicate;
                            });
                            console.log(notFound);
                            for (const i of notFound) {
                              console.log(i.department_unit);
                              const data = {
                                name: i.department_unit,
                                description: "-"
                              }
                              Meteor.call('departement.insert', data, function (error, result) {
                                if(result){

                                }else{
                                  console.log(error);
                                }
                              })
                            }
                          }
                        })
                        Swal.fire({
                          title: "Berhasil",
                          text: "Data berhasil dimasukkan",
                          showConfirmButton: true,
                          allowOutsideClick: true,
                        }).then((result) => {
                          if(result.isConfirmed) {
                            location.reload();
                          }
                        });
                      }
                      else{
                        Swal.fire({
                          title: "Gagal",
                          text: "Data gagal dimasukkan, silahkan cek kembali bila data excel sudah terisi dengan sesuai atau hubungin admin bila ada pertanyaan lebih lanjut",
                          showConfirmButton: true,
                          allowOutsideClick: true,
                        });
                        // location.reload();
                      }
                    })
                  }
                })

              }
              else{
                Swal.fire({
                  title: "Data Pegawai",
                  text: "Ada data nama pegawai yang masih kosong, apakah anda ingin melanjutkan? Data yang memiliki nama lengkap kosong tidak akan dimasukkan",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Iya",
                  cancelButtonText: "Tidak"
                }).then((result) => {
                  if(result.isConfirmed) {
                    Meteor.call('employee.insertCSV', filteredArr, function (error, result) {
                      // console.log(err, res);
                      if(result){
                        Meteor.call('departement.getAll', function (error, result) {
                          if(result){
                            // console.log(result);
                            // console.log(filteredArr)
                            const uniqueDepartements = {};
                            const notFound = filteredArr.filter((item) => {
                              const isDuplicate = uniqueDepartements[item.department_unit];
                              uniqueDepartements[item.department_unit] = true;
                              return !isDuplicate;
                            });
                            console.log("filtered : ", filteredArr);
                            console.log("tidak ketemu : ", notFound);
                            for (const i of notFound) {
                              console.log(i);
                              const data = {
                                name: i.department_unit,
                                description: "-"
                              }
                              Meteor.call('departement.insert', data, function (error, result) {
                                if(result){

                                }else{
                                  console.log(error);
                                }
                              })
                            }
                          }
                        })
                        Swal.fire({
                          title: "Berhasil",
                          text: "Data berhasil dimasukkan",
                          showConfirmButton: true,
                          allowOutsideClick: true,
                        }).then((result) => {
                          if(result.isConfirmed) {
                            location.reload();
                          }
                        });
                      }
                      else{
                        Swal.fire({
                          title: "Gagal",
                          text: "Data gagal dimasukkan, silahkan cek kembali bila data excel sudah terisi",
                          showConfirmButton: true,
                          allowOutsideClick: true,
                        });
                        // location.reload();
                      }
                    })
                  }
                })
              }

            }

        })
      }
    }
  })


function isNumber(value) {
    return /^\d+$/.test(value);
}

function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters from the phone number
  const cleanedNumber = phoneNumber.toString().replace(/\D/g, '');

  // Check if the number starts with '0', indicating it's a local number
  if (cleanedNumber.startsWith('0')) {
    // Remove the leading '0' and prepend the country code '62'
    const formattedNumber = '62' + cleanedNumber.slice(1);
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
  let temp = data.replace(/\./g, ''); // merubah . jadi ""
  return parseFloat(temp);
}