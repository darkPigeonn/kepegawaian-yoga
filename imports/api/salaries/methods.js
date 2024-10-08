import { Salaries } from "./salaries";
import { SalariesActionRequests } from "./salaries";
import { Departement } from "../departement/departement";
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
    async "payroll.getAll"(department, month, year) {
        console.log(month,year);
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        const partnerCode = adminPartner.partners[0];
        let dataEmployee;
        if(department == null) {
            dataEmployee = Employee.find({partnerCode, statusDelete: 0}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
        }
        else {
            dataEmployee = Employee.find({partnerCode, departmentId: department, statusDelete: 0}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
        }
        let currentMonth;
        let currentYear;
        if(month != undefined || !isNaN(month) || month != null
        || year != undefined || !isNaN(year) || year != null) {
            currentMonth = month;
            currentYear = year;
        }
        else {
            currentMonth = new Date().getMonth() + 1;
            currentYear = new Date().getFullYear();
        }
        let data;
        let estimasiPengeluaran = 0;
        for (let index = 0; index < dataEmployee.length; index++) {
            const element = dataEmployee[index];
            data = Salaries.findOne({employeeId: element._id, month: currentMonth, year: currentYear});
            dataEmployee[index].salaries = data;
            if(dataEmployee[index].salaries != undefined) {
                let totalSalary = dataEmployee[index].salaries.totalSalary
                if(!isNaN(totalSalary) || totalSalary != undefined) {
                    estimasiPengeluaran = estimasiPengeluaran + totalSalary
                }
            }
        }
        let dataReturn = {
            estimasiPengeluaran,
            dataEmployee
        }
        return dataReturn
    },
    async "payroll.getFilter"(month, year){
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        const partnerCode = adminPartner.partners[0];
        const dataEmployee = Employee.find({partnerCode, statusDelete: 0}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
        const currentMonth = month;
        const currentYear = year;
        let data;
        let estimasiPengeluaran = 0;
        for (let index = 0; index < dataEmployee.length; index++) {
            const element = dataEmployee[index];
            data = Salaries.findOne({employeeId: element._id, month: currentMonth, year: currentYear});
            dataEmployee[index].salaries = data;
            if(dataEmployee[index].salaries != undefined) {
                let totalSalary = dataEmployee[index].salaries.totalSalary
                if(!isNaN(totalSalary) || totalSalary != undefined) {
                    estimasiPengeluaran = estimasiPengeluaran + totalSalary
                }
            }
        }
        let dataReturn = {
            estimasiPengeluaran,
            dataEmployee
        }
        return dataReturn
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

    async "payroll.getDepartments"(month, year) {
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
        _id: thisUser,
        });
        partnerCode = adminPartner.partners[0];
        let dataEmployee;
        let dataReturn = [];
        const dataDepartments = Departement.find({partnerName: partnerCode}).fetch();
        for (let index = 0; index < dataDepartments.length; index++) {
            const element = dataDepartments[index];
            dataEmployee = Employee.find({partnerCode, departmentId: element._id, statusDelete: 0}, { projection: { _id: 1, full_name: 1, partnerCode: 1, job_position: 1 } }).fetch();
            let currentMonth;
            let currentYear;
            if(month != undefined) {
                currentMonth = month
            }
            else {
                currentMonth = new Date().getMonth() + 1;
            }
            if(year != undefined) {
                currentYear = year
            }
            else {
                currentYear = new Date().getFullYear();
            }
            let dataSalarie;
            let estimasiPengeluaran = 0;
            for (let index = 0; index < dataEmployee.length; index++) {
                const element = dataEmployee[index];
                dataSalarie = Salaries.findOne({employeeId: element._id, month: currentMonth, year: currentYear});
                dataEmployee[index].salaries = dataSalarie;
                if(dataEmployee[index].salaries != undefined) {
                    let totalSalary = dataEmployee[index].salaries.totalSalary
                    if(!isNaN(totalSalary) || totalSalary != undefined) {
                        estimasiPengeluaran = estimasiPengeluaran + totalSalary
                    }
                }
            }
            const dataAkhir = {
                departmentId: element._id,
                departmentName: element.name,
                approxPengeluaran: estimasiPengeluaran
            }
            dataReturn.push(dataAkhir)
        }
        return dataReturn
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
        let dataPayroll;
        if(!Number.isNaN(month) && !Number.isNaN(year)) {
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
        
    },
    "payroll.delete"(id) {
        check(id, String);
        const cek = Salaries.findOne({_id: id})
        if(!cek) throw new Meteor.Error(412, "Data salaries tidak ditemukan")
        return Salaries.remove({_id: id})
    },
    "payroll.request"(data) {
        const {id, request, reason} = data
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const dataSalaries = Salaries.findOne({_id: id})
        const dataSave = {
            salariesId: id,
            type: request,
            reason,
            employeeId: dataSalaries.employeeId,
            employeeName: dataSalaries.employeeName,
            createdAt: new Date(),
            createdBy: thisUser,
            createdByName: adminPartner.fullname
        }
        const update = Salaries.update({_id: id}, {
            $set: {
                isRequesting: true,
                isRequestingType: request
            }
        })
        return SalariesActionRequests.insert(dataSave);
    },
    "payroll.listRequest"() {
        const data = SalariesActionRequests.find({}, {sort: {createdAt: -1}}).fetch()
        return data;
    },
    "payroll.approvalActionRequest"(data) {
        const {id, type} = data;
        // update data action diterima / ditolak
        let status = 0;
        if(type == "accept") status = 60
        if(type == "decline") status = 90
        const dataRequest = SalariesActionRequests.findOne({_id: id})
        if(dataRequest) {
            const updateAction = SalariesActionRequests.update({_id: id}, {
                $set: {
                    status,
                    confirmedAt: new Date()
                }
            })
            // update data salaries agar bisa melakukana aksi update / delete
            if(status == 60) {
                return Salaries.update({_id: dataRequest.salariesId}, {
                    $set: {
                        isAction: true,
                        isActionType: dataRequest.type
                    },
                    $unset: {
                        isRequesting: "",
                        isRequestingType: ""
                    }
                })
            }
            if(status == 90) {
                return Salaries.update({_id: dataRequest.salariesId}, {
                    $set: {
                        isAction: false,
                        isActionType: dataRequest.type
                    },
                    $unset: {
                        isRequesting: "",
                        isRequestingType: ""
                    }
                })
            }
        }
    },
    async "payroll.loadEdit"(idPayroll) {
        try {
            const dataPayroll = Salaries.findOne({_id: idPayroll});
            let month = dataPayroll.month;
            let year = dataPayroll.year;
            let id = dataPayroll.employeeId;
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
            // ambil data yang sudah ada di slip sebelumnya untuk data allowances dan deductions
            result.detailSlip = [];
            for (let index = 0; index < dataPayroll.allowances.length; index++) {
                const element = dataPayroll.allowances[index];
                element.category = "allowance"
                result.detailSlip.push(element)
            }
            for (let index = 0; index < dataPayroll.deductions.length; index++) {
                const element = dataPayroll.deductions[index];
                element.category = "deduction"
                result.detailSlip.push(element)
            }
            return result
        } catch (error) {
            console.log(error);
            return error
        }
        
    },
    async "payroll.editPayroll"(data, dataRekap, id, month, year, idSalaries) {
        check(data, Array);
        check(id, String);
        check(idSalaries, String);
        const dataSalaries = Salaries.findOne({_id: idSalaries});
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
        // update data salariesnya
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
            status: dataSalaries.status,
        }
        return Salaries.update({_id: idSalaries}, {
            $set: dataSave,
            $unset: {
                isAction: "",
                isActionType: ""
            }
        });
    },
    async "payroll.uploadBuktiTransfer"(data, id) {
        let {links} = data;
        return Salaries.update({_id: id}, {$set: {links}})
    }
})