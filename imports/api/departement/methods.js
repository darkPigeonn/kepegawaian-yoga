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

    return await Departement.insert(dataSave);
  },
  "departement.update"(id, data){
    check(id, String);

    let {name, description} = data;

    return Departement.update(
      { _id: id },
      { $set: {name: name, description: description}}
    );
  }
});