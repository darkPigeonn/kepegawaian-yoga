import { Tasks } from "./tasks";
import { Projects } from "../projects/projects";
import { Employee } from "../employee/employee";
import { Notifications } from "../notification/notification";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "tasks.getAll"(){
        return Tasks.find({id_project: {$ne: 'umum'}},{sort: {createdAt: -1}}).fetch();
    },
    "tasks.getAllUmum"(){
        // const thisUser = Meteor.userId();
        // const relatedUser = Meteor.users.findOne({
        //     _id: thisUser,
        // });
        
        // const findTasks = Tasks.find({ id_project: 'umum', "members.email": relatedUser.emails[0].address}).fetch();        
        const findTasks = Tasks.find({ id_project: 'umum'}).fetch();

        const priorityOrder = { high: 0, mid: 1, low: 2 };
        findTasks.sort((a, b) => {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            } else {
                return a.deadline - b.deadline;
            }
        });

        return findTasks;
        // return Tasks.find({id_project: 'umum'},{sort: {createdAt: -1}}).fetch();
    },
    "tasks.getThisTask"(id){
        check(id, String);
        const getTask = Tasks.findOne({_id: id});

        if (getTask.project_type != "umum") {
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
        }
        else{            
            const updatedMembers = getTask.members.map(member => {
                const employeeData = Employee.findOne({ _id: member.id });
                if (employeeData) {
                    return {
                        id: employeeData._id,
                        name: employeeData.full_name,
                        job_position: employeeData.job_position,
                        start_date: employeeData.start_date,
                        department_unit: employeeData.department_unit,
                        employment_status: employeeData.employment_status
                    };
                }
            });

            getTask.project_members = updatedMembers;
        }

        return getTask;
    },
    "tasks.getRelatedTasks"(id){
        check(id, String);

        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });

        const userRoles = relatedUser.roles || [];
        const checkRoles = ["admin", "super-admin"];
        const isAdmin = userRoles.some(role => checkRoles.includes(role));

        let findTasks = "";

        if (isAdmin) {
            findTasks = Tasks.find({ id_project: id }).fetch();

            const priorityOrder = { high: 0, mid: 1, low: 2 };
            findTasks.sort((a, b) => {
                const priorityA = priorityOrder[a.priority];
                const priorityB = priorityOrder[b.priority];
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                } else {
                    return a.deadline - b.deadline;
                }
            });
        }
        else{
            const getProject = Projects.findOne({ _id: id, id_leader: thisUser } );

            // Is Project Leader
            if (getProject) {                
                findTasks = Tasks.find({ id_project: id }).fetch();
    
                const priorityOrder = { high: 0, mid: 1, low: 2 };
                findTasks.sort((a, b) => {
                    const priorityA = priorityOrder[a.priority];
                    const priorityB = priorityOrder[b.priority];

                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    } else {
                        return a.deadline - b.deadline;
                    }
                });
            }
            else{
                const checkProject = Projects.findOne({ _id: id, "members.email": relatedUser.emails[0].address },{sort: {createdAt: -1}}) || [];
    
                // Is Project Member
                if (checkProject) {
                    // console.log(checkProject);
                    findTasks = Tasks.find({ id_project: id, "members.email": relatedUser.emails[0].address }).fetch();
    
                    const priorityOrder = { high: 0, mid: 1, low: 2 };
                    findTasks.sort((a, b) => {
                        const priorityA = priorityOrder[a.priority];
                        const priorityB = priorityOrder[b.priority];
    
                        if (priorityA !== priorityB) {
                            return priorityA - priorityB;
                        } else {
                            return a.deadline - b.deadline;
                        }
                    });
                }
            }
        }

        return findTasks;
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
    async "tasks.insert"(data) {
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

        let dataSave = "";

        if (idProject != "umum") {
            dataSave = { 
                id_project: idProject,
                nama_task: nama_tasks,
                deskripsi,
                deadline,
                priority,
                members: updatedMembers,
                id_leader: thisUser,
                createdAt: new Date(),
                createdBy: createdBy
            };
        }
        else{
            dataSave = { 
                id_project: idProject,
                nama_task: nama_tasks,
                deskripsi,
                deadline,
                priority,
                project_type: "umum",
                members: updatedMembers,
                id_leader: thisUser,
                createdAt: new Date(),
                createdBy: createdBy
            };
        }
        
        const idTask = Tasks.insert(dataSave);

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
            id_task: idTask,
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
        
        const insertNotif = Notifications.insert(newDataSave);
        for (let index = 0; index < dataNotif.length; index++) {
            const element = dataNotif[index];
            const dataUser = AppUsers.findOne({email: element.member_email });
            if(!dataUser){
                dataNotif.splice(index, 1);
            }
            else {
                newDataSave.token = []
                newDataSave.token.push(dataUser.token_fcm)
                newDataSave.title = "Tugas Baru Menanti Anda!"
                newDataSave.description = "Anda memiliki tugas baru yang ditugaskan"
            }
        }
        let runNotif = true;
        if(dataNotif.length == 0) {
            runNotif = false
        }
        if(runNotif == false) {
            return insertNotif
        }
        else {
            let postURL =
            process.env.USE_LOCAL === "true"
            ? "http://localhost:3005/imavi/"
            : "https://api.imavi.org/imavi/";
            try {
                response = HTTP.call("POST", `${postURL}notifications/create-kepegawaian`, {
                    headers: {
                    Id: Meteor.settings.APP_IDMOBILE_IMAVI,
                    Secret: Meteor.settings.APP_SECRETMOBILE_IMAVI,
                    partner: "cim"
                    },
                    data: newDataSave,
                });
                // console.log(response);
                return insertNotif
            } catch (e) {
                console.log(e);
                return insertNotif
                // throw new Meteor.Error(412, "Kirim Notifikasi ke Aplikasi Gagal")
            }
        }
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
            id_task: id,
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

        const updateTask = Notifications.insert(newDataSave);

        return Tasks.update(
            { _id: id },
            { $set: dataSave }
        );
    },

})