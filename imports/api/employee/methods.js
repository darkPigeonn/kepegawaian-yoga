import { Employee } from "./employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "employee.createApp"(dataSend){
      check(dataSend, Object);

      let postURL =
      process.env.USE_LOCAL === "true"
        ? "http://localhost:3005/imavi/"
        : "https://api.imavi.org/imavi/";
      // console.log(postURL);
      // console.log(Meteor.settings.APP_IDMOBILE);
      // console.log(Meteor.settings.APP_IDMOBILE);
      try {
        response = HTTP.call("POST", `${postURL}users/register`, {
          headers: {
            Id: Meteor.settings.APP_IDMOBILE,
            Secret: Meteor.settings.APP_SECRETMOBILE,
          },
          data: dataSend,
        });
        return true;
      } catch (e) {
        // console.log(e);
        throw new Meteor.Error(412, "Akun sudah ada pada sistem")
      }
    },
    "employee.getAll"(){
      let partnerCode;
      const thisUser = Meteor.userId();
      const adminPartner = Meteor.users.findOne({
        _id: thisUser,
      });
      partnerCode = adminPartner.partners[0];
      return Employee.find({status: 10, statusDelete: 0, partnerCode: partnerCode }, {sort: {createdAt: -1}}).fetch();
      // console.log(data);
      // return data;
    },
    "employee.getBy"(id){
      check(id, String);
      return Employee.findOne({ _id: id });
    },
    "employee.getByDepartement"(namaDepartement){
      const data = Employee.find({departement_unit: namaDepartement})
      return data;
    },
    "employee.remove"(id){
      check(id, String);
      const tglHapus = new Date();
      return Employee.update(id, {$set: {statusDelete: 1, deleteTime : tglHapus}});
    },
    "employee.filterByNama"(data){
      check(data, String);
      return Employee.find({full_name: {$regex: data, $options: 'i'}}).fetch();
    },
    "employee.filterByJabatan"(data){
      check(data, String);
      return Employee.find({ job_position: { $regex: data, $options: 'i' } }).fetch();
    },
    "employee.filterByDepartement"(data){
      check(data, String);
      return Employee.find({department_unit: { $regex: data, $options: 'i' }}).fetch();
    },
    "employee.filterByTahun" (data){
      check(data, String);
      return Employee.find({$expr: {$eq: [{$year: "$start_date"}, data]}});
    },
    "employee.getEmployeeMasuk" (){
      const startDate = moment().startOf('month').toDate();
      const endDate = moment().endOf('month').toDate();
      return Employee.find({start_date: {
        $gte: startDate,
        $lte: endDate
      }}).fetch();
    },
    "employee.getEmployeeKeluar" () {
      return Employee.find({statusDelete: 1}).fetch();
    },

    async "employee.insert"(data) {
      let { full_name,identification_number,place_of_birth,date_of_birth,gender,address,phone_number,email_address,job_position,department_unit,start_date,employment_status,base_salary,allowances,deductions,highest_education,education_institution,major_in_highest_education,academic_degree,previous_work_experience,marital_status,number_of_children,emergency_contact_name,emergency_contact_phone,employment_history,linkGambar,golongan } = data
      check(full_name, String);
      check(identification_number, String);
      check(gender, String);
      check(address, String);
      check(email_address, String);
      check(job_position, String);
      check(department_unit, String);
      check(employment_status, String);
      check(highest_education, String);
      check(education_institution, String);
      check(major_in_highest_education, String);
      check(academic_degree, String);
      check(previous_work_experience, String);
      check(marital_status, String);
      check(emergency_contact_name, String);
      // check(employment_history, String);
      // check(partnerCode, String);
  
      // date_of_birth = new Date(date_of_birth);
      // start_date = new Date(start_date);

      let partnerCode;
      let createdBy;
      const thisUser = Meteor.userId();
      console.log(thisUser);
      const adminPartner = Meteor.users.findOne({
        _id: thisUser,
      });
      console.log(adminPartner.partners[0]);
      partnerCode = adminPartner.partners[0];
      createdBy = adminPartner.fullname;
    
      const dataSave = { 
        full_name,
        identification_number,
        place_of_birth,
        date_of_birth,
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
        golongan,
        partnerCode,
        linkGambar,
        status: 10, //10: Aktif, 20: Keluar, 30: pindah departemen
        statusDelete: 0, //0: tidak soft delete, 1: soft deleted
        createdAt: new Date(),
        createdBy: createdBy,
        historyMutasi: [
          {
            name: department_unit,
            timestamp: new Date()
          }
        ]
      };
      return await Employee.insert(dataSave);
    },

    async "employee.insertCSV"(data) {
      const fail = []
      for (const i of data) {
        let { full_name,identification_number,place_of_birth,date_of_birth,gender,address,phone_number,email_address,job_position,department_unit,start_date,employment_status,base_salary,allowances,deductions,highest_education,education_institution,major_in_highest_education,academic_degree,previous_work_experience,marital_status,number_of_children,emergency_contact_name,emergency_contact_phone,employment_history,linkGambar,golongan } = i
          identification_number = identification_number.toString();
          base_salary = base_salary.toString();
          allowances = allowances.toString();
          deductions = deductions.toString();
          phone_number = phone_number.toString();
          emergency_contact_phone = emergency_contact_phone.toString();
          number_of_children = number_of_children.toString();

          check(full_name, String);
          check(identification_number, String);
          check(gender, String);
          check(address, String);
          check(email_address, String);
          check(job_position, String);
          check(department_unit, String);
          check(employment_status, String);
          check(highest_education, String);
          check(education_institution, String);
          check(major_in_highest_education, String);
          check(academic_degree, String);
          check(previous_work_experience, String);
          check(marital_status, String);
          check(emergency_contact_name, String);
          // check(employment_history, String);
      
          base_salary = convert2number(base_salary);
          allowances = convert2number(allowances);
          deductions = convert2number(deductions);

          console.log(base_salary, allowances, deductions)

          phone_number = formatPhoneNumber(phone_number);
          emergency_contact_phone = formatPhoneNumber(emergency_contact_phone);

          date_of_birth = moment(date_of_birth, 'DD/MM/YYYY').toDate();
          start_date = moment(start_date, 'DD/MM/YYYY').toDate();

          // console.log(date_of_birth, start_date);

          let partnerCode;
          let createdBy;
          const thisUser = Meteor.userId();
          console.log(thisUser);
          const adminPartner = Meteor.users.findOne({
            _id: thisUser,
          });
          console.log(adminPartner.partners[0]);
          partnerCode = adminPartner.partners[0];
          createdBy = adminPartner.fullname;
    
          const dataSave = {
            full_name,
            identification_number,
            place_of_birth,
            date_of_birth,
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
            golongan,
            partnerCode,
            linkGambar: "-",
            // outlets: "imavi",
            status: 10, //10: Aktif, 20: Keluar, 30: pindah departemen
            statusDelete: 0, //0: tidak soft delete, 1: soft deleted
            createdAt: new Date(),
            createdBy: createdBy,
            historyMutasi: [
              {
                name: department_unit,
                timestamp: new Date()
              }
            ]
          };

          console.log(dataSave);
        try {
          
          Employee.insert(dataSave);
        } catch (error) {
          fail.push(dataSave)
        }
        
      }
      return fail
    },

    "employee.update"(id, data) {
      let { full_name,identification_number,place_of_birth,date_of_birth,gender,address,phone_number,email_address,job_position,department_unit,start_date,employment_status,base_salary,allowances,deductions,highest_education,education_institution,major_in_highest_education,academic_degree,previous_work_experience,marital_status,number_of_children,emergency_contact_name,emergency_contact_phone,employment_history,golongan } = data
      check(full_name, String);
      check(identification_number, String);
      check(gender, String);
      check(address, String);
      check(email_address, String);
      check(job_position, String);
      check(department_unit, String);
      check(employment_status, String);
      check(highest_education, String);
      check(education_institution, String);
      check(major_in_highest_education, String);
      check(academic_degree, String);
      check(previous_work_experience, String);
      check(marital_status, String);
      check(emergency_contact_name, String);
      // check(employment_history, String);
  
      // date_of_birth = new Date(date_of_birth);
      // start_date = new Date(start_date);
  
      const dataSave = {
        full_name,
        identification_number,
        place_of_birth,
        date_of_birth,
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
        golongan
      };
      // console.log(dataSave, id);
    return Employee.update(
      { _id: id },
      { $set: dataSave }
    );
  },

  "employee.updateWithPicture"(id, data) {
    let { full_name,identification_number,place_of_birth,date_of_birth,gender,address,phone_number,email_address,job_position,department_unit,start_date,employment_status,base_salary,allowances,deductions,highest_education,education_institution,major_in_highest_education,academic_degree,previous_work_experience,marital_status,number_of_children,emergency_contact_name,emergency_contact_phone,employment_history,partnerCode,linkGambar,golongan } = data
    check(full_name, String);
    check(identification_number, String);
    check(gender, String);
    check(address, String);
    check(email_address, String);
    check(job_position, String);
    check(department_unit, String);
    check(employment_status, String);
    check(highest_education, String);
    check(education_institution, String);
    check(major_in_highest_education, String);
    check(academic_degree, String);
    check(previous_work_experience, String);
    check(marital_status, String);
    check(emergency_contact_name, String);
    // check(employment_history, String);
    // check(partnerCode, String);

    // date_of_birth = new Date(date_of_birth);
    // start_date = new Date(start_date);

    const dataSave = {
      full_name,
      identification_number,
      place_of_birth,
      date_of_birth,
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
      golongan
    };
    // console.log(dataSave, id);
  return Employee.update(
    { _id: id },
    { $set: dataSave }
  );
},

  "employee.mutasiInsert" (id, departement_unit) {
    check(id, String);
    check(departement_unit, String);
    const name = departement_unit;
    const timestamp = new Date();
    
    return Employee.update(
      { _id: id },
      { $set: {department_unit: name}, $push: {historyMutasi: {name: name, timestamp: timestamp}}}
    );
  },

  async "users.createAppMeteorEmployee"(dataSend){
    check(dataSend, Object);

    console.log(dataSend);

    let newAccountData = {
        username: dataSend.username,
        email: dataSend.username,
        password: dataSend.password,
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
            return await Meteor.users.update({ _id }, { $set: {roles: [], fullname: dataSend.fullname, partners: [partnerCode] } })
        }

    } catch (error) {
        console.log(error);
        return error;
    }
    
    // Roles.createRole(dataSend.role)
    // console.log(_id);
    return true;
},

  // "employee.getMutasi"(id){
  //   check(id, String);
  //   const data = Employee.find({status: 10, statusDelete: 0}).fetch();
  //   // console.log(data);
  //   return data;
  // }

})


function isNumber(value) {
  return /^\d+$/.test(value);
}

function formatPhoneNumber(phoneNumber) {
  // Remove any non-digit characters from the phone number
  const cleanedNumber = phoneNumber.toString().replace(/\D/g, '');
  // Check if the number starts with '0', indicating it's a local number
  //karena angka 0 tidak diterima dan tidak masuk, digantilah menggunakan angka 8 karena indonesia
  //pasti menggunakan 08 didepannya
  if (cleanedNumber.startsWith('8')) {
    // Remove the leading '0' and prepend the country code '62'
    const formattedNumber = '62' + cleanedNumber.slice(0);
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
let temp = data.toString().replace(/\./g, ''); // merubah . jadi ""
return parseFloat(temp);
}