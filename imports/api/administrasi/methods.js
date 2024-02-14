import moment from "moment";
require("moment-weekday-calc");
import _ from "underscore";
import { AppProfiles, AppUsers } from "../../collections-profiles";
import {
  StaffsAttendance,
  Letters,
  Proposals,
  ConfigCategoriesLetters,
  Divisions,
  DispositionsConfig,
  Permits,
  Chronicles,
  KlasifikasiSubject,
  KlasifikasiAktifitas,
  KlasifikasiLingkup,
  MonthlyAttendance,
  ClockShifts,
  ScheduleAttendance,
  ConfigAttendanceUser,
  Partner,
} from "./administrasi.js";
import { sendEmail } from "../mailgun/mailgun.js";
import { MongoObject } from "simpl-schema";
import XLSX from "xlsx";
import { KevikepanStruktur } from "../keuskupan/keuskupan.js";
import { data } from "jquery";

function addWeekdays(date, days) {
  date = moment(date); // use a clone
  while (days > 0) {
    date = date.add(1, "days");
    // decrease "days" only if it's a weekday.
    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
      days -= 1;
    }
  }
  return date;
}

Meteor.methods({
  "staffsAttendance.getAll"() {
   
    return StaffsAttendance.find().fetch();
  },
  "staffsAttendance.inThisMonth"(userId, startDate, endDate) {
    check(userId, String);

    if (!startDate && !endDate) {
      startDate = moment().startOf("month");
      endDate = moment().endOf("month");
    } else {
       startDate = moment(startDate).utcOffset("+07:00").startOf("day");
       endDate = moment(endDate).utcOffset("+07:00").endOf("day");
    }

    const dataStaffsAttendance = StaffsAttendance.find({
      userId: userId,
      checkIn: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).fetch();

    const dataReturn = [];
    //find user profile
    _.each(dataStaffsAttendance, function (x) {
      const userObjecId = new Mongo.Collection.ObjectID(x.userId);
      const userProfile = AppProfiles.findOne({
        _id: userObjecId,
      });

      x.fullName = userProfile.fullName;
      x.jabatan = userProfile.jabatan;

      dataReturn.push(x);
    });
    console.log(dataReturn);
    return dataReturn;
  },
  "staffsAttendance.inThisDay"() {
    const thisUser = Meteor.users.findOne({
      _id: this.userId,
    });
    const startDate = moment().utcOffset("+07:00").startOf("day");
    const endDate = moment().utcOffset("+07:00").endOf("day");

    const dataStaffsAttendance = StaffsAttendance.find({
      checkIn: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).fetch();

    const dataReturn = [];

    //find user profile
    _.each(dataStaffsAttendance, function (x) {
      const user = AppUsers.findOne({
        profileId: x.userId,
        outlets: {
          $in: thisUser.partners,
        },
      });

      if (user) {
        if (x.userId) {
          const userObjecId = new Mongo.Collection.ObjectID(x.userId);
          const userProfile = AppProfiles.findOne({
            _id: userObjecId,
          });
          // console.log(userProfile);

          x.fullName = userProfile.fullName;
          x.jabatan = userProfile.jabatan;
          x.outlets = user.outlets[0];

          dataReturn.push(x);
        }
      }
    });
    return dataReturn;
  },
  "staffsAttendance.byDate"(date) {
    const thisUser = Meteor.users.findOne({
      _id: this.userId,
    });
    const startDate = moment(date).utcOffset("+07:00").startOf("day");
    const endDate = moment(date).utcOffset("+07:00").endOf("day");

    const dataStaffsAttendance = StaffsAttendance.find({
      checkIn: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).fetch();

    const dataReturn = [];

    //find user profile
    _.each(dataStaffsAttendance, function (x) {
      const user = AppUsers.findOne({
        profileId: x.userId,
        outlets: {
          $in: thisUser.partners,
        },
      });

      if (user) {
        if (x.userId) {
          const userObjecId = new Mongo.Collection.ObjectID(x.userId);
          const userProfile = AppProfiles.findOne({
            _id: userObjecId,
          });
          // console.log(userProfile);

          x.fullName = userProfile.fullName;
          x.jabatan = userProfile.jabatan;
          x.outlets = user.outlets[0];

          dataReturn.push(x);
        }
      }
    });
    return dataReturn;
  },
  async "staffsAttendance.getById"(id) {
    check(id, String);

    const objectId = new Meteor.Collection.ObjectID(id);
   
    const thisPresensi = await StaffsAttendance.findOne({
      "_id": objectId
    });
    
    const thisUser = await AppProfiles.findOne({
      "_id" : new Meteor.Collection.ObjectID(thisPresensi.userId)
    })

    thisPresensi.fullName = thisUser.fullName;
    thisPresensi.jabatan = thisUser.jabatan;
    thisPresensi.outlets = thisUser.outlets[0];

    return thisPresensi;
  },
  "staffsAttendance.getBy"(code) {
    check(code, Object);
    let filter = {};

    if (code.code == 1) {
    }
  },
  "staffsAttendance.getRekap"(code) {
    check(code, String);
    const thisUser = Meteor.users.findOne({
      '_id' : this.userId
    })
     let dataRekap;
    if (code == "0") {
      dataRekap = MonthlyAttendance.find({
        outlets: {
          $in: thisUser.partners
        }
      }).fetch();   
      dataRekap =dataRekap.map(obj => obj.details).flat()
      
    } else {
      dataRekap = MonthlyAttendance.findOne({
        'outlets' : code
      })
    }

    return dataRekap
   
  },
  async "staffsAttendance.getRekapByUser"(userId, monthData) {
    check(userId, String);
    const thisUser = AppProfiles.findOne({
      '_id' : new Mongo.Collection.ObjectID(userId)
    })

    const month = monthData.split('-')[1];
    const year = monthData.split('-')[0];

    const monthly = MonthlyAttendance.findOne({
      'outlets': thisUser.outlets[0],
      'year': parseInt(year),
      'month': parseInt(month)
    });
    
    const userMonthly = _.find(monthly.details, function (x) {
      return x.userId == userId
    })
   
    const startDate = moment(monthData).startOf("month");
    const endDate = moment(monthData).endOf("month");
    dataRekap = await StaffsAttendance.find({
      "userId": userId,
      checkIn: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).fetch();   
    
    const thisOutlet = Partner.findOne({
      'code' : thisUser.outlets[0]
    })
    //get set jadwal untuk user
    const schedule = await ConfigAttendanceUser.findOne({
      'userId': userId
    });
    const detailSchedule = await ScheduleAttendance.findOne({
      '_id' : schedule.schedules[0].scheduleId
    })
    const listSchedules = detailSchedule.schedule;
    
    _.each(dataRekap, function (x) {
      const day = moment(x.checkIn).day();
      const thisSchedule = _.find(listSchedules, function (y) {
        return y.code == day
      })
      x.clockInSet = thisSchedule.clockIn;
      x.clockOutSet = thisSchedule.clockOut
    })
    console.log(userMonthly);
    console.log(moment(monthData).startOf('month').toDate());
    
    if (userMonthly) {
      userMonthly.schedule= detailSchedule.name,
        userMonthly.details = dataRekap
      
      const presentaseKehadiran = (userMonthly.totalPresensi/monthly.activeDayWorking) * 100
      
      userMonthly.presentaseKehadiran = presentaseKehadiran
      return userMonthly
    } else {
      return false;
    }
   
  },
  "staffsAttendance.rekap"(totalDayOf, startDate, endDate) {
    //Get outlets berdasarkan admin
    const thisUser = Meteor.users.findOne({
      "_id" : this.userId
    });


    startDate = moment().utcOffset("+07:00").startOf("month");
    endDate = moment().utcOffset("+07:00").endOf("month");

    const totalDay = moment().weekdayCalc(startDate, endDate, [1, 2, 3, 4, 5,6]);

    const activeWorkingDays = totalDay - parseInt(totalDayOf);

    const rekap = [];
    // each outlets/partners
    _.each(thisUser.partners, function (outlet) {
      const thisOutlet = Partner.findOne({
        'code' : outlet
      })
      const dataStaffsAttendance = AppUsers.find({
        outlets: outlet,
      }).fetch();

      const dataReturn = [];
      //find user profile
      _.each(dataStaffsAttendance, function (x) {
        const dataUser = {};
        if (x.profileId) {
          const userObjecId = new Mongo.Collection.ObjectID(x.profileId);
          const userProfile = AppProfiles.findOne({
            _id: userObjecId,
            outlets: {
              $in: [outlet],
            },
          });
          if (userProfile) {
            dataUser.userId = x.profileId;
            dataUser.fullName = userProfile.fullName;
            dataUser.jabatan = userProfile.jabatan;
            dataUser.unit = thisOutlet.name;

            //get data absensi
            const dataStaffsAttendance = StaffsAttendance.find({
              userId: x.profileId,
              checkIn: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }).fetch();
            
            if (dataStaffsAttendance) {
              //cek late
              const late = _.filter(dataStaffsAttendance, function (x) {
                return x.isLate 
              })
              if (late.length > 0) {
                var timestamps = [];
                _.each(late, function (thisLate) {
                  var dateLate = moment(thisLate.checkIn).format('DD/MM')
                  timestamps.push({
                    timeStamp : dateLate
                  });
                })
                dataUser.timeStamps = timestamps;
                dataUser.totalLate = late.length;
              }
              dataUser.totalPresensi = dataStaffsAttendance.length;
              dataUser.dafOf = activeWorkingDays - dataStaffsAttendance.length;
            }
          }
          dataReturn.push(dataUser);
        }
      });
      const dataNew = {
        activeDayWorking: activeWorkingDays,
        dayOf: totalDayOf,
        month: moment().month() + 1,
        year: moment().year(),
        outlets: outlet,
        details: dataReturn,
      };

      const checkRekap = MonthlyAttendance.findOne({
        month: moment().month() + 1,
        year: moment().year(),
        outlets: outlet,
      });
      if (checkRekap) {
        MonthlyAttendance.update(
          {
            _id: checkRekap._id,
          },
          {
            $set: dataNew,
          }
        );
        rekap.push(dataNew);
      } else {
        MonthlyAttendance.insert(dataNew);
        rekap.push(dataNew);
      }
    });
    const details = rekap.map(obj => obj.details).flat();
    const dataReturn = {
      activeDayWorking: rekap[0].activeDayWorking,
      dayOf: rekap[0].dayOf,
      month: rekap[0].month,
      year: rekap[0].month,
      details : details
    }
    
    return dataReturn;
  },
  "staffsAttendance.insertRekap"(data) {},
  "staffsAttendance.historyRekap"(code, filter) {
  
    check(code, String);
    const thisUser = Meteor.users.findOne({
      '_id' : this.userId
    })

    let dataReturn = {};
     let dataRekap;
    if (code == "0") {
      dataRekap = MonthlyAttendance.find({
        month: parseInt(filter.month),
        year : parseInt(filter.year),
        outlets: {
          $in: thisUser.partners
        }
      }).fetch();  
      console.log(dataRekap);
      dataReturn.activeDayWorking = dataRekap[0].activeDayWorking;
      dataReturn.dayOf = dataRekap[0].dayOf;
    } else {
      dataRekap = MonthlyAttendance.findOne({
        month: parseInt(filter.month),
        year : parseInt(filter.year),
        'outlets' : code
      })
    }
    dataRekap =dataRekap.map(obj => obj.details).flat()
    dataReturn.details = dataRekap;
    return dataReturn
  },

  //Start Configurations Attendance
  "create.clockShift"(name, clockIn, clockOut) {
    const thisUser = Meteor.users.findOne({ _id: Meteor.userId() });

    check(name, String);
    check(clockIn, String);
    check(clockOut, String);

    const dataSave = {
      name,
      clockIn,
      clockOut,
      cteateAt: new Date(),
      cteatedBy: thisUser._id,
      createdByName: thisUser.fullname,
    };

    return ClockShifts.insert(dataSave);
  },
  "getAll.clockShift"() {
    return ClockShifts.find().fetch();
  },
  "create.scheduleAttendance"(name, dataSend) {
    check(name, String);
    check(dataSend, Array);

    const thisUser = Meteor.users.findOne({
      _id: Meteor.userId(),
    });

    const dataSave = {
      name: name,
      schedule: dataSend,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      createdByName: thisUser.fullname,
    };

    return ScheduleAttendance.insert(dataSave);
  },
  "getAll.scheduleAttendanceList"() {
    return ScheduleAttendance.find().fetch();
  },
  async "create.schedulePairings"(dataSave) {
    check(dataSave, Array);
    for (let index = 0; index < dataSave.length; index++) {
      var element = dataSave[index];
      element.createdAt = new Date();
      element.createdBy = Meteor.userId();
      //check dulu apa sudah ada pairings jadwal
      const check = await ConfigAttendanceUser.findOne({
        userId: element.userId,
      });

      //get partner
      const thisEmployee = AppProfiles.findOne({
        _id: new Meteor.Collection.ObjectID(element.userId),
      });
      element.partners = thisEmployee.partners;
      if (check) {
        for (let ii = 0; ii < element.schedules.length; ii++) {
          const el = element.schedules[ii];
          const updateData = await ConfigAttendanceUser.update(
            {
              _id: check._id,
            },
            {
              $addToSet: {
                schedules: el,
              },
            }
          );
        }
      } else {
        await ConfigAttendanceUser.insert(element);
      }
    }
    return true;
  },
  async scheduleEmployes(id) {
    const data = ConfigAttendanceUser.find({
      "schedules.scheduleId": id,
    }).fetch();
    return data;
  },
  // START LETTERS
  initLetters() {
    const thisUser = Meteor.users.findOne({_id: this.userId});

    return Letters.insert({
      createdBy: thisUser._id,
      createdAt: new Date(),
      currentState: {
        status: -1,
      },
      log: [
        {
          type: "insert",
          createdBy: thisUser._id,
          createdAt: new Date(),
        },
      ],
    });
  },
  initConfigCategories() {
    const thisUser = Meteor.users.findOne({_id: this.userId});

    return ConfigCategoriesLetters.insert({
      createdBy: thisUser._id,
      log: [
        {
          type: "insert",
          createdBy: thisUser._id,
          createdAt: new Date(),
        },
      ],
    });
  },
  createConfigCategories(data) {
    console.log(data);
    check(data, Object);

    data.createdBy = Meteor.userId();
    data.createdAt = new Date();
    data.log = {
      type: "insert",
      createdBy: Meteor.userId(),
      createdAt: new Date(),
    };
    return ConfigCategoriesLetters.insert(data);
  },
  editConfigCategories(data) {
    check(data, Object);

    const thisId = data._id;
    delete data._id;

    data.createdBy = Meteor.userId();
    data.createdAt = new Date();
    data.log = {
      type: "update",
      createdBy: Meteor.userId(),
      createdAt: new Date(),
    };
    return ConfigCategoriesLetters.update(
      {
        _id: thisId,
      },
      {
        $set: data,
      }
    );
  },
  getAllConfigCategoriesLetters() {
    return ConfigCategoriesLetters.find().fetch();
  },
  getByConfigCategoriesLetters(filter) {
    return ConfigCategoriesLetters.findOne(filter);
  },

  createLetters(data) {
    check(data, Object);
    console.log(data);
    const division = data.division;
    const externalRecipient = data.externalRecipient;
    const category = data.category;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const lettersLength = Letters.find({
      category,
      division,
    }).count();
    let countLetter;
    if (lettersLength < 1) {
      countLetter = addingZeros(1, 3);
    } else {
      countLetter = addingZeros(lettersLength + 1, 3);
    }
    //penomoran
    data.numberOfLetter =
      countLetter +
      "/YG/PWKI-SBY/" +
      division +
      "." +
      externalRecipient +
      "/" +
      month +
      "." +
      year;
    //get head of unit
    const divisionData = Divisions.findOne({
      numberOfUnit: division,
    });

    //tambahan data
    approval1 = {
      userId: divisionData.chiefId,
      divisionId: divisionData._id,
      status: 0,
      note: "",
      level: 1,
    };
    //get gm dan praeses
    const generalManager = Meteor.users.findOne({
      roles: "generalManager",
    });
    const praeses = Meteor.users.findOne({
      roles: "praeses",
    });
    approval2 = {
      userId: generalManager._id,
      divisionId: "",
      status: 0,
      note: "",
      level: 2,
    };
    data.approval1 = [approval1];
    data.approval2 = [approval2];
    if (category == "S.K") {
      approval3 = {
        userId: praeses._id,
        status: 0,
        note: "",
        level: 3,
      };

      data.approval3 = [approval3];
    }

    data.currentState = {
      levelPosition: 1,
      status: 0,
    };
    data.createdBy = Meteor.userId();
    data.divisionId = Meteor.user().divisionId;
    data.createdAt = new Date();
    return Letters.insert(data);
  },
  deleteLetter(id) {
    check(id, String);
    return Letters.remove({
      _id: id,
    });
  },
  editLetter(data) {
    check(data, Object);

    const id = data.id;
    delete data.id;
    //get data surat
    const dataLetter = Letters.findOne({
      _id: id,
    });

    //get data surat dengan kategori
    const dataLetterInCategory = Letters.find({
      category: data.category,
    }).fetch();

    //set approval
    //getting data approval by category
    const categoryData = ConfigCategoriesLetters.findOne({
      _id: data.category,
    });

    data.approval1 = categoryData.approval1;
    data.approval2 = categoryData.approval2;
    data.approval3 = categoryData.approval3;
    data.approval4 = categoryData.approval4;
    //getting letterNumber
    const number = categoryData.numberOfLetter + dataLetterInCategory.length;
    const formatNumber =
      ("000" + number).substr(-3) + categoryData.formatNumberOfLetter;
    data.numberOfLetter = formatNumber;
    return Letters.update(
      {
        _id: id,
      },
      {
        $set: data,
      },
      {
        $addToSet: {
          log: {
            type: "edit",
            createdBy: Meteor.userId(),
            createdAt: new Date(),
          },
        },
      }
    );

    // return Letters.update({
    //     "_id": id
    // }, {
    //     $set: {
    //         'currentState.status': 0
    //     },
    //     $addToSet : {
    //         'log' : {
    //             type : 'edit',
    //             createdBy : Meteor.user(),
    //             createdAt : new Date()
    //         }
    //     }
    // });
  },
  letterDetails(id) {
    check(id, String);
    return Letters.findOne({
      _id: id,
    });
  },
  getLetterById(id) {
    check(id, String);
    return Letters.findOne({
      _id: id,
    });
  },
  "getLettersByDivision.Status"(status) {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    //(thisUser.roles);
    const role = thisUser.roles;

    const filter = {
      divisionId: thisUser.divisionId,
      "approval1.status": status,
    };
    //pengkondisian

    if (role == "chief") {
      //("filter");
      if (status == 99) {
        filter.createdBy = thisUser._id;
      }
      //(filter);
    }
    //filter

    return Letters.find(filter).fetch();
  },
  getLetterByCategory(data) {
    check(data, Object);

    const category = data.categoryLetter;
    const division = data.division;
    return Letters.find({
      category,
      division,
    }).fetch();
  },
  getLetters() {
    return Letters.find({}).fetch();
  },
  "update.statusLetter"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;

    let filter;

    if (data.status == 1) {
      //get data surat untuk mengupdate approve
      const dataLetter = Letters.findOne({
        _id: data.letterId,
      });
      //current state
      const currentState = dataLetter.currentState;
      //cek jumlah approval level sekarang
      if (currentState.levelPosition == 1) {
        const approval1 = dataLetter.approval1;

        const lengthApproval1 = approval1.length;
        const updateCheck = Letters.update(
          {
            _id: data.letterId,
            "approval1.divisionId": thisUser.divisionId,
          },
          {
            $set: {
              "approval1.$.status": 1,
            },
          }
        );

        const checkApprove = _.filter(approval1, {
          status: 1,
        });
        console.log(lengthApproval1);
        console.log(checkApprove.length);
        if (checkApprove.length + 1 == lengthApproval1) {
          const cekNextApprove = dataLetter.approval2;
          const dataTemp = {
            status: 0,
            levelPosition: 2,
          };

          if (cekNextApprove.length < 1) {
            (dataTemp.status = 1), (dataTemp.levelPosition = 4);
          }
          return Letters.update(
            {
              _id: data.letterId,
            },
            {
              $set: {
                currentState: dataTemp,
              },
            }
          );
        } else {
          console.log("kurang");
          return true;
        }
      } else if (currentState.levelPosition == 2) {
        const approval2 = dataLetter.approval2;
        //get jumlah approval level 1
        const lengthApproval2 = approval2.length;
        const updateCheck = Letters.update(
          {
            _id: data.letterId,
            "approval2.userId": thisUser._id,
          },
          {
            $set: {
              "approval2.$.status": 1,
            },
          }
        );
        if (updateCheck < 1) {
          throw new Meteor.Error(404, "Id denied");
        }
        //check apakah sudah ada yang approve
        const checkApprove = _.filter(approval2, {
          status: 1,
        });

        if (checkApprove.length + 1 == lengthApproval2) {
          const checkLevel3 = dataLetter.approval3;
          let levelPosition = 3;
          let status = 0;
          let approveDate = 0;
          const updateData = {
            status,
            levelPosition,
          };

          if (!checkLevel3) {
            updateData.status = 1;
            approveDate = new Date();
          }
          return Letters.update(
            {
              _id: data.letterId,
            },
            {
              $set: {
                currentState: updateData,
                approveDate,
              },
            }
          );
        } else {
          return true;
        }
      } else if (currentState.levelPosition == 3) {
        const approval3 = dataLetter.approval3;
        //get jumlah approval level 1
        const lengthApproval3 = approval3.length;
        const updateCheck = Letters.update(
          {
            _id: data.letterId,
            "approval3.userId": thisUser._id,
          },
          {
            $set: {
              "approval3.$.status": 1,
              "currentState.status": 1,
            },
          }
        );
        if (updateCheck < 1) {
          throw new Meteor.Error(404, "Id denied");
        }
        //check apakah sudah ada yang approve
        const checkApprove = _.filter(approval3, {
          status: 1,
        });
        if (checkApprove.length + 1 == lengthApproval3) {
          return Letters.update(
            {
              _id: data.letterId,
            },
            {
              $set: {
                "currentState.status": 1,
                "currentState.levelPosition": 3,
              },
            }
          );
        } else {
          return true;
        }
      }
    } else if (data.status == 30) {
      // get data letters
      const dataLetter = Letters.findOne({
        _id: data.letterId,
      });

      const checkValue = isEmptyData(dataLetter);
      if (checkValue) {
        throw new Meteor.Error(404, "Ada data yang belum terisi");
      } else {
        const updateStatus = Letters.update(
          {
            _id: data.letterId,
          },
          {
            $set: {
              "currentState.status": 0,
              "currentState.levelPosition": 1,
            },
          }
        );

        if (updateStatus == 1) {
          const createdBy = Meteor.users.findOne({
            _id: dataLetter.createdBy,
          });
          //new data after update
          const dataLetterNew = Letters.findOne({
            _id: data.letterId,
          });

          let idReceiver;
          const currentState = dataLetterNew.currentState;
          const currentLevelPosition = currentState.levelPosition;

          // switch (currentLevelPosition) {
          //     case 1 : {
          //         idReceiver =
          //     }
          // }

          const emailSubject =
            "[IMAVI] Ada Surat baru masuk ke dashboard Anda!";
          const emailMessage =
            "<h3>Hallo, " +
            thisUser.fullname +
            "</h3><p><strong>Ada surat masuk di dashboardmu dengan judul" +
            dataLetter.nameOfLetter +
            "dari " +
            createdBy.fullname +
            ".</strong></p>" +
            "<p>Silahkan buka dashboard anda untuk melihat isi dari surat tersebut atau klik tombol dibawah ini</p>" +
            "<div> <a href='https://next.imavi.org/previewLetter/" +
            data.letterId +
            "'" +
            "style='display:inline-block;background:#0248ff;color:#ffffff;font-family:proxima_nova,sans_serif,Helvetica,Arial;font-size:14px;font-weight:normal;line-height:1.2;margin:0;text-align:center;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;border-radius:15px;box-sizing:border-box' width='385' target='_blank'>Lihat surat </a>" +
            "</div>";
          return sendEmail(data.email, emailSubject, emailMessage);
        } else {
          throw new Meteor.Error(404, "Surat gagal dikirim");
        }
      }
    } else if (data.status == 99) {
      return Letters.update(
        {
          _id: data.letterId,
        },
        {
          $set: {
            "currentState.status": 0,
          },
        }
      );
    } else {
      return Letters.update(
        {
          _id: data.letterId,
        },
        {
          $set: {
            "currentState.status": data.status,
          },
        }
      );
    }
  },
  "update.revisionLetter"(data) {
    check(data, Object);
    const currentUser = Meteor.user();
    const role = currentUser.roles;
    const note = {
      note: data.note,
      noteBy: currentUser._id,
      noteByName: currentUser.fullname,
    };

    return Letters.update(
      {
        _id: data.letterId,
      },
      {
        $set: {
          updateBy: currentUser._id,
          updateAt: new Date(),
          "currentState.note": data.note,
          "currentState.status": data.status,
          "currentState.updatedAt": new Date(),
        },
        $addToSet: {
          note,
        },
      }
    );
    // if (role == 'chief') {

    // } else if (role == 'superadmin'){
    //     return Letters.update({
    //         '_id' : data.letterId,
    //         'approval2.userId' : currentUser._id
    //     }, {
    //         $set : {
    //             'updateBy' : currentUser._id,
    //             'updateAt' : new Date(),
    //             'approval2.note' : data.note,
    //             'approval2.status' : data.status,
    //             'approval2.updatedAt' : new Date(),
    //         },
    //         $addToSet : {
    //             note
    //         }
    //     });
    // }
  },
  newLetters() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;

    let filter = {};
    //(thisUser);

    //staff
    //melihat list  by approval semua 0
    if (Roles.userIsInRole(thisUser, ["staff", "Administrasi","superadmin"])) {
      console.log("disini");
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": {
          $in: [0, -1],
        },
      };
    }
    //chief staff
    //melihat list by approval.level1 0
    else if (Roles.userIsInRole(thisUser, ["praeses"])) {
      filter = {
        $or: [
          {
            "approval1.divisionId": thisUser.divisionId,
          },
          {
            "approval2.divisionId": thisUser.divisionId,
          },
          {
            "approval3.divisionId": thisUser.divisionId,
          },
          {
            "approval4.divisionId": thisUser.divisionId,
          },
        ],
        "currentState.levelPosition": 1,
        "currentState.status": 0,
      };
    }

    //gm
    //melihat list by approval.level1 1
    else if (role == "generalManager") {
      //('diisni');
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 2,
      };
    } else if (role == "praeses") {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 3,
      };
    }

    //ketua yayasan
    //melihat list by approval.level2 1

    //return
    return Letters.find(filter, { sort: { createdAt: -1 } }).fetch();
  },
  reviewLetters() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list review by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 20,
        // $or : [{
        //     "approval1.status" : 20
        // }, {
        //     "approval1.status" : 1,
        //     "approval2.status" : 20
        // }]
      };
    }
    //chief staff
    //melihat list review by approval.level1 0
    else if (role == "chief") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.levelPosition": 1,
        "currentState.status": 20,
      };
    }
    //gm
    //melihat list review by approval.level1 1
    else if (role == "generalManager") {
      filter = {
        "currentState.levelPosition": 2,
        "currentState.status": 20,
      };
    } else if (Roles.userIsInRole(thisUser, ["praeses"])) {
      filter = {
        "currentState.status": 20,
        "currentState.levelPosition": {
          $in: [1, 2, 3, 4],
        },
      };
    }

    //ketua yayasan
    //melihat list by approval.level2 1

    return Letters.find(filter).fetch();
  },
  revisionLetters() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    const filter = {
      createdBy: thisUser._id,
      "currentState.status": 99,
    };
    //staff
    //melihat list review by approval semua 0
    // if (Roles.userIsInRole(thisUser, ['staff'])) {
    //     filter = {
    //         "divisionId": thisUser.divisionId,
    //         "currentState.status": 99
    //         // $or : [{
    //         //     "approval1.status" : 99
    //         // }, {
    //         //     "approval1.status" : 1,
    //         //     "approval2.status" : 99
    //         // }]
    //     }
    // }
    return Letters.find(filter).fetch();
  },
  approveLetters() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list review by approval semua 0
    filter = {
      createdBy: thisUser._id,
      "currentState.status": 1,
      "currentState.levelPosition": 4,
    };

    return Letters.find(filter).fetch();
  },
  // END LETTERS

  // ****************************************************************************
  // *                                Proposal                                 *
  // ****************************************************************************
  createKosong() {
    const thisUser = Meteor.users.findOne({_id: this.userId});

    return Proposals.insert({
      status: -1,
      createdBy: thisUser._id,
      craetedAt: new Date(),
      partners: thisUser.partners,
    });
  },

  createProposal(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});

    const dispositionData = DispositionsConfig.findOne({
      _id: data.dispositionId,
    });

    console.log(data);
    const divisionId = thisUser.divisionId;
    data.divisionId = divisionId;
    data.currentState = {
      levelPosition: -1,
      status: -1,
    };
    //get divisions chief
    const getDivision = Divisions.findOne({
      _id: divisionId,
    });
    if (getDivision) {
      const chiefDivision = getDivision.chiefId;

      //mount approval
      if (dispositionData.approval1.length > 0) {
        data.approval1 = dispositionData.approval1;
      } else {
        data.approval1 = [
          {
            userId: chiefDivision,
            divisionId: divisionId,
            status: 0,
          },
        ];
      }
    }

    data.approval1 = dispositionData.approval1;
    data.approval2 = dispositionData.approval2;
    data.approval3 = dispositionData.approval3;
    data.approval4 = dispositionData.approval4;

    const category = dispositionData.name;
    data.category = category;
    data.createdBy = Meteor.userId();
    data.createdAt = new Date();

    data.log = [
      {
        activity: "create proposal",
        createdBy: Meteor.userId(),
        createdAt: new Date(),
      },
    ];
    return Proposals.update(
      {
        _id: data.id,
      },
      {
        $set: data,
      }
    );
  },

  sentProposal(data) {
    check(data, Object);
    const dataNotification = {
      subject: "[IMAVI] Ada Surat baru masuk ke dashboard Anda!",
    };

    const currentState = {
      levelPosition: 0,
      status: 0,
    };
    const thisProposal = Proposals.findOne({
      _id: data.proposalId,
    });
    //cek diposisi
    const checkValue = isEmptyData(thisProposal);
    if (checkValue) {
      throw new Meteor.Error(404, "Ada data yang belum terisi");
    }

    if (thisProposal.approval1.length > 0) {
      currentState.levelPosition = 1;
      currentState.status = 0;
    } else {
      currentState.levelPosition = 4;
      currentState.status = 0;
    }
    //set dataNotification
    if (currentState.levelPosition == 1) {
    } else {
      const approval = thisProposal.approval4;
      const divisionId = approval[0].divisionId;
      const division = Divisions.findOne({
        _id: divisionId,
      });
      const thisChief = Meteor.users.findOne({
        _id: division.chiefId,
      });
      const thisCreatedProposal = Meteor.users.findOne({
        _id: thisProposal.createdBy,
      });

      const emailChief = thisChief.emails[0];

      dataNotification.destinationEmail = emailChief.address;
      dataNotification.message =
        "<h3>Hallo, " +
        thisChief.fullname +
        "</h3><p><strong>Ada surat masuk di dashboardmu dengan judul " +
        thisProposal.name +
        " dari " +
        thisCreatedProposal.fullname +
        ".</strong></p>" +
        "<p>Silahkan buka dashboard anda untuk melihat isi dari surat tersebut atau klik tombol dibawah ini</p>" +
        "<div> <a href='https://next.imavi.org/previewProposal/" +
        thisProposal._id +
        "'" +
        "style='display:inline-block;background:#0248ff;color:#ffffff;font-family:proxima_nova,sans_serif,Helvetica,Arial;font-size:14px;font-weight:normal;line-height:1.2;margin:0;text-align:center;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;border-radius:15px;box-sizing:border-box' width='385' target='_blank'>Lihat surat </a>" +
        "</div>";
    }
    // console.log(dataNotification);

    Proposals.update(
      {
        _id: data.proposalId,
      },
      {
        $set: {
          status: 0,
          currentState: currentState,
        },
      }
    );
    sendEmail(
      dataNotification.destinationEmail,
      dataNotification.subject,
      dataNotification.message
    );
    return true;
  },
  editProposal(data) {
    check(data, Object);

    const id = data.id;
    delete data.id;

    //get data surat
    const dataLetter = Proposals.findOne({
      _id: id,
    });

    //check approval dari level1

    Proposals.update(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );

    return Proposals.update(
      {
        _id: id,
      },
      {
        $set: {
          "currentState.status": 0,
        },
      }
    );
  },
  getProposals() {
    return Proposals.find().fetch();
  },
  getProposalById(id, code) {
    if (code == 1) {
      const dataProposal = Proposals.findOne({
        _id: id,
      });

      const dispositions = dataProposal.dispotitionsContent;
      const listDispositions = [];
      _.each(dispositions, function (x) {
        const data = x;

        const thisUser = Meteor.users.findOne({
          _id: x.userId,
        });
        data.fullname = thisUser.fullname;

        if (thisUser.schoolId) {
          const school = Schools.findOne({
            _id: thisUser.schoolId[0],
          });

          data.unitName = school.name;
        } else {
          const divisi = Divisions.findOne({
            _id: thisUser.divisionId,
          });
          data.unitName = divisi.name;
        }

        listDispositions.push(data);
      });
      return listDispositions;
    } else {
      return Proposals.findOne({
        _id: id,
      });
    }
  },
  "update.statusProposal"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;

    const dispotitionsContent = {
      userId: thisUser._id,
      content: data.dispositionContent,
      timestamp: new Date(),
    };

    if (thisUser.schoolId) {
      dispotitionsContent.schoolId = thisUser.schoolId[0];
    } else {
      dispotitionsContent.divisionId = thisUser.divisionId;
    }
    let filter;

    if (data.status == 1) {
      const dataProposal = Proposals.findOne({
        _id: data.proposalId,
      });
      //(data.proposalId);
      const currentState = dataProposal.currentState;
      //posisi untuk mengupdate approve
      //current state

      //cek jumlah approval level sekarang
      if (currentState.levelPosition == 1) {
        const approval1 = dataProposal.approval1;

        const lengthApproval1 = approval1.length;

        const updating = Proposals.update(
          {
            _id: data.proposalId,
            "approval1.userId": thisUser._id,
          },
          {
            $set: {
              "currentState.levelPosition": 2,
              "currentState.status": 0,
              "approval1.$.status": 1,
              dispotitionsContent: [dispotitionsContent],
            },
          }
        );
        //(updating);

        const checkApprove = _.filter(approval1, {
          status: 1,
        });

        if (checkApprove.length + 1 == lengthApproval1) {
          return Proposals.update(
            {
              _id: data.proposalId,
            },
            {
              $set: {
                "currentState.status": 0,
                "currentState.levelPosition": 2,
              },
            }
          );
        } else {
          return true;
        }
      } else if (currentState.levelPosition == 2) {
        const approval2 = dataProposal.approval2;
        //get jumlah approval level 1
        const lengthApproval2 = approval2.length;
        if (!Roles.userIsInRole(thisUser, ["staff"])) {
          const updateCheck = Proposals.update(
            {
              _id: data.proposalId,
              "approval2.divisionId": thisUser.divisionId,
            },
            {
              $set: {
                "approval2.$.status": 1,
              },
              $addToSet: {
                dispotitionsContent: dispotitionsContent,
              },
            }
          );
          if (updateCheck < 1) {
            throw new Meteor.Error(404, "Id denied");
          }
          //check apakah sudah ada yang approve
          const checkApprove = _.filter(approval2, {
            status: 1,
          });
          if (checkApprove.length + 1 == lengthApproval2) {
            const checkLevel3 = dataProposal.approval3;
            let position = 3;
            let status = 0;
            if (!checkLevel3) {
              status = 1;
            }
            return Proposals.update(
              {
                _id: data.proposalId,
              },
              {
                $set: {
                  "currentState.status": status,
                  "currentState.levelPosition": position,
                },
              }
            );
          } else {
            return true;
          }
        }
      } else if (currentState.levelPosition == 3) {
        // if (dataProposal.schoolId) {

        //     const updateApprove = Proposals.update({
        //         "_id" : data.proposalId,
        //     }, {
        //         $set : {
        //             "currentState.status" : 1,
        //             "currentState.levelPosition" : 3,
        //             "approval3.$.status" : 1,
        //             "approveDate" : new Date()
        //         },
        //         $addToSet : {
        //             "log" : {
        //                 "activity" : "approve by gm",
        //                 "updatedBy" : thisUser._id,
        //                 "updatedDate" : new Date()
        //             },
        //             "dispotitionsContent" : dispotitionsContent
        //         }
        //     });
        //     if (updateApprove == 1) {
        //         const newProposal = Proposals.findOne({
        //             '_id' : data.proposalId
        //         });
        //         const dispositionData = DispositionsConfig.findOne({
        //             '_id' : newProposal.dispositionId
        //         });

        //         const dataDispositions = {
        //             "documentId" : newProposal._id,
        //             "documentName" : newProposal.name,
        //             "documentType" : 'Proposal',
        //             "documentFrom" : newProposal.schoolId,
        //             "documentDispositionId" : dispositionData._id,
        //             "approval1" : dispositionData.approval1,
        //             "approval2" : dispositionData.approval2,
        //             "approval3" : dispositionData.approval3,
        //             "approval4" : dispositionData.approval4,
        //             "currentState" : {
        //                 levelPosition : 1,
        //                 status : 0
        //             },
        //             "createdBy" : newProposal.schoolId,
        //             "createdAt" : new Date(),
        //             "log" : [
        //                 {
        //                     "activity" : "create proposal dispotitions",
        //                     "createdBy" : thisUser._id,
        //                     "createdDate" : new Date()
        //                 }
        //             ]
        //         }
        //         return Dispositions.insert(dataDispositions);
        //     }
        // } else {

        const approval3 = dataProposal.approval3;
        //get jumlah approval level 3
        const lengthApproval3 = approval3.length;
        const updateCheck = Proposals.update(
          {
            _id: data.proposalId,
            "approval3.divisionId": thisUser.divisionId,
          },
          {
            $set: {
              "approval3.$.status": 1,
              approveDate: new Date(),
            },
            $addToSet: {
              dispotitionsContent: dispotitionsContent,
            },
          }
        );

        if (updateCheck < 1) {
          throw new Meteor.Error(404, "Id denied");
        }
        //check apakah sudah ada yang approve
        const checkApprove = _.filter(approval3, {
          status: 1,
        });

        if (checkApprove.length + 1 == lengthApproval3) {
          const checkApprove4 = dataProposal.approval4.length;
          let level = 3;
          let status = 1;

          if (checkApprove4 && checkApprove4.length > 0) {
            level = 4;
            status = 0;
          }
          return Proposals.update(
            {
              _id: data.proposalId,
            },
            {
              $set: {
                "currentState.status": status,
                "currentState.levelPosition": level,
              },
            }
          );
        } else {
          return true;
        }
        // }
      } else if (currentState.levelPosition == 4) {
        const approval4 = dataProposal.approval4;
        //get jumlah approval level 1
        const lengthApproval4 = approval4.length;
        const updateCheck = Proposals.update(
          {
            _id: data.proposalId,
            "approval4.divisionId": thisUser.divisionId,
          },
          {
            $set: {
              "approval4.$.status": 1,
              approveDate: new Date(),
            },
            $addToSet: {
              dispotitionsContent: dispotitionsContent,
            },
          }
        );

        if (updateCheck < 1) {
          throw new Meteor.Error(404, "Id denied");
        }
        //check apakah sudah ada yang approve

        const checkApprove = _.filter(approval4, {
          status: 1,
        });

        if (checkApprove.length + 1 === lengthApproval4) {
          return Proposals.update(
            {
              _id: data.proposalId,
            },
            {
              $set: {
                "currentState.status": 1,
                "currentState.levelPosition": 4,
              },
            }
          );
        } else {
          return true;
        }
      }
    } else if (data.status == "disposisi") {
      const dataProposal = Proposals.findOne({
        _id: data.proposalId,
      });
      const currentState = dataProposal.currentState;
      if (!Roles.userIsInRole(thisUser, ["staff"])) {
        //get state saat ini
        const currentLevel = currentState.levelPosition;

        if (currentState.levelPosition == 2) {
          const approval2 = dataProposal.approval2;
          //get jumlah approval level 1
          const lengthApproval2 = approval2.length;
          const updateCheck = Proposals.update(
            {
              _id: data.proposalId,
              "approval2.divisionId": thisUser.divisionId,
            },
            {
              $set: {
                "approval2.$.status": 1,
              },
              $addToSet: {
                dispotitionsContent: dispotitionsContent,
              },
            }
          );
          if (updateCheck < 1) {
            throw new Meteor.Error(404, "Id denied");
          }
          //check apakah sudah ada yang approve
          const checkApprove = _.filter(approval2, {
            status: 1,
          });
          if (checkApprove.length + 1 == lengthApproval2) {
            const checkLevel3 = dataProposal.approval3;
            let position = 3;
            let status = 0;
            if (!checkLevel3) {
              status = 1;
            }
            return Proposals.update(
              {
                _id: data.proposalId,
              },
              {
                $set: {
                  "currentState.status": status,
                  "currentState.levelPosition": position,
                },
              }
            );
          } else {
            return true;
          }
        } else if (currentState.levelPosition == 3) {
          if (dataProposal.schoolId) {
            //('disini');
            const updateApprove = Proposals.update(
              {
                _id: data.proposalId,
                schoolId: thisUser.schoolId[0],
              },
              {
                $set: {
                  "currentState.status": 1,
                  "currentState.levelPosition": 3,
                  "approval.status": 1,
                  approveDate: new Date(),
                },
                $addToSet: {
                  log: {
                    activity: "approve by headmaster",
                    updatedBy: thisUser._id,
                    updatedDate: new Date(),
                  },
                  approveNote: data.dispositionContent,
                },
              }
            );
            if (updateApprove == 1) {
              const newProposal = Proposals.findOne({
                _id: data.proposalId,
              });
              const dispositionData = DispositionsConfig.findOne({
                _id: newProposal.dispositionId,
              });

              const dataDispositions = {
                documentId: newProposal._id,
                documentName: newProposal.name,
                documentType: "Proposal",
                documentFrom: newProposal.schoolId,
                documentDispositionId: dispositionData._id,
                approval1: dispositionData.approval1,
                approval2: dispositionData.approval2,
                approval3: dispositionData.approval3,
                approval4: dispositionData.approval4,
                currentState: {
                  levelPosition: 1,
                  status: 0,
                },
                createdBy: newProposal.schoolId,
                createdAt: new Date(),
                log: [
                  {
                    activity: "create proposal dispotitions",
                    createdBy: thisUser._id,
                    createdDate: new Date(),
                  },
                ],
              };
              return Dispositions.insert(dataDispositions);
            }
          } else {
            const approval3 = dataProposal.approval3;
            //get jumlah approval level 1
            //('kambing');
            const lengthApproval3 = approval3.length;
            const updateCheck = Proposals.update(
              {
                _id: data.proposalId,
                "approval3.divisionId": thisUser.divisionId,
              },
              {
                $set: {
                  "approval3.$.status": 1,
                  approveDate: new Date(),
                },
                $addToSet: {
                  dispotitionsContent: dispotitionsContent,
                },
              }
            );
            //(updateCheck);
            if (updateCheck < 1) {
              throw new Meteor.Error(404, "Id denied");
            }
            //check apakah sudah ada yang approve
            const checkApprove = _.filter(approval3, {
              status: 1,
            });
            if (checkApprove.length + 1 == lengthApproval3) {
              return Proposals.update(
                {
                  _id: data.proposalId,
                },
                {
                  $set: {
                    "currentState.status": 1,
                    "currentState.levelPosition": 3,
                  },
                }
              );
            } else {
              return true;
            }
          }
        } else if (currentState.levelPosition == 4) {
          const approval4 = dataProposal.approval4;
          //get jumlah approval level 1

          const lengthApproval4 = approval4.length;
          const updateCheck = Proposals.update(
            {
              _id: data.proposalId,
              "approval4.divisionId": thisUser.divisionId,
            },
            {
              $set: {
                "approval4.$.status": 1,
              },
              $addToSet: {
                dispotitionsContent: dispotitionsContent,
              },
            }
          );
          if (updateCheck < 1) {
            throw new Meteor.Error(404, "Id denied");
          }

          //check apakah sudah ada yang approve
          const checkApprove = _.filter(approval4, {
            status: 1,
          });

          if (checkApprove.length + 1 == lengthApproval4) {
            return Proposals.update(
              {
                _id: data.proposalId,
              },
              {
                $set: {
                  "currentState.status": 1,
                  "currentState.levelPosition": 4,
                },
              }
            );
          } else {
            return true;
          }
        }
      } else if (thisUser.roles == "staff") {
        if (currentState.levelPosition == 2) {
          filter = {
            _id: data.proposalId,
            "approval2.divisionId": thisUser.divisionId,
          };
        } else if (currentState.levelPosition == 3) {
          filter = {
            _id: data.proposalId,
            "approval3.divisionId": thisUser.divisionId,
          };
        }

        return Proposals.update(filter, {
          $set: {
            "currentState.status": 0,
          },
          $addToSet: {
            dispotitionsContent,
          },
        });
      }
    } else if (data.status == 90) {
      const rejectNote = {
        userId: thisUser._id,
        note: data.rejectContent,
        timestamp: new Date(),
      };
      return Proposals.update(
        {
          _id: data.proposalId,
        },
        {
          $set: {
            "currentState.status": data.status,
          },
          $addToSet: {
            rejectNotes: rejectNote,
          },
        }
      );
    } else {
      return Proposals.update(
        {
          _id: data.proposalId,
        },
        {
          $set: {
            "currentState.status": data.status,
            review: {
              userId: thisUser._id,
              userName: thisUser.fullname,
              timeStamp: new Date(),
            },
          },
        }
      );
    }
  },
  "update.revisionProposal"(data) {
    //('hai');
    check(data, Object);
    const currentUser = Meteor.user();
    const role = currentUser.roles;
    const note = {
      note: data.note,
      noteBy: currentUser._id,
      noteByName: currentUser.fullname,
    };

    return Proposals.update(
      {
        _id: data.letterId,
      },
      {
        $set: {
          updateBy: currentUser._id,
          updateAt: new Date(),
          "currentState.note": data.note,
          "currentState.status": data.status,
          "currentState.updatedAt": new Date(),
        },
        $addToSet: {
          note,
        },
      }
    );
    // if (role == 'chief') {

    // } else if (role == 'superadmin'){
    //     return Letters.update({
    //         '_id' : data.letterId,
    //         'approval2.userId' : currentUser._id
    //     }, {
    //         $set : {
    //             'updateBy' : currentUser._id,
    //             'updateAt' : new Date(),
    //             'approval2.note' : data.note,
    //             'approval2.status' : data.status,
    //             'approval2.updatedAt' : new Date(),
    //         },
    //         $addToSet : {
    //             note
    //         }
    //     });
    // }
  },

  // pending
  pandingProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;

    //staff
    //melihat list  by approval semua 0
    if (Roles.userIsInRole(thisUser, ["staff", "Administrasi"])) {
      filter = {
        createdBy: thisUser._id,
        "currentState.levelPosition": -1,
      };
    }
    //chief staff
    //melihat list by approval.level1 0
    else if (role == "chief" || role == "headmaster") {
      filter = {
        divisionId: thisUser.divisionId,
        "approval1.userId": thisUser._id,
        "currentState.levelPosition": -1,
      };
    }

    //gm
    //melihat list by approval.level1 1
    else if (role == "superadmin") {
      filter = {
        "currentState.levelPosition": 2,
      };
    }

    // SEKOLAH
    else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": -1,
      };
    } else if (role == "headmaster") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": -1,
        "currentState.levelPosition": 1,
      };
    }

    //return
    console.log(filter);

    return Proposals.find(filter).fetch();
  },

  newProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;

    //staff
    //melihat list  by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 0,
      };
    }
    //chief staff
    //melihat list by approval.level1 0
    else if (role == "chief" || role == "headmaster") {
      filter = {
        divisionId: thisUser.divisionId,
        "approval1.userId": thisUser._id,
        "currentState.levelPosition": 1,
        "currentState.status": 0,
      };
    }

    //gm
    //melihat list by approval.level1 1
    else if (role == "superadmin") {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 2,
      };
    }

    // SEKOLAH
    else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 0,
      };
    } else if (role == "headmaster") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 0,
        "currentState.levelPosition": 1,
      };
    }

    //return

    return Proposals.find(filter).fetch();
  },
  incomingProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter = {};
    let filter2 = {};
    //staff
    //melihat list  by approval semua 0
    if (role == "staff") {
      filter = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.status": 0,
        "currentState.levelPosition": 2,
      };
      filter2 = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.status": 20,
        "currentState.levelPosition": 2,
      };
    }
    //chief staff
    //melihat list by approval.level1 0
    else if (role == "chief") {
      filter = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.levelPosition": 2,
        "currentState.status": 0,
      };
      filter2 = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.levelPosition": 2,
        "currentState.status": 20,
      };
    }

    //gm
    //melihat list by approval.level1 1
    else if (role == "generalManager") {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 3,
      };
      filter2 = {
        "currentState.status": 20,
        "currentState.levelPosition": 3,
      };
    } else if (Roles.userIsInRole(thisUser, ["praeses"])) {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 4,
      };
      filter2 = {
        "currentState.status": 20,
        "currentState.levelPosition": 4,
      };
    }

    //return
    if (_.isEmpty(filter)) {
      //(filter);
    } else {
      return Proposals.find({
        $or: [filter, filter2],
      }).fetch();
    }
  },
  reviewProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list review by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 20,
      };
    }
    //chief staff
    //melihat list review by approval.level1 0
    else if (role == "chief") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.levelPosition": 1,
        "currentState.status": 20,
      };
    }

    //gm
    //melihat list review by approval.level1 1
    else if (role == "superadmin") {
      filter = {
        "currentState.levelPosition": 2,
        "currentState.status": 20,
      };
    }

    //ketua yayasan
    //melihat list by approval.level2 1

    // SEKOLAH
    else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 20,
      };
    } else if (role == "headmaster") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.levelPosition": 1,
        "currentState.status": 20,
      };
    }

    return Proposals.find(filter).fetch();
  },
  revisionProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list review by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 99,
      };
    } else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 99,
      };
    }
    return Proposals.find(filter).fetch();
  },
  approveProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    let filter2;
    let filterCommon = {};
    //staff
    //melihat list review by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 1,
        "currentState.levelPosition": 3,
      };
      filter2 = {
        divisionId: thisUser.divisionId,
        "currentState.status": 1,
        "currentState.levelPosition": 4,
      };

      filterCommon = _.extend(filterCommon, {
        divisionId: thisUser.divisionId,
        "currentState.status": 1,
        $or: [
          {
            "currentState.levelPosition": 3,
          },
          {
            "currentState.levelPosition": 4,
          },
        ],
      });
    } else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 3,
      };
      filter2 = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 4,
      };
      filterCommon = _.extend(filterCommon, {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        $or: [
          {
            "currentState.levelPosition": 3,
          },
          {
            "currentState.levelPosition": 4,
          },
        ],
      });
    } else if (role == "headmaster") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 3,
      };
      filter2 = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 4,
      };

      filterCommon = _.extend(filterCommon, {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        $or: [
          {
            "currentState.levelPosition": 3,
          },
          {
            "currentState.levelPosition": 4,
          },
        ],
      });
    } else if (role == "superadmin") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 3,
      };
      filter2 = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        "currentState.levelPosition": 4,
      };

      filterCommon = _.extend(filterCommon, {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 1,
        $or: [
          {
            "currentState.levelPosition": 3,
          },
          {
            "currentState.levelPosition": 4,
          },
        ],
      });
    }
    return Proposals.find(filterCommon).fetch();
  },
  rejectedProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list review by approval semua 0
    if (role == "staff") {
      filter = {
        divisionId: thisUser.divisionId,
        "currentState.status": 90,
      };
    } else if (role == "teacher") {
      filter = {
        schoolId: thisUser.schoolId[0],
        "currentState.status": 90,
      };
    }
    return Proposals.find(filter).fetch();
  },

  // * new method propsal * //
  myProposals() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    return Proposals.find({
      createdBy: thisUser._id,
    }).fetch();
  },
  // ****************************************************************************
  // *                                END Proposal                                 *
  // ****************************************************************************

  // ****************************************************************************
  // *                                Start Divisions                                 *
  // ****************************************************************************
  getDivisions() {
    return Divisions.find({}).fetch();
  },
  getDivisionsById() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    return Divisions.find({
      _id: thisUser.divisionId,
    }).fetch();
  },
  getDivision(id) {
    check(id, String);
    return Divisions.findOne({
      _id: id,
    });
  },
  createDivision(data) {
    check(data, Object);

    if (data.chiefId) {
      const chiefName = Meteor.users.findOne({
        _id: data.chiefId,
      });

      data.chiefName = chiefName.fullname;
    }
    return Divisions.insert(data);
  },
  editDivision(data) {
    check(data, Object);
    const id = data.id;
    delete data.id;

    data.updatedBy = Meteor.userId();
    data.updatedDate = new Date();

    return Divisions.update(
      {
        _id: id,
      },
      {
        $set: data,
      }
    );
  },
  // ****************************************************************************
  // *                                End Divisions                                 *
  // ****************************************************************************

  // ****************************************************************************
  // *                                Dispositions                             *
  // ****************************************************************************
  createDisposition(data) {
    check(data, Object);

    data.createdAt = Meteor.userId();
    data.createdBy = new Date();

    return DispositionsConfig.insert(data);
  },
  editDisposition(data) {
    check(data, Object);

    const _id = data._id;
    delete data._id;

    return DispositionsConfig.update(
      {
        _id: _id,
      },
      {
        $set: data,
      }
    );
  },
  getDispositionsConfig() {
    return DispositionsConfig.find().fetch();
  },
  newDispositions() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    let filter;
    //staff
    //melihat list  by approval semua 0
    if (role == "staff") {
      filter = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.status": 0,
        "currentState.levelPosition": 2,
      };
    }
    //chief staff
    //melihat list by approval.level1 0
    else if (role == "chief") {
      filter = {
        "approval2.divisionId": thisUser.divisionId,
        "currentState.levelPosition": 2,
        "currentState.status": 0,
      };
    }

    //gm
    //melihat list by approval.level1 1
    else if (role == "generalManager") {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 3,
      };
    } else if (role == "praeses") {
      filter = {
        "currentState.status": 0,
        "currentState.levelPosition": 4,
      };
    }

    //return

    return Proposals.find(filter).fetch();
  },
  getDispositionsConfigById(data) {
    check(data, String);
    return DispositionsConfig.findOne({
      _id: data,
    });
  },

  // ****************************************************************************
  // *                                Start Permits                             *
  // ****************************************************************************
  "get-permits"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const listPermits = Permits.find().fetch();
    const newList = [];
    _.each(listPermits, function (x) {
      const user = AppUsers.findOne({
        profileId: x.creatorId,
        outlets: {
          $in: thisUser.partners,
        },
      });
      if (user) {
        const temp = {
          _id: x._id.toHexString(),
          reason: x.reason,
        };

        if (x.note) {
          temp.note = x.note;
        }
        //get profile staff
        const id = new Mongo.Collection.ObjectID(x.creatorId);

        const userProfile = AppProfiles.findOne({
          _id: id,
        });

        temp.fullName = userProfile.fullName;
        temp.jabatan = userProfile.jabatan;

        const startDate = moment(x.startDatePermit);
        const endDate = moment(x.endDatePermit);
        const totalPermits = moment().weekdayCalc(
          startDate,
          endDate,
          [1, 2, 3, 4, 5]
        );

        temp.startDate = x.startDatePermit;
        temp.endDate = x.endDatePermit;
        temp.totalPermit = totalPermits;
        temp.status = x.status;

        newList.push(temp);
      }
    });
    return newList;
  },
  "get-permit"(id) {
    check(id, String);
    const _id = new Mongo.Collection.ObjectID(id);

    return Permits.findOne({
      _id: _id,
    });
  },
  "create-permit"(data) {
    check(data, Object);
    data.createdAt = Meteor.userId();
    data.createdBy = new Date();
    return Permits.insert(data);
  },
  async "approve-permit"(_id) {
    check(_id, String);
    

    const id = new Mongo.Collection.ObjectID(_id);

    const updateData = await Permits.update(
      {
        _id: id,
      },
      {
        $set: {
          status: 1,
        },
      }
    );
    const permit = await Permits.findOne({
      _id : id
    })

    const userAccount = await AppUsers.findOne({
      'profileId' : permit.creatorId
    })
    if (updateData == 1) {
      //token fcm Users

      
      var token = userAccount.token_fcm;
      var message = {
        data: {
          //This is only optional, you can send any data
          score: "850",
          time: "11:30",
        },
        notification: {
          title: "Selamat",
          body: "Ijin anda tersejui",
        },
        token: token,
      };
      sendNotificationFcm(message);
      return true;
    } else {
      return false;
    }
  },

  async "reject-permit"(_id, reason) {
    check(_id, String);
    check(reason, String);

    const id = new Mongo.Collection.ObjectID(_id);

    const updateData = await Permits.update(
      {
        _id: id,
      },
      {
        $set: {
          status: 99,
          note: reason,
        },
      }
    );
    if (updateData == 1) {
      //token fcm Users

      const userAccount = AppUsers.findOne({
        _id: id,
      });

      var token = userAccount.token_fcm;
      var message = {
        data: {
          //This is only optional, you can send any data
          score: "850",
          time: "11:30",
        },
        notification: {
          title: "Maaf",
          body: "Ijin anda tidak tersejui",
        },
        token: token,
      };
      sendNotificationFcm(message);
      return true;
    } else {
      return false;
    }
  },
  // ****************************************************************************
  // *                                End Permits                             *
  // ****************************************************************************

  // ****************************************************************************
  // *                                Start Kronik                             *
  // ****************************************************************************
  "getAll-chronicles"() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;

    let filter = {
      partners: thisUser.partners,
      commission: { $in: [thisUser.commission, "all"] },
      type: { $ne: "chronicleKevikepan" },
    };
    if (Roles.userIsInRole(thisUser, ["vikpas"])) {
      filter = {
        partners: thisUser.partners,
        type: { $ne: "chronicleKevikepan" },
      };
    }
    // console.log(filter);
    const chronicles = Chronicles.find(filter, {
      sort: { createdAt: -1 },
    }).fetch();

    console.log("bukan puspas");
    _.each(chronicles, function (x) {
      const userObjecId = x.createdBy;
      const user = AppProfiles.findOne({
        _id: userObjecId,
      });

      if (user) {
        x.createdByName = user.fullName;
        x.jabatan = user.jabatan;
      } else {
        x.jabatan = "Kosong";
      }
    });
    return chronicles;
  },

  getChronicles() {
    return Chronicles.find({}).fetch();
  },

  "getPartners-chronicles"() {
    const userCek = Meteor.users.findOne({ _id: Meteor.userId() });
    const userPartners = userCek.partners;
    console.log(userPartners);
    return userPartners;
  },

  "getDetail-chronicles"(id) {
    const detailData = Chronicles.findOne({
      _id: new Meteor.Collection.ObjectID(id),
    });

    // const userObjecId = new Mongo.Collection.ObjectID(detailData.createdBy);
    const userObjecId = detailData.createdBy;
    const user = AppProfiles.findOne({
      _id: userObjecId,
    });

    if (user) {
      detailData.createdByName = user.fullName;
    } else {
      detailData.createdByName = "Kosong";
    }

    return detailData;
  },

  "create-chronicles"(data) {
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});
    const role = thisUser.roles;
    if (role !== "superadmin") {
      data.outlets = thisUser.outlets;
      data.partners = thisUser.partners;
    }

    if (Roles.userIsInRole(thisUser, ["vikep"])) {
      const userId = Meteor.userId();
      const kevikepan = KevikepanStruktur.findOne({
        $or: [{ ketuaId: userId }, { sekretarisId: userId }],
      });
      data.kevikepan = kevikepan.kevikepanName;
    }

    if (thisUser.commission) {
      data.commission = thisUser.commission;
    }

    if (Roles.userIsInRole(thisUser, ["vikpas"])) {
      data.commission = "all";
    } else {
      console.log("salah");
    }
    data.createdByName = Meteor.user().fullname;
    data.createdBy = Meteor.userId();
    data.createdAt = new Date();

    console.log(data);

    return Chronicles.insert(data);
  },

  "update-chronicles"(data) {
    check(data.id, String);
    check(data, Object);
    const thisUser = Meteor.users.findOne({_id: this.userId});

    data.partners = thisUser.partners;
    data.updateByName = Meteor.user().fullname;
    data.updateBy = Meteor.userId();
    data.updateAt = new Date();
    const id = data.id;
    delete data.id;
    return Chronicles.update({ _id: id }, { $set: data });
  },

  "delete-chronicles"(id) {
    check(id, String);
    return Chronicles.remove({ _id: id });
  },

  filterKronik(data) {
    check(data, Object);
    check(data.startDate, Date);
    check(data.endDate, Date);
    check(data.subject, String);
    check(data.character, String);
    check(data.type, String);

    const thisUser = Meteor.users.findOne({_id: this.userId});
    const filter = {
      startDate: {
        $gte: data.startDate,
        $lt: data.endDate,
      },
    };

    if (data.subject !== "all") {
      filter.subject = data.subject;
    }

    if (data.character !== "all") {
      filter.character = data.character;
    }

    if (data.type !== "all") {
      filter.type = data.type;
    }

    // console.log(filter);
    const chronicles = Chronicles.find(filter).fetch();
    // console.log(chronicles);

    _.each(chronicles, function (x) {
      const userObjecId = x.createdBy;
      const user = AppProfiles.findOne({
        _id: userObjecId,
      });

      if (user) {
        x.createdByName = user.fullName;
        x.jabatan = user.jabatan;
      } else {
        x.createdByName = "Kosong";
        x.jabatan = "Kosong";
      }
    });

    return chronicles;
  },

  exportChronicles(startDate, endDate) {
    const thisMonth = new Date();
    let filter = {
      startDate: {
        $gte: new Date(moment(thisMonth, "YYYY-MM").startOf("month")),
        $lte: new Date(moment(thisMonth, "YYYY-MM").endOf("month")),
      },
    };

    if (startDate || endDate) {
      filter = {
        startDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const pipeline = [
      {
        $match: filter,
      },
      {
        $project: {
          _id: 0,
          title: 1,
          subject: 1,
          character: 1,
          type: 1,
          startDate: 1,
          endDate: 1,
          commission: 1,
          url: {
            $concat: ["https://next.imavi.org/detailKronik/", "$_id"],
          },
        },
      },
      {
        $project: {
          "Judul Kegiatan": "$title",
          "Subjek Kegiatan": "$subject",
          "Jenis Kegiatan": "$character",
          "Lingkup Kegiatan": "$type",
          "Tgl Mulai": "$startDate",
          "Tgl Selesai": "$endDate",
          "Lingkup Komisi": "$commission",
          Link: "$url",
        },
      },
    ];

    const chronicles = Chronicles.aggregate(pipeline);

    console.log(chronicles);

    let wb = XLSX.utils.book_new();
    const today = moment().format("DD MMMM YYYY");

    const xlName = "Data Kronik Per " + today;
    const myName = Meteor.user().fullname;

    wb.Props = {
      Title: xlName,
      Subject: "Data Kronik",
      Author: myName,
      CreatedDate: new Date(),
    };
    wb.SheetNames.push("Sheet1");

    let ws = XLSX.utils.json_to_sheet(chronicles);
    console.log(ws);

    wb.Sheets["Sheet1"] = ws;

    return wb;
  },

  // ****************************************************************************
  // *                                End Kronik                             *
  // ****************************************************************************

  async getPartnersUser() {
    const thisUser = Meteor.users.findOne({_id: this.userId});
    return thisUser.partners;
  },
});
