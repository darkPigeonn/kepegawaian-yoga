import { Tasks, Events, Status } from "./tasks";
import { Projects } from "../projects/projects";
import { Employee } from "../employee/employee";
import { Notifications } from "../notification/notification";
import { AppProfiles, AppUsers } from "../collections-profiles.js";
import { check } from "meteor/check";
import moment from "moment";
// import { ObjectId } from 'mongodb';

Meteor.methods({
    "events.thisWeek"(){
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const todayEvents = Events.find({
            date: {
                $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
        }).fetch();

        const weekEvents = Events.find({
            date: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        }).fetch();
        return {todayEvents, weekEvents}
    },
    "tasks.getAll"(){
        return Tasks.find({id_project: {$ne: 'umum'}},{sort: {createdAt: -1}}).fetch();
    },
    "tasks.getToday"(){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });

        if (relatedUser.roles[0] === "admin"){
            const today = new Date();

            const findTasks = Tasks.find({partner: "imavi", deadline: today}).fetch();
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
            return findTasks
        } else {
            throw new Meteor.Error(404, "Anda tidak memiliki akses");
        }
        
    },
    "tasks.getAllUmum"(){
        const thisUser = Meteor.userId();
        const relatedUser = Meteor.users.findOne({
            _id: thisUser,
        });
        // ADMIN DAPAT MELIHAT SEMUA TASK YANG ADA
        if(relatedUser.roles[0] == "admin"){
            const findTasks = Tasks.find({partner: relatedUser.partners[0]}).fetch();

            for (let index = 0; index < findTasks.length; index++) {
                const element = findTasks[index];
                const dataStatus = Status.findOne({id: element.status})
                element.status = dataStatus.label
            }

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
        }
        else {
            const dataEmployee = Employee.findOne({_id: relatedUser.profileId})
            const findTasks = Tasks.find({members: {
                $elemMatch: {
                    id: dataEmployee._id
                }
            }}).fetch();

            for (let index = 0; index < findTasks.length; index++) {
                const element = findTasks[index];
                const dataStatus = Status.findOne({id: element.status})
                if(dataStatus) {
                    element.status = dataStatus.label
                }
                else {
                    element.status = "Belum Dimulai"
                }
            }

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
        }    
        
    },
    "tasks.getThisTask"(id){
        check(id, String);
        const getTask = Tasks.findOne({_id: id});
        console.log(getTask);
        
        if (getTask.id_project != "umum") {
            const getProject = Projects.findOne({_id: getTask.id_project});
            getTask.nama_project = getProject.nama_project;
            getTask.project_members = getProject.members;
            const getStatus = Status.findOne({id: getTask.status});
            if(getStatus) {
                getTask.status = getStatus.label
            }
            else {
                getTask.status = "Belum Dikerjakan"
            }
            
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
            const getStatus = Status.findOne({id: getTask.status});
            if(getStatus) {
                getTask.status = getStatus.label
            }
            else {
                getTask.status = "Belum Dikerjakan"
            }
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
        let { idProject, nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages, idObjective, idMilestone } = data
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
        
        createdBy = adminPartner.fullname ?? adminPartner.fullName;
        //Masukkan data pembuat ke members nya juga
        updatedMembers.push({
            id: adminPartner.profileId,
            name: adminPartner.fullName ?? adminPartner.fullname,
            email: adminPartner.username,
        })

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
                idObjective,
                idMilestone,
                partner: adminPartner.partners[0],
                status: 0,
                createdAt: new Date(),
                createdBy: createdBy,
                timeline: [
                    {
                        event: "created",
                        operator: thisUser,
                        operatorName: createdBy,
                        timestamp: new Date()

                    }
                ]
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
                partner: adminPartner.partners[0],
                status: 0,
                createdAt: new Date(),
                createdBy: createdBy,
                timeline: [
                    {
                        event: "created",
                        operator: thisUser,
                        operatorName: createdBy,
                        timestamp: new Date()

                    }
                ]
            };
        }
        
        const idTask = Tasks.insert(dataSave);

        // Notification
        const dataNotif = updatedMembers
        .map(x => ({
            member_id: x.id,
            member_name: x.name,
            member_email: x.email,
        }))
        .filter(notif => notif.member_id !== adminPartner.profileId);

        for (let index = 0; index < dataNotif.length; index++) {
            const element = dataNotif[index];
            const newDataSave = { 
              timestamp: new Date(),
              senderId: adminPartner.profileId,
              receiverId: element.member_id,
              message: `Anda di assign ke dalam tugas ${nama_tasks}`,
              categoryId: 20,
              categoryName: "Task",
              createdAt: new Date(),
              createdBy: adminPartner.profileId,
              actionLink: `/tasks/detail/${idTask}`
            };
            Notifications.insert(newDataSave);
        }
        const body = {
            id_task: idTask,
            // token, dari luar
            senderId: adminPartner._id,
            // receiverId, dari luar
            type: "task",
            id_task: idTask
        }
        
        body.token = []
        body.receiverId = [];
        for (let index = 0; index < dataNotif.length; index++) {
            const element = dataNotif[index];
            const dataUser = AppUsers.findOne({profileId: element.member_id });
            if(!dataUser){
                dataNotif.splice(index, 1);
            }
            else {
                if(dataUser.token_fcm) {
                    body.token.push(dataUser.token_fcm)
                    body.receiverId.push(dataUser.profileId)
                }
                body.title = "Tugas Baru Menanti Anda!"
                body.description = "Anda memiliki tugas baru yang ditugaskan"
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
            Meteor.settings.USE_LOCAL === "true"
            ? "http://localhost:3005/imavi/"
            : "https://api.imavi.org/imavi/";
            try {
                response = HTTP.call("POST", `${postURL}notifications/create-kepegawaian`, {
                    headers: {
                    Id: Meteor.settings.APP_IDMOBILE_IMAVI,
                    Secret: Meteor.settings.APP_SECRETMOBILE_IMAVI,
                    partner: "cim"
                    },
                    data: body,
                });
                // console.log(response);
                return idTask
            } catch (e) {
                console.log(e);
                return idTask
                // throw new Meteor.Error(412, "Kirim Notifikasi ke Aplikasi Gagal")
            }
        }
    },
    "tasks.update"(id, data) {
        let { nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages, status, idObjective, idMilestone } = data
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
        updatedBy = adminPartner.fullname ?? adminPartner.fullName;
        status = parseInt(status)
        const timeline =
        {
            event: "edited",
            operator: thisUser,
            operatorName: updatedBy,
            timestamp: new Date()

        }
        const dataSave = { 
            nama_task: nama_tasks,
            deskripsi,
            deadline,
            priority,
            status,
            members: updatedMembers
        };
        if(idObjective != undefined) {
            dataSave.idObjective = idObjective
        }
        if(idMilestone != undefined) {
            dataSave.idMilestone = idMilestone
        }

        const idTask = Tasks.update(
            { _id: id },
            { $set: dataSave, $push: {timeline: timeline} }
        );
        
        // Notification
        const dataNotif = updatedMembers
        .map(x => ({
            member_id: x.id,
            member_name: x.name,
            member_email: x.email,
        }))
        .filter(notif => notif.member_id !== adminPartner.profileId);

        for (let index = 0; index < dataNotif.length; index++) {
            const element = dataNotif[index];
            const newDataSave = { 
              timestamp: new Date(),
              senderId: adminPartner.profileId,
              receiverId: element.member_id,
              message: `Ada perubahan data atau status pada tugas ${nama_tasks}`,
              categoryId: 20,
              categoryName: "Task",
              createdAt: new Date(),
              createdBy: adminPartner.profileId,
              actionLink: `/tasks/detail/${id}`
            };
            Notifications.insert(newDataSave);
        }

        return idTask
    },
    "tasks.getStatus"() {
        return Status.find({type: "task"}).fetch();
    }

})