import { Projects } from "./projects";
import { Tasks } from "../tasks/tasks";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "projects.getAll"(){
      return Projects.find({},{sort: {createdAt: -1}}).fetch();
    },
    "projects.getThisProject"(id){
      check(id, String);
      return Projects.findOne({_id: id});
    },
    "projects.getAllEmployeeThisProject"(idProject){
      const thisProject = Projects.findOne({ _id: idProject });
    
      if(thisProject){
        const projectMembers = thisProject.members.map((x) => {
          const listMember = Employee.find({_id: x.id}).fetch();

          return listMember.map(member => ({
              id: member._id,
              name: member.full_name,
              job_position: member.job_position,
              start_date: member.start_date,
              department_unit: member.department_unit,
              employment_status: member.employment_status,
          }));
        });

        thisProject.members = projectMembers;
      }

      return thisProject;
    },
    "projects.remove"(id){
      check(id, String);
      const tglHapus = new Date();
      return Employee.update(id, {$set: {statusDelete: 1, deleteTime : tglHapus}});
    },
    "projects.insert"(data) {
      let {nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers} = data
      check(nama_project, String);
      check(deskripsi, String);
      check(status, String);
      check(updatedMembers, Array);

      let createdBy;
      const thisUser = Meteor.userId();
      const adminPartner = Meteor.users.findOne({
        _id: thisUser,
      });
      createdBy = adminPartner.fullname;
    
      const dataSave = { 
        nama_project,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        status,
        members: updatedMembers,
        createdAt: new Date(),
        createdBy: createdBy
      };

      return Projects.insert(dataSave);
    },
    "projects.update"(id, data) {
      let {nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers} = data
      check(nama_project, String);
      check(deskripsi, String);
      check(status, String);
      check(updatedMembers, Array);
      
      let updatedBy;
      const thisUser = Meteor.userId();
      const adminPartner = Meteor.users.findOne({
        _id: thisUser,
      });
      updatedBy = adminPartner.fullname;
    
      const dataSave = { 
        nama_project,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        status,
        members: updatedMembers,
        updatedAt: new Date(),
        updatedBy: updatedBy
      };
    
      return Projects.update(
        { _id: id },
        { $set: dataSave }
      );
    },

})