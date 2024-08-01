import "./attendance.html";
import _, { functions, result, template } from "underscore";
import DataTable from "datatables.net-dt";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";

Template.staffsAttendancePage.onCreated(function () {
  const self = this;

  self.dataPresensi = new ReactiveVar();
  self.thisUserOutlets = new ReactiveVar();
  self.viewMode = new ReactiveVar(0);
  self.thisDay = new ReactiveVar(new Date());

  //filter untuk orang
  self.startDate = new ReactiveVar();
  self.endDate = new ReactiveVar();

  self.selectedEmployees = new ReactiveVar();

  const filter = {
    code: 1,
  };

//   const userId = Meteor.userId();
  Meteor.call("staffsAttendance.inThisDay", function (error, result) {
    // console.log(result);
    if (result) {
      self.dataPresensi.set(result);
    }
  });
  Meteor.call("getPartnersUser", function (error, result) {
    // console.log(userId);
    // console.log(result);
    if (result) {
      self.thisUserOutlets.set(result);
    } else {
      console.log(error);
    }
  });
  $("#selected-date").val(new Date().toISOString().split("T")[0]);

  startSelect2();
});
Template.staffsAttendancePage.onRendered(function () {});

Template.staffsAttendancePage.helpers({
  presensi() {
    return Template.instance().dataPresensi.get();
  },
  currentMonth() {
    return moment().format("YYYY-MM");
  },
  outletsUser() {
    return Template.instance().thisUserOutlets.get();
  },
  thisDay() {
    return Template.instance().thisDay.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
  userDetails() {
    const dataPresensi = Template.instance().dataPresensi.get();
    return dataPresensi[0];
  },
});

Template.staffsAttendancePage.events({
  "change #selected-date": function (e, t) {
    e.preventDefault();
    const date = e.target.value;
    Meteor.call("staffsAttendance.byDate", date, function (error, result) {
      if (result) {
        // console.log(result);
        t.dataPresensi.set(result);
      } else {
      }
    });
  },
  "change #selected-date-start"(e, t) {
    t.startDate.set(e.target.value);
  },
  "change #selected-date-end"(e, t) {
    t.endDate.set(e.target.value);
  },
  "change #select-outlets": function (e, t) {
    e.preventDefault();

    const outlet = e.target.value;
    const dataPresensi = t.dataPresensi.get();
    Meteor.call("staffsAttendance.inThisDay", function (error, result) {
      if (result) {
        if (outlet == "Semua") {
          t.dataPresensi.set(result);
        } else {
          const filtering = _.filter(result, {
            outlets: outlet.toLowerCase(),
          });
          t.dataPresensi.set(filtering);
        }
      }
    });
  },
  "click #detailsView": function (e, t) {
    const idUser = $(e.target).attr("milik");
    t.selectedEmployees.set(idUser);
    Meteor.call(
      "staffsAttendance.inThisMonth",
      idUser,
      function (error, result) {
        // console.log("a");
        if (result) {
          // getFireImage("staffs/" + idUser, "profile");
          // console.log(result);
          t.dataPresensi.set(result);
          t.viewMode.set(1);

        } else {
          console.log(error);
        }
      }
    );
  },
  "click #today": function (e, t) {
    Meteor.call("staffsAttendance.inThisDay", function (error, result) {
      if (result) {
        t.dataPresensi.set(result);
        t.viewMode.set(0);
      }
    });
  },
  "click #btn-getData"(e, t) {
    const idUser = t.selectedEmployees.get();

    if (t.startDate.get() && t.endDate.get()) {
      Meteor.call(
        "staffsAttendance.inThisMonth",
        idUser,
        t.startDate.get(),
        t.endDate.get(),
        function (error, result) {
          if (result) {
            t.dataPresensi.set(result);
            t.viewMode.set(1);
          } else {
            console.log(error);
          }
        }
      );
    }

  }

});

Template.rekapAttendancePage.onCreated(function () {
  const self = this;
  self.dataRekap = new ReactiveVar();
  self.startDate = new ReactiveVar();
  self.endDate = new ReactiveVar();
  self.thisUserPartners = new ReactiveVar();
  self.choosedPartner = new ReactiveVar("0");

  Meteor.call("getPartnersUser", function (error, result) {
    if (result) {
      self.thisUserPartners.set(result);
    } else {
      console.log(error);
    }
  });
  startSelect2();
});
Template.rekapAttendancePage.helpers({
  dataRekap() {
    return Template.instance().dataRekap.get();
  },
  partners() {
    return Template.instance().thisUserPartners.get();
  },
  choosedPartner() {
    return Template.instance().choosedPartner.get();
  }
});
Template.rekapAttendancePage.events({
  "change #selected-date-start"(e, t) {
    t.startDate.set(e.target.value);
  },
  "change #selected-date-end"(e, t) {
    t.endDate.set(e.target.value);
  },
  "click #btn-rekap": function (error, template) {
    const totalLibur = $("#jml-libur").val();
    if (totalLibur == "") {
      alert("Isi form dahulu !");
      return false;
    }
    else {
        Meteor.call("staffsAttendance.rekap", totalLibur, template.startDate.get(), template.endDate.get(),function (error, result) {
            if (result) {
                template.dataRekap.set(result);
            //   DataTable(window, $);
            //     setTimeout(() => {
            //       $("#table-rekap").dataTable();
            //     }, 1000);
            }
        });
    }
  },
  "change #selectUnitForm"(e, t) {
    t.choosedPartner.set(e.target.value);
  }
});

Template.historyAttendance.onCreated(function () {
  const self = this;

  self.dataPresensi = new ReactiveVar();
  self.thisUserOutlets = new ReactiveVar();
  self.viewMode = new ReactiveVar(0);
  self.dataRekap = new ReactiveVar();
  self.selectedUnit = new ReactiveVar();

  self.selectedMonth = new ReactiveVar(moment().format("YYYY-MM"));
  const month = moment(self.selectedMonth.get(), "YYYY-MM").month() + 1;
  const year = moment(self.selectedMonth.get(), "YYYY-MM").year();

  const filter = {
    month,
    year,
  };

  Meteor.call("getPartnersUser", function (error, result) {
    // console.log(userId);
    // console.log(result);
    if (result) {
      self.thisUserOutlets.set(result);
    } else {
      console.log(error);
    }
  });

  Meteor.call(
    "staffsAttendance.historyRekap",
    "0",
    filter,
    function (error, result) {
      if (result) {
        // console.log(result);
        self.dataRekap.set(result);
      } else {
        console.log(error);
      }
    }
  );

  startSelect2();
});
Template.historyAttendance.onRendered(function () {});
Template.historyAttendance.helpers({
  presensi() {
    return Template.instance().dataPresensi.get();
  },
  currentMonth() {
    return Template.instance().selectedMonth.get();
        },
  outletsUser() {
    return Template.instance().thisUserOutlets.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
  userDetails() {
    const dataPresensi = Template.instance().dataPresensi.get();
    return dataPresensi[0];
  },
  dataRekap() {
    return Template.instance().dataRekap.get();
  },
});
Template.historyAttendance.events({
  "change #select-outlets": function (e, t) {
    e.preventDefault();
    const outlet = e.target.value;
    const dataPresensi = t.dataPresensi.get();
    Meteor.call("staffsAttendance.inThisDay", function (error, result) {
      if (result) {
        if (outlet == "Semua") {
          t.dataPresensi.set(result);
        } else {
          const filtering = _.filter(result, {
            outlets: outlet.toLowerCase(),
          });
          t.dataPresensi.set(filtering);
        }
      }
    });
  },
  "change #select-period": function (e, t) {
    e.preventDefault();
    let selectedMonth = $(e.target).val();
    t.selectedMonth.set(selectedMonth);

    const month = moment(t.selectedMonth.get(), "YYYY-MM").month() + 1;
    const year = moment(t.selectedMonth.get(), "YYYY-MM").year();

    const filter = {
      month,
      year,
    };

    // console.log(filter);

    Meteor.call(
      "staffsAttendance.historyRekap",
      "0",
      filter,
      function (error, result) {
        if (result) {
          // console.log(result);
          t.dataRekap.set(result);
        } else {
          console.log(error);
        }
      }
    );

    startSelect2();
  },
  "click #detailsView": function (e, t) {
    const idUser = $(e.target).attr("milik");
    Meteor.call(
      "staffsAttendance.inThisMonth",
      idUser,
      function (error, result) {
        if (result) {
          // getFireImage("staffs/" + idUser, "profile");
          t.dataPresensi.set(result);
          t.viewMode.set(1);
        } else {
          console.log(error);
        }
      }
    );
  },
  "click #today": function (e, t) {
    Meteor.call("staffsAttendance.inThisDay", function (error, result) {
      if (result) {
        t.dataPresensi.set(result);
        t.viewMode.set(0);
      }
    });
  },
});

Template.cetakRekap.onCreated(function () {
  const self = this;
  self.dataRekap = new ReactiveVar();
  self.startDate = new ReactiveVar();
  self.endDate = new ReactiveVar();
  self.thisUserPartners = new ReactiveVar();

  const code = FlowRouter.current().params._code;


  Meteor.call("staffsAttendance.getRekap",code,function (error, result) {
    // console.log(result);
      if (result) {
      self.dataRekap.set(result);
      }
      else {
        console.log(error);
      }
  });
});
Template.cetakRekap.helpers({
    dataRekap: function () {
        return Template.instance().dataRekap.get();
    },
    partners() {
        return Template.instance().thisUserPartners.get();
    },
});
Template.cetakRekap.events({

    "click #cetak-rekap"(e, t) {
        document.title = "Rekap";
        window.print()
        var element = document.getElementById("table-rekap");
        var opt = {
          margin: 0.5,
          filename: "hasilKhs.studentName" + ".pdf",
          enableLinks: false,
          image: {
            type: "jpeg",
            quality: 0.98
          },
          html2canvas: {
            scale: 2
          },
          jsPDF: {
            unit: "in",
            format: "A4",
            orientation: "landscape"
          },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        },
        };

        html2pdf()
          .from(element)
          .set(opt)
          .toPdf()
          .get("pdf")
          .then(function (pdf) {
            var totalPages = pdf.internal.getNumberOfPages();
            for (var i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(10);
              pdf.setTextColor(150);
            }
          })
          .save();
    },

});

Template.cetakRekapIndividu.onCreated(function () {
  const self = this;
  self.dataRekap = new ReactiveVar();
  self.startDate = new ReactiveVar();
  self.endDate = new ReactiveVar();
  self.thisUserPartners = new ReactiveVar();

  const code = FlowRouter.current().params._userId;
  const month = FlowRouter.current().params._month;


  Meteor.call("staffsAttendance.getRekapByUser",code,month,function (error, result) {
    // console.log(result)
    if (result) {
      self.dataRekap.set(result);
    }
    else {
      alert("Data tidak ada!");
      history.back();
    }
  });
});
Template.cetakRekapIndividu.helpers({
  dataRekap: function () {
    return Template.instance().dataRekap.get();
  },
  partners() {
    return Template.instance().thisUserPartners.get();
  },
});
Template.cetakRekapIndividu.events({

  "click #cetak-rekap"(e, t) {
    document.title = "Rekap";
    window.print()
    // var element = document.getElementById("table-rekap");
    // var opt = {
    //   margin: 0.5,
    //   filename: "hasilKhs.studentName" + ".pdf",
    //   enableLinks: false,
    //   image: {
    //     type: "jpeg",
    //     quality: 0.98
    //   },
    //   html2canvas: {
    //     scale: 2
    //   },
    //   jsPDF: {
    //     unit: "in",
    //     format: "A4",
    //     orientation: "landscape"
    //   },
    //   pagebreak: {
    //     mode: ['avoid-all', 'css', 'legacy']
    // },
    // };

    // html2pdf()
    //   .from(element)
    //   .set(opt)
    //   .toPdf()
    //   .get("pdf")
    //   .then(function (pdf) {
    //     var totalPages = pdf.internal.getNumberOfPages();
    //     for (var i = 1; i <= totalPages; i++) {
    //       pdf.setPage(i);
    //       pdf.setFontSize(10);
    //       pdf.setTextColor(150);
    //     }
    //   })
    //   .save();
  },

});

Template.configurasiList.onCreated(function () {
  const self = this;

  self.dayList = new ReactiveVar(churchOperationalDays);
  self.clockList = new ReactiveVar();
  self.employees = new ReactiveVar();
  self.scheduleList = new ReactiveVar();
  self.schedulePairings = new ReactiveVar([]);
  self.thisUserPartners = new ReactiveVar();
  self.viewMode = new ReactiveVar("0");
  self.viewCreate = new ReactiveVar(false);
  self.dataEditShift = new ReactiveVar();
  self.statusOptionUnit = new ReactiveVar();
  self.statusOptionKaryawan = new ReactiveVar();

  Meteor.call("getAll.clockShift", function (error, result) {
    if (result) {
      self.clockList.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call("getEmployees", function (error, result) {
    if (result) {
      self.employees.set(result);
      // self.employeesPartner.set(result);
    } else {
      console.log("Error Get Karyawan");
    }
  });
  Meteor.call("getAll.scheduleAttendanceList", function (error, result) {
    if (result) {
      // console.log(result);
      self.scheduleList.set(result);
    } else {
      console.log(error);
    }
  });
  Meteor.call("getPartnersUser", function (error, result) {
    if (result) {
      self.thisUserPartners.set(result);
    } else {
      console.log(error);
    }
  });

  startSelect2();
});
Template.configurasiList.helpers({
  employees() {
    return Template.instance().employees.get();
  },
  list() {
    return Template.instance().clockList.get();
  },
  listDay() {
    return Template.instance().dayList.get();
  },
  scheduleList() {
    return Template.instance().scheduleList.get();
  },
  schedulePairings() {
    return Template.instance().schedulePairings.get();
  },
  viewCreate() {
    return Template.instance().viewCreate.get();
  },
  viewMode() {
    return Template.instance().viewMode.get();
  },
  partners() {
    return Template.instance().thisUserPartners.get();
  },
  dataEditShift() {
    return Template.instance().dataEditShift.get();
  },
  statusOptionUnit() {
    return Template.instance().statusOptionUnit.get();
  },
  statusOptionKaryawan() {
    return Template.instance().statusOptionKaryawan.get();
  },

});
Template.configurasiList.events({
  "click #btn-test"(e, t){
    e.preventDefault()
    console.log("masuk");
  },
  "click #btn-add-pair"(e, t) {
    e.preventDefault()
    const dataRow = t.schedulePairings.get();
    const selectedSchedules = $("#inputShiftPairings").val();
    const selectedEmployees = $("#inputEmployeesPairings").val();
    const selectUnitForm = $("#selectUnitForm").val();
    if (selectUnitForm.length > 0) {
      for (let index = 0; index < selectUnitForm.length; index++) {
        const selectPartner = selectUnitForm[index];
        const employees = t.employees.get();
        const employeesFilter = _.filter(employees, function (data) {
          return data.outlets.includes(selectPartner);
        });
        console.log(employeesFilter);

        for (let index2 = 0; index2 < employeesFilter.length; index2++) {
          console.log(index2);
          const element = employeesFilter[index2];
          const userId = element._id;
          const dataTemp = {
            userId: userId,
            fullName: element.full_name,
            jabatan: element.job_position,
            schedules: [],
          };

          for (let ii = 0; ii < selectedSchedules.length; ii++) {
            const ele = selectedSchedules[ii];
            const split2 = ele.split("-");
            const dataTemp2 = {
              scheduleId: split2[0],
              scheduleName: split2[1],
            };

            dataTemp.schedules.push(dataTemp2);
          }
          dataRow.push(dataTemp);
        }
      }
    }

    if (selectedEmployees.length > 0) {
      for (let index = 0; index < selectedEmployees.length; index++) {
        const element = selectedEmployees[index];
        const splitData = element.split("-");
        const dataTemp = {
          userId: splitData[0],
          fullName: splitData[1],
          jabatan: splitData[2],
          schedules: [],
        };

        for (let ii = 0; ii < selectedSchedules.length; ii++) {
          const ele = selectedSchedules[ii];
          const split2 = ele.split("-");
          const dataTemp2 = {
            scheduleId: split2[0],
            scheduleName: split2[1],
          };

          dataTemp.schedules.push(dataTemp2);
        }
        dataRow.push(dataTemp);
      }
    }
    console.log(dataRow);
    t.schedulePairings.set(dataRow);
    console.log(t.schedulePairings.get());
  },
  "click #btn-view-configuration"(e, t) {
    const viewMode = $(e.target).attr("milik");
    t.viewMode.set(viewMode);
  },
  "click #btn-save-clocks"(e, t) {
      const name = $("#input-name-shift").val();
      const clockIn = $("#input-clockIn").val();
      const clockOut = $("#input-clockOut").val();

      // console.log(name, clockIn, clockOut);

      const postRoute = "create.clockShift";

      Meteor.call(postRoute, name, clockIn, clockOut, function (error, result) {
        if (result) {
          successAlert("Berhasil");
          location.reload();
        } else {
          failAlert("Gagal");
          console.log(error);
        }
      });
  },
  "change #inputShift"(e, t) {
      const shift = e.target.value;
      const day = $(e.target).attr("milik");

      const listDay = t.dayList.get();
      // console.log(listDay);
      const selectedDay = _.find(listDay, function (x) {
        return x.code == day;
      });
      const selectedShift = _.find(t.clockList.get(), function (x) {
        return x._id == shift;
      });

      selectedDay.shiftId = shift;
      selectedDay.shiftName = selectedShift.name;
      selectedDay.clockIn = selectedShift.clockIn;
      selectedDay.clockOut = selectedShift.clockOut;

      t.dayList.set(listDay);
  },
  "change #inputShiftEdit"(e, t) {
      const shift = e.target.value;
      const code = shift.split('-')

      // console.log(code)

      const listSchedule = t.scheduleList.get();
      const thisSchedule = _.find(listSchedule, function (x) {
        return x._id == code[0]
      })

      const thisSchedule2 = _.find(thisSchedule.schedule, function (x) {
        return x.code == code[1]
      })
      const selectedShift = _.find(t.clockList.get(), function (x) {
        return x._id == code[2];
      });

      thisSchedule2.shiftId = selectedShift._id;
      thisSchedule2.shiftName = selectedShift.name;
      thisSchedule2.clockIn = selectedShift.clockIn;
      thisSchedule2.clockOut = selectedShift.clockOut
      // console.log(thisSchedule);
      t.scheduleList.set(listSchedule)
  },
  "click #btn-save-schedule"(e, t) {
      e.preventDefault();
      const name = $("#input-name-jadwal-insert").val();
      const listDay = t.dayList.get();
      // console.log(name, listDay);

      Meteor.call(
        "create.scheduleAttendance",
        name,
        listDay,
        function (error, result) {
          // console.log(error, result);
          if (result) {
            successAlert("Tambah Jadwal Berhasil");
            setTimeout(function() {
              location.reload();
            }, 200);
          } else {
            failAlert("Gagal");
          }
        }
      );
  },
  "click #btn-modal-edit"(e, t){
      const shift = e.target.value;
      const code = shift.split('-')
      const id = $(e.target).attr("milik");
      // console.log(id);


      const listSchedule = t.scheduleList.get();
      const thisSchedule = _.find(listSchedule, function (x) {
        return x._id == id
      })

      // console.log(listSchedule);
      // console.log(thisSchedule);

      t.dayList.set(thisSchedule.schedule)
  },
  "click #btn-save-edit-schedule"(e, t){
    e.preventDefault();
    const listDay = t.dayList.get();
    const id = e.target.getAttribute('milik');
    const name = $("#input-name-"+id).val();
    // console.log(listDay);
    Meteor.call(
      "update.scheduleAttendance",
      id,
      name,
      listDay,
      function (error, result) {
        if (result) {
          successAlert("Ubah Jadwal Berhasil");
          setTimeout(function() {
            location.reload();
          }, 200);
        } else {
          console.log(error);
          failAlert("Gagal");
        }
      }
    );
  },
  "click #btn-modal-edit-shift"(e, t){
    // console.log("masuk");
    const shift = e.target.value;
    const code = shift.split('-')
    const id = $(e.target).attr("milik");
    // console.log(id);

    Meteor.call("getById.clockShift", id, function (error, result){
      // console.log(result, error);
      if (result) {
        t.dataEditShift.set(result)
        console.log(t.dataEditShift.get());
      } else {
        console.log(error);
      }
    });
  },
  "click #btn-save-edit-shift"(e, t){
    e.preventDefault();
    const id = $(e.target).attr("milik");
    // console.log(id);
    const nama = $("#input-name-shift-edit-"+id).val();
    const jamMasuk = $("#input-clockIn-shift-edit-"+id).val();
    const jamKeluar = $("#input-clockOut-shift-edit-"+id).val();
    // console.log(nama, jamMasuk, jamKeluar);
    Meteor.call("update.clockShift", id, nama, jamMasuk, jamKeluar, function(error, result){
      // console.log(error, result);
      if(result){
        successAlert("Ubah Data Shift Berhasil");
        setTimeout(function() {
          location.reload();
        }, 200);
      } else {
        failAlert("Gagal");
      }
    })
  },
  "click #btn-create-pairings"(e, t) {
    t.viewCreate.set(true);
    startSelect2();
  },
  "click #btn-save-pairings"(e, t) {
    e.preventDefault();
    const dataRow = t.schedulePairings.get();

    Meteor.call("create.schedulePairings", dataRow, function (error, result) {
      if (result) {
        successAlert("Berhasil");
        t.schedulePairings.set([]);
      } else {
        failAlert("Gagal!");
      }
    });
  },
  "click #btn-remove"(e, t) {
    e.preventDefault();
    // console.log("masuk")
    var dataRow = t.schedulePairings.get();
    const userId = $(e.target).attr("milik");
    dataRow.splice(
      dataRow.findIndex((a) => a.userId == userId),
      1
    );
    t.schedulePairings.set(dataRow);
  },
  "click #btn-hapus-jadwal"(e, t){
    e.preventDefault();
    const id = e.target.getAttribute('milik');
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete jadwal ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed){
        Meteor.call("delete.scheduleAttendance", id, function (error, result){
          // console.log(result, error);
          if (result) {
            successAlert("Hapus Data Berhasil");
            setTimeout(function() {
              location.reload();
            }, 200);

          } else {
            console.log(error);
            failAlert("Hapus Data Gagal!");
          }
        })
      }
    })
  },
  "click #btn-hapus-shift"(e, t){
    e.preventDefault();
    console.log("masuk");
    const id = e.target.getAttribute('milik');
    Swal.fire({
      title: "Konfirmasi Delete",
      text: "Apakah anda yakin melakukan delete shift ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed){
        Meteor.call("delete.clockShift", id, function (error, result){
          // console.log(error,result);
          if (result) {
            successAlert("Hapus Data Berhasil");
            setTimeout(function() {
              location.reload();
            }, 200);

          } else {
            console.log(error);
            failAlert("Hapus Data Gagal!");
          }
        })
      }
    });

  },
  "click #inputEmployeesPairings" (e, t){
    const statusUnit = "Disabled";
    const statusKaryawan = "";
    t.statusOptionUnit.set(statusUnit);
    t.statusOptionKaryawan.set(statusKaryawan);
  },
  "click #selectUnitForm" (e, t){
    const statusUnit = "";
    const statusKaryawan = "Disabled";
    t.statusOptionUnit.set(statusUnit);
    t.statusOptionKaryawan.set(statusKaryawan);
  },
});

Template.configurasiDetails.onCreated(function () {
  const self = this;
  const paramsId = FlowRouter.current().params._id;

  self.listEmployess = new ReactiveVar();
  Meteor.call("scheduleEmployes", paramsId, function (error, result) {
    if (result) {
      self.listEmployess.set(result);
      DataTable(window, $);
      setTimeout(() => {
        $("#mytable").DataTable;
      }, 1000);
    }
  });
});
Template.configurasiDetails.onRendered(function () {});
Template.configurasiDetails.helpers({
  listEmployess() {
    return Template.instance().listEmployess.get();
  },
});
Template.detailWfh.onCreated(function () {
  const self = this;
  const id = Router.current().params._id;

  self.detailWfh = new ReactiveVar()

  Meteor.call("staffsAttendance.getById", id, function (error, result) {
    if (result) {
      console.log(result);
      self.detailWfh.set(result);
    } else {
      console.log(error);
    }
  })
})
Template.detailWfh.helpers({
  detailWfh() {
    return Template.instance().detailWfh.get();
  }
})

startSelect2 = function () {
  setTimeout(() => {
    $(".select2").select2();
  }, 300);
};


// Template.detailAttendance.onCreated(function () {
//   const self = this;
//   const idUser = FlowRouter.current().params._id;

//   self.detailAttendance = new ReactiveVar()

//   Meteor.call(
//     "staffsAttendance.inThisMonth",
//     idUser,
//     function (error, result) {
//       if (result) {
//         console.log("datapresensi:", dataPresensi);
//         // getFireImage("staffs/" + idUser, "profile");
//         t.dataPresensi.set(result);
//         t.viewMode.set(1);
//       } else {
//         console.log(error);
//       }
//     }
//   );
// })
// Template.detailAttendance.helpers({
//   detailAttendance() {
//     return Template.instance().detailAttendance.get();
//   }
// })


// Template.modalShowEdit.events({
//   "click #btn-modal-edit"(e, t) {
//     // startSelect2()
//   },

// })

Template.listPermits.onCreated(function () {
  const self = this;
  self.dataPermit = new ReactiveVar();
  Meteor.call("getAll.permit", function (error, result) {
    if (result) {
      self.dataPermit.set(result);
    } else {
      console.log(error);
    }
  });
});
Template.listPermits.helpers({
  dataPermit() {
    return Template.instance().dataPermit.get();
  },
});
Template.listPermits.events({
  'click #btn-search'(e,t){
    e.preventDefault()

    const selectPeriod = $("#select-period").val();

    Meteor.call('getPermit.byMonth', selectPeriod, function(error, result){
      if(result){
        console.log(result);
        t.dataPermit.set(result)
      }else{
        console.log(error)
      }
    })
  },
  'click .btn-approve'(e,t){
    e.preventDefault();

    const id = $(e.target).attr("milik");

    Swal.fire({
      title: "Konfirmasi Reject",
      text: "Apakah anda yakin ingin menolak permit ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed){
        Meteor.call('approvePermit', id, function(error, result){
          if(result){ successAlert("Approve Permit Berhasil");
            setTimeout(function() {
              location.reload();
            }, 200);          }else{
            failAlert("Approve Permit Gagal!");
          }
        })
      }
    })


  },
  'click .btn-reject'(e,t){
    e.preventDefault();

    const id = $(e.target).attr("milik");

    Swal.fire({
      title: "Konfirmasi Reject",
      text: "Apakah anda yakin ingin menolak permit ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal"
    }).then((result) => {
      if(result.isConfirmed){
        Swal.fire({
          title: "Alasan Tolak",
          input : 'text',
          preConfirm: (text) => {
            if(text){
              Meteor.call('rejectPermit', id, text, function(error, result){
                if(result){
                  successAlert("Reject Permit Berhasil");
                  setTimeout(function() {
                    location.reload();
                  }, 200);
                }else{
                  failAlert("Reject Permit Gagal!");
                }
              })
            }
          }
        })
      }
    })


  },
});