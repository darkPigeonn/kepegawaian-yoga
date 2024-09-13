import { data } from "jquery";
import { Users } from "./user";
import { check } from "meteor/check";
import { Meteor } from 'meteor/meteor';

import { Roles } from "meteor/alanning:roles";
import moment from "moment";
import { Employee } from "../employee/employee";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import  generatePassword  from 'generate-password';
import { ConfigAttendanceUser, MonthlyAttendance, Permits, StaffsAttendance } from "../attendance/attendance.js";
import { Salaries } from "../salaries/salaries.js";
Meteor.methods({
    "users.getAll"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners;
        // console.log(Meteor.users.find().fetch());
        return Meteor.users.find({partners: partnerCode}).fetch();
    },
    "users.getAllSuperAdmin"(){
        return Meteor.users.find().fetch();
    },
    async "users.createAppMeteor"(dataSend){
        check(dataSend, Object);

        Roles.createRole(dataSend.role, {unlessExists: true});

        const password = generatePassword.generate({
            length: 12, // Panjang kata sandi
            numbers: true, // Termasuk angka
            symbols: true, // Termasuk simbol
            uppercase: true, // Termasuk huruf besar
            excludeSimilarCharacters: true, // Hindari karakter yang mirip (mis. 'i' dan 'l')
        })
    
        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                partnerCode = adminPartner.partners[0];
                return Meteor.users.update({ _id }, { $set: { roles: [dataSend.role], fullname: dataSend.fullname, partners: [partnerCode] } })
            }

        } catch (error) {
            console.log(error);
            return error;
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    async "users.createAppMeteorSuperAdmin"(dataSend){
        check(dataSend, Object);

        console.log(dataSend);
        // return

        Roles.createRole("admin", {unlessExists: true});
        // return

        const password = generatePassword.generate({
            length: 12, // Panjang kata sandi
            numbers: true, // Termasuk angka
            symbols: false, // Termasuk simbol
            uppercase: true, // Termasuk huruf besar
            excludeSimilarCharacters: true, // Hindari karakter yang mirip (mis. 'i' dan 'l')
        })

        let newAccountData = {
            username: dataSend.username,
            email: dataSend.username,
            password: password,
        };
        let _id;
        try {
            _id = Accounts.createUser(newAccountData);
            console.log(_id);
            if(_id){
                let partnerCode;
                const thisUser = Meteor.userId();
                const adminPartner = Meteor.users.findOne({
                    _id: thisUser,
                });
                console.log(adminPartner);
                partnerCode = adminPartner.partners;
                const update = Meteor.users.update({ _id }, { $set: { roles: ["admin"], fullname: dataSend.fullname, partners: [dataSend.partners] } })
                if(!update.error){
                    return password
                }
                return update
            }

        } catch (error) {
            console.log(error);
        }
        
        // Roles.createRole(dataSend.role)
        // console.log(_id);
        return true;
    },

    "user.remove"(id){
        check(id, String);
        return Meteor.users.remove({_id: id});
    },

    "users.getById"(id){
        check(id, String);
        return Meteor.users.findOne({ _id: id });
    },

    "users.edit"(id, dataSave){
        check(id, String);
        check(dataSave, Object);
        console.log(dataSave);
        return Meteor.users.update({ _id: id }, { $set: { username: dataSave.username, 'emails.0.address': dataSave.username, fullname: dataSave.fullname, roles: [dataSave.roles] } })
    },

    "users.editPassword"(id, password){
        check(id, String);
        check(password, String);
        Accounts.setPassword(id, password);
        return true;
    },
    "users.getDataLogin"(id) {
        const data = Meteor.users.findOne({ _id: id });
        return data;
    },

    "users.getDataNotEmployee"() {
        let dataFinal = [];
        const dataAppProfile = AppProfiles.find().fetch();
        for (let index = 0; index < dataAppProfile.length; index++) {
            const element = dataAppProfile[index];
            const objectIdString = element._id.toString().slice(10, -2);
            const dataAppUser = AppUsers.findOne({profileId : objectIdString})
            if(dataAppUser){
                const dataEmployee = Employee.findOne({email_address: dataAppUser.email});
                if(!dataEmployee){
                    dataAppUser.fullname = dataAppProfile[index].fullName
                    dataFinal.push(dataAppUser)
                }
            }
        }
        return dataFinal;

    },
    "users.createDataEmployee"(id) {
        id = id.toString().slice(10, -2);
        const objectId = new Meteor.Collection.ObjectID(id);
        const dataAppuser = AppUsers.findOne({_id: objectId});
        const objectIdAppProfile = new Meteor.Collection.ObjectID(dataAppuser.profileId);
        const dataAppProfile = AppProfiles.findOne({_id: objectIdAppProfile});
        console.log(dataAppProfile);
        const dataSave = {
            full_name : dataAppProfile.fullName,
            identification_number: "",
            place_of_birth : "",
            dob: null,
            gender: "",
            address: "",
            phone_number: "",
            email_address: dataAppProfile.email,
            job_position: "",
            department_unit: "",
            start_date: null,
            employment_status: null,
            base_salery: 0,
            allowances: 0,
            deductions: 0,
            highest_education: null,
            eduation_institution: null,
            major_in_highest_education: null,
            academic_degree: null,
            previous_work_experience: null,
            marital_status: null,
            number_of_children: 0,
            emergency_contact_name: null,
            emergency_contact_name: null,
            golongan: 0,
            partnerCode: dataAppProfile.outlets[0],
            linkGambar: "-",
            status: 10,
            statusDelete: 0,
            createdAt: new Date(),
            createdBy: "SuperAdmin",
            historyMutasi: []
        }
        return Employee.insert(dataSave)
    },

    "users.getAppUsers"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners[0];
        return AppUsers.find({outlets: partnerCode}).fetch()
    },

    "users.updateProfileIdAppUser"(data){
        console.log(data);
        // data = idEmployee, emailEmployee, idAppUser, emailAppUser, yang terpakai hanya idEmployee dan idAppUser
        for (const iterator of data) {
            const objectIdString = iterator.idAppUser.toString().slice(10, -2);
            const objectId = new Meteor.Collection.ObjectID(objectIdString);
            let getEmployee = Employee.findOne({_id: iterator.idEmployee});
            const cek = AppUsers.findOne({_id : objectId});
            const objectIdProfile = new Meteor.Collection.ObjectID(cek.profileId);
            const getAppProfiles = AppProfiles.findOne({_id: objectIdProfile});
            const oldIdProfile = getAppProfiles._id.toString().slice(10, -2);
            delete getAppProfiles._id;
            getEmployee = { ...getEmployee, ...getAppProfiles };

            // Menambahkan field oldIdProfile ke dalam getEmployee
            getEmployee.oldIdProfile = oldIdProfile;
            if(getEmployee.isUpdated == undefined || getEmployee.isUpdated == null || getEmployee.isUpdated == false) {
                getEmployee.isUpdated = false;
            }

            if(getEmployee.isUpdated == false){
                getEmployee.isUpdated = true;
                const updateEmployee = Employee.update({
                    _id: iterator.idEmployee
                },
                {
                    $set: getEmployee
                })
            }
        }

        //buat old data idProfile untuk jaga"
        for (const iterator of data) {
            const objectIdString = iterator.idAppUser.toString().slice(10, -2);
            const objectId = new Meteor.Collection.ObjectID(objectIdString);
            const cek = AppUsers.findOne({_id : objectId});

            const makeOldIdProfile = AppUsers.update({
                _id: objectId
            },
            {
                $set: { oldIdProfile : cek.profileId}
            })
        }

        let dataFail = [];
        let flag = true;

        //update profileId appUsers dengan employee
        for (const iterator of data) {
            try {
                console.log(iterator.idEmployee);
                const objectIdString = iterator.idAppUser.toString().slice(10, -2);
                const objectId = new Meteor.Collection.ObjectID(objectIdString);
                const updateProfileId = AppUsers.update({
                    _id : objectId
                },
                {
                    $set: { profileId : iterator.idEmployee}
                })
            } catch (error) {
                console.log(error);
                flag = false;
                dataFail.push(iterator.emailEmployee)
            }
        }
        if(flag == false){
            console.log("Ini adalah data yang error : ", dataFail);
            return dataFail
        }
        else {
            return "success"
        }
    },

    "users.getAppProfiles"(){
        let partnerCode;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        partnerCode = adminPartner.partners[0];
        return AppProfiles.find({outlets: partnerCode}).fetch()       
    },

    "users.createEmployeeByAppProfile"(data) {
        const arrDataFounded = [];
        const thisUser = Meteor.userId()
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        let insertEmployee;
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let id = element.idAppProfile;
            id = new Meteor.Collection.ObjectID(id)
            const dataAppProfile = AppProfiles.findOne({_id: id})
            const cekPegawai = Employee.findOne({oldIdProfile: id.toHexString()})
            if(!cekPegawai) {
                console.log("data pegawai tidak ditemukan");
                // insert data pegawai
                const dataSave = {
                    full_name: dataAppProfile.fullName ?? dataAppProfile.fullname ?? "",
                    identification_number: null,
                    place_of_birth: null,
                    dob: null,
                    gender: null,
                    address: null,
                    phone_number: dataAppProfile.phoneNumber,
                    email_address: dataAppProfile.email,
                    job_position: dataAppProfile.jabatan,
                    department_unit: null,
                    departmentId: null,
                    start_date: null,
                    employment_status: null,
                    base_salary: null,
                    allowances: null,
                    deductions: null,
                    highest_education: null,
                    education_institution: null,
                    major_in_highest_education: null,
                    academic_degree: null,
                    previous_work_experience: null,
                    marital_status: null,
                    number_of_children: null,
                    emergency_contact_name: null,
                    emergency_contact_phone: null,
                    accountNumber: null,
                    accountNumberBank: null,
                    accountNumberName: null,
                    golongan: null,
                    partnerCode: adminPartner.outlets[0],
                    linkGambar: null,
                    status: 10, //10: Aktif, 90: Keluar, 30: pindah departemen
                    statusDelete: 0, //0: tidak soft delete, 1: soft deleted
                    createdAt: new Date(),
                    createdBy: thisUser,
                    oldIdProfile: id.toHexString(),
                    historyMutasi: null
                };
                insertEmployee = Employee.insert(dataSave)
                console.log("Insert data pegawai selesai");

                const dataAppUser = AppUsers.findOne({profileId: id.toHexString()})
                if(dataAppUser) {
                    AppUsers.update({profileId: id.toHexString()}, {
                        $set: {
                            profileId: insertEmployee,
                            oldIdProfile: id.toHexString()
                        }
                    })
                }

                // update data absensi
                    // update data absensi harian pegawai
                const dataDailyAttendance = StaffsAttendance.find({userId: id.toHexString()}).fetch()
                
                if(dataDailyAttendance.length > 0) {
                    dataDailyAttendance.forEach(item => {
                        StaffsAttendance.update({_id: item._id}, {
                            $set: {
                                userId: insertEmployee,
                                isUpdated: true
                            }
                        })
                    })
                    console.log("Update data absensi harian pegawai selesai");
                }

                    // update data config attendance pegawai
                const dataConfigAttendance = ConfigAttendanceUser.findOne({userId: id.toHexString()})
                if(dataConfigAttendance) {
                    ConfigAttendanceUser.update({_id: dataConfigAttendance._id}, {
                        $set: {
                            userId: insertEmployee,
                            isUpdated: true
                        }
                    })
                    
                    console.log("Update data konfig absensi pegawai selesai");
                }

                    // update data monthly attendance pegawai
                const dataRekapMonthly = MonthlyAttendance.find({"details.userId": id.toHexString()}).fetch()
                if(dataRekapMonthly.length > 0) {
                    // dataRekapMonthly.forEach(item => {
                    //     MonthlyAttendance.update(
                    //       { _id: item._id, "details.userId": id }, // Cari dokumen yang cocok
                    //       { $set: { "details.$.userId": insertEmployee }}
                    //     );
                    // });
                    MonthlyAttendance.update(
                        { "details.userId": id.toHexString() }, // Cari dokumen yang cocok
                        { $set: { "details.$.userId": insertEmployee }},
                        { multi: true } 
                    );
                    console.log("Update data rekap absensi bulanan selesai");
                }

                // update data ijin
                const dataPermits = Permits.find({creatorId: id.toHexString()}).fetch();
                if(dataPermits.length > 0) {
                    // dataPermits.forEach(item => {
                    //     Permits.update({creatorId: id}, {
                    //         $set: {
                    //             creatorId: insertEmployee,
                    //             isUpdated: true
                    //         }
                    //     })
                    // })
                    Permits.update({creatorId: id},
                        {
                            $set: {
                                creatorId: insertEmployee,
                                isUpdated: true
                            }
                        },
                        { multi: true }
                    )
                }

                // update data slip gaji
                const dataSlipGaji = Salaries.find({employeeId: id.toHexString()}).fetch()
                if(dataSlipGaji.length > 0) {
                    Salaries.update({employeeId: id}, {
                        $set: {
                            employeeId: insertEmployee,
                            isUpdated: true
                        }
                    },
                    { multi: true });
                    console.log("Update data slip gaji selesai"); 
                }
            }
            else {
                const dataPush = {
                    name: element.nameAppProfile,
                    email: element.emailAppProfile
                }
                arrDataFounded.push(dataPush)
            }
            
        }

        if(arrDataFounded.length == 0) {
            return {insertEmployee}
        }
        else {
            return {insertEmployee, dataKembar: arrDataFounded}
        }
        
    }
})
