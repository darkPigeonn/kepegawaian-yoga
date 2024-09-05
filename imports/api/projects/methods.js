import { Projects, Objective, Milestone } from "./projects";
import { Notifications } from "../notification/notification";
import { Employee } from "../employee/employee";
import { check } from "meteor/check";
import moment from "moment";
import { Status, Tasks } from "../tasks/tasks";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "projects.getAll"() {
      const thisUser = Meteor.userId();
      const relatedUser = Meteor.users.findOne({
          _id: thisUser,
      });
  
      const userRoles = relatedUser.roles || [];
      const checkRoles = ["admin", "super-admin"];
      const isAdmin = userRoles.some(role => checkRoles.includes(role));

      let findProjects;
      // Admin = lihat semua
      if (isAdmin) {
        findProjects = Projects.find({partner: relatedUser.partners[0]}).fetch();

        const priorityOrder = { active: 0, 'on-hold': 1, completed: 2 };
        findProjects.sort((a, b) => {
            const priorityA = priorityOrder[a.status];
            const priorityB = priorityOrder[b.status];
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            } else {
                return a.tanggal_selesai - b.tanggal_selesai;
            }
        });
      } 
      
      // Non admin = lihat created & assigned project
      else {
        // User = creator
        const resultTrue = Projects.find({
          id_leader: relatedUser._id
        }).fetch();

        // User = member dari project
        const resultFalse = Projects.find({
          "members.email": relatedUser.emails[0].address
        }).fetch();

        const priorityOrder = { active: 0, 'on-hold': 1, completed: 2 };
        const sortProjects = (a, b) => {
            const priorityA = priorityOrder[a.status];
            const priorityB = priorityOrder[b.status];
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            } else {
                return a.tanggal_selesai - b.tanggal_selesai;;
            }
        };

        const uniqueProjects = resultFalse.filter(project => {
            return !resultTrue.some(p => p._id === project._id);
        });

        findProjects = resultTrue.concat(uniqueProjects);
        findProjects.sort(sortProjects);
      }
    
      return findProjects;
    },
    "projects.getThisProject"(id){
      check(id, String);
      let projects = Projects.findOne({_id: id});
      let objective = Objective.find({projectId: id}, {projection: {
        _id: 1,
        description: 1
      }}).fetch()
      projects.objective = objective
      // console.log(projects.objective);
      for (let index = 0; index < projects.objective.length; index++) {
        const element = projects.objective[index];
        const dataMilestone = Milestone.find({objectiveId: element._id}, {_id: 1, description: 1}).fetch()
        element.milestone = dataMilestone
        for (let j = 0; j < dataMilestone.length; j++) {
          const element1 = dataMilestone[j];
          const dataTugas = Tasks.find({idMilestone: element1._id}).fetch()
          for (let k = 0; k < dataTugas.length; k++) {
            const element2 = dataTugas[k];
            const dataStatus = Status.findOne({id: element2.status})
            element2.status = dataStatus.label
          }
          element1.tasks = dataTugas
        }
      }

      return projects
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
      let {nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages, objective} = data
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

      //Masukkan data pembuat ke members nya juga
      updatedMembers.push({
        id: adminPartner.profileId,
        name: adminPartner.fullName,
        email: adminPartner.username,
    })
    
      const dataSave = { 
        nama_project,
        deskripsi,
        tanggal_mulai,
        tanggal_selesai,
        status,
        members: updatedMembers,
        id_leader: thisUser,
        partner: adminPartner.partners[0],
        createdAt: new Date(),
        createdBy: createdBy
      };

      const idProject = Projects.insert(dataSave); 

      for (let index = 0; index < objective.length; index++) {
        const element = objective[index];
        const dataInsertObj = {
          description: element.name,
          projectId: idProject,
          createdAt: new Date(),
          createdBy: thisUser
        }
        const insertObjective = Objective.insert(dataInsertObj)
        for (let j = 0; j < element.milestone.length; j++) {
          const element1 = element.milestone[j];
          console.log(element1);
          const dataInsertMilestone = {
            description: element1.name,
            deadline: new Date(element1.deadline),
            projectId: idProject,
            objectiveId: insertObjective,
            createdAt: new Date(),
            createdBy: thisUser
          }
          const insertMilestone = Milestone.insert(dataInsertMilestone)
        }
      }
      // Notification
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
        senderId: adminPartner._id,
        receiverId: "system",
        message: messages,
        categoryId: 10,
        categoryName: "Informasi",
        timestamp: new Date(),
        createdAt: new Date(),
        createdBy: adminPartner._id
      };

      return Notifications.insert(newDataSave);
    },
    "projects.update"(id, data, deleteObjective, deleteMilestone) {
      let { nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages, objective } = data
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
    
      // Notification
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
        senderId: adminPartner._id,
        receiverId: "system",
        message: messages,
        categoryId: 10,
        categoryName: "Informasi",
        timestamp: new Date(),
        createdAt: new Date(),
        createdBy: adminPartner._id
      };
      
      const updateNotif = Notifications.insert(newDataSave);

      for (let index = 0; index < objective.length; index++) {
        const element = objective[index];
        // Bila objective belum pernah diinsert
        // masukkan data objective
        if(element.isInserted == undefined) {
          const dataInsertObj = {
            description: element.description,
            projectId: id,
            createdAt: new Date(),
            createdBy: thisUser
          }
          const insertObjective = Objective.insert(dataInsertObj)
          for (let j = 0; j < element.milestone.length; j++) {
            const element1 = element.milestone[j];
            const dataInsertMilestone = {
              description: element1.description,
              deadline: new Date(element1.deadline),
              projectId: id,
              objectiveId: insertObjective,
              createdAt: new Date(),
              createdBy: thisUser
            }
            const insertMilestone = Milestone.insert(dataInsertMilestone)
          }
        }
        // data objective sudah ada
        // data capaian tidak ada / baru maka
        else if(element.isInserted != undefined) {
          for (let j = 0; j < element.milestone.length; j++) {
            const element1 = element.milestone[j];
            if(element1.isInserted == undefined || element1.isInserted == false) {
              const dataInsertMilestone = {
                description: element1.description,
                deadline: new Date(element1.deadline),
                projectId: id,
                objectiveId: element._id,
                createdAt: new Date(),
                createdBy: thisUser
              }
              const insertMilestone = Milestone.insert(dataInsertMilestone)
            }
          }
        }
      }

      if(deleteMilestone.length > 0) {
        for (let index = 0; index < deleteMilestone.length; index++) {
          const element = deleteMilestone[index];
          const cekData = Milestone.findOne({_id: element})
          if(cekData) {
            const deleteData = Milestone.remove({_id: element})
          }
        }
      }

      if(deleteObjective.length > 0) {
        for (let index = 0; index < deleteObjective.length; index++) {
          const element = deleteObjective[index];
          const cekData = Objective.findOne({_id: element})
          if(cekData) {
            const deleteData = Objective.remove({_id: element})
            const ambilDataMilestone = Milestone.find({objectiveId: element}).fetch()
            if(ambilDataMilestone.length > 0) {
              for (let index = 0; index < ambilDataMilestone.length; index++) {
                const element1 = ambilDataMilestone[index];
                const deleteMilestone = Milestone.remove({_id: element1})
              }
            }
          }
        }
      }

      return Projects.update(
        { _id: id },
        { $set: dataSave }
      );
    },
})