import { Salaries } from "./salaries";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
import _, { result } from 'underscore'
import { MonthlyAttendance, Permits } from "../attendance/attendance";

Meteor.methods({
    async "payroll.cekValiditas"(id, month, year) {
        try {
            const cekRekap = MonthlyAttendance.findOne({month: month, year: year});
            if(!cekRekap) {
                throw new Meteor.Error(412, `Belum ada rekap absensi pada bulan ${month} tahun ${year}`)
            }
            const cek = MonthlyAttendance.findOne({month: month, year: year, 'details.userId': id});
            const dataEmployee = Employee.findOne({_id:id})
            let result;
            if(cek) {
                let detail = cek.details.find(detail => detail.userId === id);
                const startOfMonth = moment().year(year).month(month - 1).startOf('month').toDate();
                const endOfMonth = moment().year(year).month(month - 1).endOf('month').toDate();
                const permitLembur = Permits.find(
                {
                    creatorId: id, 
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
                detail.absence = parseInt(detail.dafOf) + parseInt(detail.permit)
                result = {
                    _id: cek._id,
                    activeDayWorking: cek.activeDayWorking,
                    dayOf: cek.dayOf,
                    month: cek.month,
                    year: cek.year,
                    outlets: cek.outlets,
                    baseSalary: dataEmployee.base_salary,
                    details: detail,
                    overtimeList: permitLembur,
                    accountNumber: dataEmployee.accountNumber,
                    accountNumberBank: dataEmployee.accountNumberBank,
                    accountNumberName: dataEmployee.accountNumberName,
                };
                // console.log(result);
            }
            return result
        } catch (error) {
            console.log(error);
            return error
        }
        
    },
    async "payroll.createPayroll"(data, dataRekap, id, month, year) {
        check(data, Array);
        check(id, String);
        const cekSlipGaji = Salaries.findOne({employeeId: id, month: month, year: year})
        if(cekSlipGaji) {
            throw new Meteor.Error(412, "Slip gaji sudah dibuat")
        }
        const dataEmployee = Employee.findOne({_id: id});
        const baseSalary = dataEmployee.base_salary;
        let total = 0;
        let totalDeduction = 0;
        let totalAllowance = 0;
        data.forEach(item => {
            if(item.category == "allowance") {
                total += item.amount;
                totalAllowance += item.amount
            }
            else if(item.category == "deduction") {
                total -= item.amount;
                totalDeduction += item.amount
            }
        })
        const totalSalary = baseSalary + total;
        // Mapnya berfungsi untuk hilangkan data field category dari setiap data
        const dataAllowance = data.filter(item => item.category === 'allowance').map(({ category, ...rest }) => rest);
        const dataDeduction = data.filter(item => item.category === 'deduction').map(({ category, ...rest }) => rest);
        const dataSave = {
            employeeId: id,
            employeeName: dataRekap.details.fullName,
            accountData: {
                name: dataRekap.accountNumberName,
                accountNumber: dataRekap.accountNumber,
                bank: dataRekap.accountNumberBank
            },
            month,
            year,
            baseSalary,
            totalSalary,
            totalDeduction,
            totalAllowance,
            allowances: dataAllowance,
            deductions: dataDeduction,
            status: 10,
            timestamp: new Date(),
            createdAt: new Date(),
            createdBy: Meteor.userId()
        }
        return Salaries.insert(dataSave);
    },
    async "payroll.getAll"() {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        const partnerCode = adminPartner.partners[0];
        const dataEmployee = Employee.find({partnerCode}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        let data;
        for (let index = 0; index < dataEmployee.length; index++) {
            const element = dataEmployee[index];
            data = Salaries.findOne({employeeId: element._id, month: currentMonth, year: currentYear});
            dataEmployee[index].salaries = data;
        }
        return dataEmployee
    },
    async "payroll.getFilter"(month, year){
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        const partnerCode = adminPartner.partners[0];
        const dataEmployee = Employee.find({partnerCode}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
        let data;
        for (let index = 0; index < dataEmployee.length; index++) {
            const element = dataEmployee[index];
            data = Salaries.findOne({employeeId: element._id, month: month, year: year});
            dataEmployee[index].salaries = data;
        }
        return dataEmployee
    },
    async "payroll.getDetail"(id) {
        check(id, String);
        const dataSalaries = Salaries.findOne({_id: id});
        const cek = MonthlyAttendance.findOne({month: dataSalaries.month, year: dataSalaries.year, 'details.userId': dataSalaries.employeeId});
        const dataEmployee = Employee.findOne({_id: dataSalaries.employeeId})
        let result;
        if(cek) {
            let detail = cek.details.find(detail => detail.userId === dataSalaries.employeeId);
            const startOfMonth = moment().year(dataSalaries.year).month(dataSalaries.month - 1).startOf('month').toDate();
            const endOfMonth = moment().year(dataSalaries.year).month(dataSalaries.month - 1).endOf('month').toDate();
            const permitLembur = Permits.find(
            {
                creatorId: dataSalaries.employeeId, 
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
            detail.absence = parseInt(detail.dafOf) + parseInt(detail.permit)
            result = {
                _id: cek._id,
                activeDayWorking: cek.activeDayWorking,
                dayOf: cek.dayOf,
                month: cek.month,
                year: cek.year,
                outlets: cek.outlets,
                baseSalary: dataEmployee.base_salary,
                details: detail,
                overtimeList: permitLembur,
            };
            // console.log(result);
        }
        dataSalaries.detailRekap = result
        // console.log(dataSalaries);
        return dataSalaries
    },

    "payroll.publish"(id) {
        check(id, String)
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        return Salaries.update({_id: id}, {$set: {
            status: 60,
            publishedAt: new Date(),
            publishedBy: adminPartner.fullname
        }})
    },

    "payroll.publishMonthly"(month, year) {
        let startOfMonth;
        let endOfMonth;
        let dataPayroll;
        if(!Number.isNaN(month) && !Number.isNaN(year)) {
            startOfMonth = moment().year(year).month(month - 1).startOf('month').toDate();
            endOfMonth = moment().year(year).month(month - 1).endOf('month').toDate();
            dataPayroll = Salaries.find({
                month: month,
                year: year,
                status: 10
            }).fetch();
            
        }
        else {
            const currentMoment = moment();
            const year = currentMoment.year();
            const month = currentMoment.month() + 1;
            startOfMonth = moment().year(year).month(month - 1).startOf('month').toDate();
            endOfMonth = moment().year(year).month(month - 1).endOf('month').toDate();
            dataPayroll = Salaries.find({
                month: month,
                year: year,
                status: 10
            }).fetch();
        }
        const payrollIds = dataPayroll.map(payroll => payroll._id);
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        if (payrollIds.length > 0) {
            return Salaries.update(
                { _id: { $in: payrollIds } },
                { $set: { status: 60, publishedAt: new Date(), publishedBy: adminPartner.fullname} },
                { multi: true }
            );
        }
        
    }
})