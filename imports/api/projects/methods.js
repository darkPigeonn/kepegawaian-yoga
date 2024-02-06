import { Projects } from "./projects";
import { Notifications } from "../notification/notification";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "projects.getAll"(){
      const thisUser = Meteor.userId();
      const relatedUser = Meteor.users.findOne({
        _id: thisUser,
      });

      const userRoles = relatedUser.roles || [];
      const checkRoles = ["admin", "super-admin"];
      const isAdmin = userRoles.some(role => checkRoles.includes(role));

      let findProjects = "";

      if (isAdmin) {
        findProjects = Projects.find({},{sort: {createdAt: -1}}).fetch();
      }
      else{
        findProjects = Projects.find({ "members.email": relatedUser.emails[0].address },{sort: {createdAt: -1}}).fetch();
      }
      
      return findProjects;
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
      let {nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages} = data
      check(nama_project, String);
      check(deskripsi, String);
      check(status, String);
      check(updatedMembers, Array);
      check(notifType, String);
      check(messages, String);

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
        id_leader: thisUser,
        createdAt: new Date(),
        createdBy: createdBy
      };

      const idProject = Projects.insert(dataSave); 

      const dataNotif = updatedMembers.map(x => {
          let notif = {
              member_id: x.id,
              member_name: x.name,
              member_email: x.email,
          }

          return notif;
      });

      const newDataSave = { 
        id_project: idProject,
        data: dataNotif,
        assign_for: notifType,
        message: messages,
        createdAt: new Date(),
      };

      return Notifications.insert(newDataSave);
    },
    "projects.update"(id, data) {
      let { nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages } = data
      check(nama_project, String);
      check(deskripsi, String);
      check(status, String);
      check(updatedMembers, Array);
      check(notifType, String);
      check(messages, String);
      
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
    
      const dataNotif = updatedMembers.map(x => {
        let notif = {
            member_id: x.id,
            member_name: x.name,
            member_email: x.email,
        }

        return notif;
    });

      const newDataSave = { 
        id_project: id,
        data: dataNotif,
        assign_for: notifType,
        message: messages,
        createdAt: new Date(),
      };
      
      const updateNotif = Notifications.insert(newDataSave);

      return Projects.update(
        { _id: id },
        { $set: dataSave }
      );;
    },
})