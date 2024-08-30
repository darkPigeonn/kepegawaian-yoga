import moment from "moment";
import {
    StaffsAttendance,
    MonthlyAttendance,
    ClockShifts,
    ScheduleAttendance,
    ConfigAttendanceUser,
    Partner,
    Permits,
} from "./attendance.js";
import _ from "underscore";
require("moment-weekday-calc");
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import { check } from "meteor/check";
import { Employee } from "../employee/employee.js";

Meteor.methods({

    async "staffsAttendance.getAll"() {
        const thisUser = await Meteor.users.findOne({_id : Meteor.userId});
        if(!thisUser) {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }
        console.log(queryPartnerCode);
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

    // console.log(dataStaffsAttendance);

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
    // console.log(dataReturn.length);
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
        console.log(dataStaffsAttendance);
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
                    const employeeProfile = Employee.findOne({
                        _id: x.userId
                    })
                    // console.log(userProfile);
                    if(employeeProfile) {
                        x.fullName = employeeProfile.full_name;
                        x.jabatan = employeeProfile.job_position;
                        x.outlets = user.outlets[0];
                        x.checkIn = moment(x.checkIn).utcOffset("+07:00").format("YYYY-MM-DD HH:mm:ss");
                        dataReturn.push(x);
                    }
                }
            }
        });
        console.log(dataReturn);
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


    // console.log(dataStaffsAttendance);

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
            const employeeProfile = Employee.findOne({
                _id: x.userId
            })
            // console.log(userProfile);

            x.fullName = employeeProfile.full_name;
            x.jabatan = employeeProfile.job_position;
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

    // const thisUser = await AppProfiles.findOne({
    //     "_id" : new Meteor.Collection.ObjectID(thisPresensi.userId)
    // })

    const thisUser = await Employee.findOne({
        "_id" : id
    })

    thisPresensi.fullName = thisUser.full_name;
    thisPresensi.jabatan = thisUser.job_position;
    thisPresensi.outlets = thisUser.outlets;

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
        // console.log(dataRekap);
        dataRekap =dataRekap.map(obj => obj.details).flat()

    } else {
        dataRekap = MonthlyAttendance.findOne({
        'outlets' : code
        }).fetch();
        // console.log(dataRekap);
        dataRekap =dataRekap.map(obj => obj.details).flat()
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

    // console.log(userMonthly);

    const startDate = moment(monthData).startOf("month");
    const endDate = moment(monthData).endOf("month");

    // console.log(startDate, endDate);

    dataRekap = await StaffsAttendance.find({
        "userId": userId,
        checkIn: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        },
    }).fetch();

    // console.log(dataRekap);

    const thisOutlet = Partner.findOne({
        'code' : thisUser.outlets[0]
    })

    //get set jadwal untuk user
    const schedule = await ConfigAttendanceUser.findOne({
        'userId': userId
    });

    // console.log(schedule);

    const detailSchedule = await ScheduleAttendance.findOne({
        '_id' : schedule.schedules[0].scheduleId
    })

    // console.log(detailSchedule);

    const listSchedules = detailSchedule.schedule;

    _.each(dataRekap, function (x) {
        const day = moment(x.checkIn).day();
        const thisSchedule = _.find(listSchedules, function (y) {
        return y.code == day
        })
        x.clockInSet = thisSchedule.clockIn;
        x.clockOutSet = thisSchedule.clockOut
    })
    // console.log(userMonthly);
    // console.log(moment(monthData).startOf('month').toDate());

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
    "staffsAttendance.rekap"(totalDayOf, startDate2, endDate2) {
        //Get outlets berdasarkan admin
        const thisUser = Meteor.users.findOne({
          "_id" : this.userId
        });

        // console.log(thisUser);

        const startDate = moment(startDate2);
        const endDate = moment(endDate2).endOf("day");

        const totalDay = moment().weekdayCalc(startDate, endDate, [1, 2, 3, 4, 5,6]);

        const activeWorkingDays = totalDay - parseInt(totalDayOf);

        // console.log(activeWorkingDays);

        const rekap = [];
        // each outlets/partners
        _.each(thisUser.partners, function (outlet) {
          const thisOutlet = Partner.findOne({
            'code' : outlet
          })

        //   console.log(thisOutlet);

          const dataStaffsAttendance = AppUsers.find({
            outlets: outlet,
            roles: "staff"
          }).fetch();

        //   console.log(dataStaffsAttendance);

        //   console.log(dataStaffsAttendance, dataStaffsAttendance.length)

          const dataReturn = [];
        //   console.log(dataStaffsAttendance);
          //find user profile
          _.each(dataStaffsAttendance, function (x) {
            const dataUser = {};
            if (x._id) {
              const employeeProfile = Employee.findOne({
                _id: x.profileId,
                partnerCode: outlet,
                statusDelete: 0
              })
            //   console.log(employeeProfile);
              if (employeeProfile) {
                if(employeeProfile.full_name){
                    dataUser.userId = x.profileId;
                    dataUser.fullName = employeeProfile.full_name;
                    dataUser.jabatan = employeeProfile.job_position;
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
                        const startOfMonth = moment(startDate).startOf('month').toDate();
                        const endOfMonth = moment(startDate).endOf('month').toDate();
                        const permitLembur = Permits.find(
                            {
                                creatorId: x.profileId, 
                                status: 20, 
                                type: "Lembur",
                                startDatePermit: {
                                    $gte: startOfMonth,
                                    $lte: endOfMonth
                                }
                            }, 
                            {
                                projection: {
                                    _id: 0,
                                    datePermits: 0,
                                    status: 0,
                                    reason: 0,
                                    datePermits: 0
                                }
                            }).fetch()
                        let totalOvertime = 0;
                        for (let index = 0; index < permitLembur.length; index++) {
                            const element = permitLembur[index];
                            totalOvertime += parseInt(element.duration)
                        }
                        
                        dataUser.totalOvertime = totalOvertime
                        
                        const permitAbsence = Permits.find(
                        {
                            creatorId: x.profileId, 
                            status: 20, 
                            type: {
                                $in: ["Sakit", "Perjalanan Dinas", "Cuti"]
                            },
                            "datesPermits.date": {
                                $gte: startOfMonth,
                                $lte: endOfMonth
                            }
                        },
                        {
                            projection: {
                                _id: 0,
                                datesPermits: 1
                            }
                        }
                        ).fetch()
                        let totalPermit = 0;
                        
                        permitAbsence.forEach(doc => {
                            doc.datesPermits.forEach(datePermits => {
                                const permitDate = new Date(datePermits.date);
                                if(permitDate >= startOfMonth && permitDate <= endOfMonth) {
                                    totalPermit += 1;
                                }
                            })
                        })
                        dataUser.permit = totalPermit
                        dataUser.dafOf = activeWorkingDays - dataStaffsAttendance.length - dataUser.permit;
                    }
                    dataReturn.push(dataUser);
                }

              }

            }
          });
          const dataNew = {
            activeDayWorking: activeWorkingDays,
            dayOf: totalDayOf,
            month: moment(startDate2).month() + 1,
            year: moment(startDate2).year(),
            outlets: outlet,
            details: dataReturn,
          };

          const checkRekap = MonthlyAttendance.findOne({
            month: moment(startDate).month() + 1,
            year: moment(startDate).year(),
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
        const details = rekap.map(obj => obj.details)
        const dataReturn = {
          activeDayWorking: rekap[0].activeDayWorking,
          dayOf: rekap[0].dayOf,
          month: rekap[0].month,
          year: rekap[0].month,
          details : details[0]
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
            // console.log(filter);
        if (code == "0") {
            dataRekap = MonthlyAttendance.find({
            month: parseInt(filter.month),
            year : parseInt(filter.year),
            outlets: {
                $in: thisUser.partners
            }
            }).fetch();
            dataReturn.activeDayWorking = dataRekap[0].activeDayWorking;
            dataReturn.dayOf = dataRekap.dayOf;
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
    "delete.clockShift"(id) {
        check(id, String);
        return ClockShifts.remove({ _id: id });
    },
    "getById.clockShift"(id){
        check(id, String);
        return ClockShifts.findOne({ _id: id });
    },
    "update.clockShift"(id, nama, jamMasuk, jamKeluar){
        check(id, String);
        check(nama, String);
        check(jamMasuk, String);
        check(jamKeluar, String);
        const dataSave = {
            $set: {
                name: nama,
                clockIn: jamMasuk,
                clockOut: jamKeluar
            }
        }
        return ClockShifts.update({_id: id}, dataSave);
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
    "update.scheduleAttendance"(id, name, dataSend) {
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


        return ScheduleAttendance.update(
            { _id: id },
            { $set: dataSave }
        );

    },
    "getAll.scheduleAttendanceList"() {
    return ScheduleAttendance.find().fetch();
    },
    "delete.scheduleAttendance"(id){
        check(id, String);
        return ScheduleAttendance.remove({ _id: id });
    },
    async "create.schedulePairings"(dataSave) {
        check(dataSave, Array);
        for (let index = 0; index < dataSave.length; index++) {
            var element = dataSave[index];
            // console.log(element);
            element.createdAt = new Date();
            element.createdBy = Meteor.userId();
            //check dulu apa sudah ada pairings jadwal
            const check = await ConfigAttendanceUser.findOne({
            userId: element.userId,
            });

            // console.log(element.userId);
            // return

            //get partner
            const thisEmployee = Employee.findOne({
            _id: element.userId,
            });
            //console.log(thisEmployee);
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

    async "getEmployees"(){
        const data = Employee.find({status: 10, statusDelete: 0}).fetch();
        // console.log(data);
        return data;
    },

    async scheduleEmployes(id) {
        const data = ConfigAttendanceUser.find({
            "schedules.scheduleId": id,
        }).fetch();
        return data;
    },

    async getPartnersUser() {
        const thisUser = Meteor.users.findOne({_id: this.userId});
        return thisUser.partners;
    },


    async "getAll.permit"() {
        const thisUser = Meteor.users.findOne({_id: this.userId});
        if(!thisUser) {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }
        
        const employee = Employee.find({
            outlets : {$in: thisUser.outlets}
        }).fetch();
        
        const employeeIds = employee.map(emp => emp._id);

        const thisStartMonth = moment().utcOffset("+07:00").startOf("month");
        const thisEndMonth = moment().utcOffset("+07:00").endOf("month");

        // Yang di get bulan sebelumnya dari sekarang
        // const thisStartLastMonth = moment().utcOffset("+07:00").subtract(1, "month").startOf("month");
        // const thisEndLastMonth = moment().utcOffset("+07:00").subtract(1, "month").endOf("month");

        // Yang di get bulan sekarang
        const thisStartLastMonth = moment().utcOffset("+07:00").startOf("month");
        const thisEndLastMonth = moment().utcOffset("+07:00").endOf("month");
        

        const permits =  Permits.find({
            createdAt: {
                $gte: new Date(thisStartLastMonth),
                $lte: new Date(thisEndLastMonth),
            },
            creatorId: {
                $in: employeeIds
            }
        }, {sort: {createdAt: -1}}).fetch();

        return permits
    },
    async "getPermit.byMonth"(month) {
        const thisUser = Meteor.users.findOne({_id: this.userId});
        if(!thisUser) {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }

        const employee = Employee.find({
            outlets : {$in: thisUser.outlets}
        }).fetch();


        const thisStartMonth = moment(month).utcOffset("+07:00").startOf("month");
        const thisEndMonth = moment(month).utcOffset("+07:00").endOf("month");

        const stringArray = employee.map(item => item._id);
        const permits =  Permits.find({
            createdAt: {
                $gte: new Date(thisStartMonth),
                $lte: new Date(thisEndMonth),
            },
            creatorId: {
                $in: stringArray
            }
        },{
            sort: { startDatePermit: 1 }
        }).fetch();

        const finalData = permits.map(item => {
            const data = _.find(employee, function (x) {
                return x._id == item.creatorId
            })
            return {
                ...item,
                fullName: data.full_name
            }
        })

       return finalData
    },
    'approvePermit'(id) {
        check(id, String);

        const thisUser = Meteor.users.findOne({_id: this.userId});
        if(!thisUser) {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }

        const idObject = new Mongo.ObjectID(id);
        return Permits.update({
            _id: idObject
        }, {
            $set: {
                status: 20,
                confirmAt : new Date(),
                confirmBy : thisUser._id
            }
        })
    },
    'rejectPermit'(id,reason) {
        check(id, String);

        const thisUser = Meteor.users.findOne({_id: this.userId});
        if(!thisUser) {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }

        const idObject = new Mongo.ObjectID(id);
        return Permits.update({
            _id: idObject
        }, {
            $set: {
                status: 99,
                confirmAt : new Date(),
                confirmBy : thisUser._id,
                declineReason: reason
            }
        })
    },
});