import { Employee } from "../employee/employee";
import { Departement } from "./departement";
import { check } from "meteor/check";

Meteor.methods({
  "departement.getAll"() {
    let partnerCode;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
      });
    partnerCode = adminPartner.partners[0];
    return Departement.find({partnerName: partnerCode}).fetch();
  },
  "departement.getBy"(id) {
    check(id, String);
    const thisDepartement = Departement.findOne({ _id: id });
    if(thisDepartement){
      const thisMember = Employee.find({department_unit: thisDepartement.name}).fetch();
      thisDepartement.member = thisMember;
    }
    return thisDepartement;
  },
  async "departement.insert"(data) {
    let {name, description} = data;
    check(name, String);
    check(description, String);

    let partnerCode;
    let createdBy;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
      });
    partnerCode = adminPartner.partners[0];
    createdBy = adminPartner.fullname;
    const dataSave = {
      name,
      description,
      partnerName : partnerCode,
      createdAt: new Date(),
      createdBy: createdBy,
    };

    const cek = Departement.findOne({name: dataSave.name})
    if(!cek) {
      return Departement.insert(dataSave);
    }
    throw new Meteor.Error(404, "Nama Departement Sudah Ada")

  },
  "departement.update"(id, data){
    check(id, String);

    let {name, description, leader} = data;
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    const leaderDepartement = Employee.findOne({_id: leader});

    const timeline = {
      event: `Set Leader Departement to ${leaderDepartement.full_name}`,
      operator: adminPartner._id,
      operatorName: adminPartner.fullname,
      timestamp: new Date()
    }

    const headDepartment = {
      id: leader,
      name: leaderDepartement.full_name
    }

    const getDepartementName = Departement.findOne({_id: id});
    const updateDepartementEmployee = Employee.update({department_unit: getDepartementName.name, statusDelete: 0}, {$set: {department_unit: name, departmentId: id}}, {multi: true});
    const updateDepartement = Departement.update(
      { _id: id },
      { $set: {name: name, description: description, headDepartment: headDepartment}, $push: {timeline: timeline}}
    );
    if(data.members.length > 0 || data.members != undefined) {
      for (let index = 0; index < data.members.length; index++) {
        const element = data.members[index];
        const updateEmployee = Employee.update({_id: element}, {
          $set: {
            departmentId: id,
            department_unit: name,
          }
        })
      }
    }
    return updateDepartement;
  },
  "departement.getEmployee"(){
    const thisUser = Meteor.userId();
    const adminPartner = Meteor.users.findOne({
      _id: thisUser,
    });
    partnerCode = adminPartner.partners[0];
    return Employee.find({status: 10, statusDelete: 0, partnerCode: partnerCode }, {sort: {createdAt: -1}}).fetch();
  }
});