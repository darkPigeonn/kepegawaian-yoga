import { Employee } from "../employee/employee";
import { Departement } from "./departement";
import { check } from "meteor/check";

Meteor.methods({
  "departement.getAll"() {
      return Departement.find().fetch();
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

    // console.log(data);

    const dataSave = {
      name,
      description,
      partnerID : "-",
      partnerName : "-",
      createdAt: new Date(),
      createdBy: "Admin Bulk",
    };

    return await Departement.insert(dataSave);
  },
  "departement.update"(id, data){
    check(id, String);

    let {name, description} = data;
    // console.log(name,description);

    return Departement.update(
      { _id: id },
      { $set: {name: name, description: description}}
    );
  }
});