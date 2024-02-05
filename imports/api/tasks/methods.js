import { Tasks } from "./tasks";
import { Projects } from "../projects/projects";
import { Employee } from "../employee/employee";
import { Notifications } from "../notification/notification";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "tasks.getAll"(){
        return Tasks.find({},{sort: {createdAt: -1}}).fetch();
    },
    "tasks.getThisTask"(id){
        check(id, String);
        const getTask = Tasks.findOne({_id: id});
        const getProject = Projects.findOne({_id: getTask.id_project});
        getTask.nama_project = getProject.nama_project;
        getTask.project_members = getProject.members;
        
        const updatedMembers = getTask.project_members.map((x) => {
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

        getTask.project_members = updatedMembers;

        return getTask;
    },
    "tasks.getRelatedTasks"(id){
        check(id, String);
        return Tasks.find({id_project: id},{sort: {deadline: 1}}).fetch();
    },
    "tasks.getAllEmployeeThisTask"(idTask){
        const thisTask = Tasks.findOne({ _id: idTask });
      
        if(thisTask){
          const projectMembers = thisTask.members.map((x) => {
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
  
          thisTask.members = projectMembers;
        }
  
        return thisTask;
    },
    "tasks.remove"(id){
        check(id, String);
        const tglHapus = new Date();
        return Tasks.update(id, {$set: {statusDelete: 1, deleteTime : tglHapus}});
    },
    "tasks.insert"(data) {
        let { idProject, nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages } = data
        check(idProject, String);
        check(nama_tasks, String);
        check(deskripsi, String);
        check(priority, String);
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
            id_project: idProject,
            nama_task: nama_tasks,
            deskripsi,
            deadline,
            priority,
            members: updatedMembers,
            createdAt: new Date(),
            createdBy: createdBy
        };

        const idTask = Tasks.insert(dataSave);

        const dataNotif = updatedMembers.map(x => {
            let notif = {
                member_id: x.id,
                member_name: x.name,
                member_email: x.email,
            }

            return notif;
        });

        const newDataSave = { 
            id_task: idTask,
            data: dataNotif,
            assign_for: notifType,
            message: messages,
            createdAt: new Date(),
        };

        return Notifications.insert(newDataSave);
    },
    "tasks.update"(id, data) {
        let { nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages } = data
        check(nama_tasks, String);
        check(deskripsi, String);
        check(priority, String);
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
            nama_task: nama_tasks,
            deskripsi,
            deadline,
            priority,
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
            id_task: id,
            data: dataNotif,
            assign_for: notifType,
            message: messages,
            createdAt: new Date(),
        };

        const updateTask = Notifications.insert(newDataSave);

        return Tasks.update(
            { _id: id },
            { $set: dataSave }
        );
    },

})