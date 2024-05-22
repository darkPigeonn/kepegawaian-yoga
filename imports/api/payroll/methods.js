import { Payroll } from "./payroll";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
import _, { result } from 'underscore'
import { MonthlyAttendance } from "../attendance/attendance";

Meteor.methods({
    async "payroll.cekValiditas"(id, month, year) {
        const cekRekap = MonthlyAttendance.findOne({month: month, year: year});
        const cek = MonthlyAttendance.findOne({month: month, year: year, 'details.userId': id});
        const dataEmployee = Employee.findOne({_id:id})
        let result;
        if(cek) {
            const detail = cek.details.find(detail => detail.userId === id);
            result = {
                _id: cek._id,
                activeDayWorking: cek.activeDayWorking,
                dayOf: cek.dayOf,
                month: cek.month,
                year: cek.year,
                outlets: cek.outlets,
                baseSalary: dataEmployee.base_salary,
                details: detail 
            };
        }
        return result
    },
    async "payroll.createPayroll"(data, id, month, year) {
        check(data, Array);
        check(id, String);
        const cekSlipGaji = Payroll.findOne({employeeId: id, month: month, year: year})
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
            accountData: {
                name: dataEmployee.full_name,
                accountNumber: ""
            },
            month,
            year,
            baseSalary,
            totalSalary,
            totalDeduction,
            totalAllowance,
            allowances: dataAllowance,
            deductions: dataDeduction,
            timestamp: new Date(),
            createdAt: new Date(),
            createdBy: Meteor.userId()
        }
        return Payroll.insert(dataSave);
    }
})