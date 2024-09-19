import { Announcements } from "./announcement";
// import { Roles } from "./roles"
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import slugify from "slugify";
import { Projects } from "../projects/projects";
import { Notifications } from "../notification/notification";
import { Employee } from "../employee/employee";
import { Departement } from "../departement/departement";

Meteor.methods({
    "announcement.getAll"() {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        if(adminPartner.roles[0] == "admin" || adminPartner.roles[0] == "chief") {
            return Announcements.find().fetch();
        }
        const currentDate = new Date();
        const relatedEmployee = Employee.findOne({_id: adminPartner.profileId})
        const departmentId = relatedEmployee.departmentId ?? "";
        const projects = Projects.find({"members.id": relatedEmployee._id}).fetch()
        let arrProjects = [];
        for (let index = 0; index < projects.length; index++) {
            const element = projects[index];
            arrProjects.push(element._id)
        }
        console.log(arrProjects);
        
        const announcements = Announcements.find({
            $and: [
                { publishDate: { $lte: currentDate } },  // publishDate <= currentDate
                { endDate: { $gte: currentDate } },      // endDate >= currentDate
                {
                    $or: [
                        { type: 1 },                            // Pengumuman dengan type = 1
                        { departmentId: departmentId },         // Pengumuman yang terhubung dengan departmentId
                        { projectId: { $in: arrProjects } }     // Pengumuman yang terhubung dengan salah satu projectId
                    ]
                }
            ]
        }, {
            sort: { publishDate: -1 }  // Urutkan berdasarkan publishDate terbaru di awal
        }).fetch();
        return announcements;
    },
    "announcement.create"(data) {
        let {title, idProject, idDepartment, content, publishDate, endDate, links, type} = data;
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const relatedEmployee = Employee.findOne({_id: adminPartner.profileId});
        let datePublish = new Date(publishDate);
        let dateEnd = new Date(endDate);
        datePublish.setUTCDate(datePublish.getUTCDate() - 1);
        datePublish.setUTCHours(17, 0, 0, 0);
        dateEnd.setUTCHours(17, 0, 0, 0);
        type = parseInt(type)
        if(adminPartner.roles[0] == "admin" || adminPartner.roles[0] == "chief") {
            if(type == 1) {
                const slug = slugify(title, {
                    lower: true,
                    strict: true,
                });
                const dataSave = {
                    title,
                    slug,
                    excerpt: "",
                    author: adminPartner.full_name ?? adminPartner.fullName ?? adminPartner.fullname ?? "-",
                    content,
                    publishDate: datePublish,
                    endDate: dateEnd,
                    status: true,
                    links,
                    type,
                    outlets: "imavi",
                    createdAt: new Date(),
                    createdBy: adminPartner._id
                }
                const insert = Announcements.insert(dataSave)
                let partnerCode;
                if(adminPartner.partners){
                    partnerCode = adminPartner.partners[0];
                  }
                const dataEmployee = Employee.find({status: 10, statusDelete: 0, partnerCode: partnerCode }).fetch();
                for (let index = 0; index < dataEmployee.length; index++) {
                    const element = dataEmployee[index];
                    const dataNotification = {
                        timestamp: new Date(),
                        senderId: adminPartner._id,
                        receiverId: element._id,
                        message: `Terdapat pengumuman baru untuk anda`,
                        categoryId: 40,
                        categoryName: "Announcement",
                        createdAt: new Date(),
                        createdBy: adminPartner._id,
                        actionLink: `/announcements/detail/${insert}`
                    }
                    Notifications.insert(dataNotification)
                }
                return true
            }
            else if(type == 3) {
                const slug = slugify(title, {
                    lower: true,
                    strict: true,
                });
                for (let index = 0; index < idProject.length; index++) {
                    const element = idProject[index];
                    const dataSave = {
                        title,
                        slug,
                        excerpt: "",
                        author: adminPartner.full_name ?? adminPartner.fullName ?? adminPartner.fullname ?? "-",
                        content,
                        publishDate: datePublish,
                        endDate: dateEnd,
                        status: true,
                        links,
                        projectId: element,
                        type,
                        outlets: "imavi",
                        createdAt: new Date(),
                        createdBy: adminPartner._id
                    }
                    const insert = Announcements.insert(dataSave)
                    const dataProject = Projects.findOne({_id: element})
                    for (let j = 0; j < dataProject.members.length; j++) {
                        const element = dataProject.members[j];
                        const dataNotification = {
                            timestamp: new Date(),
                            senderId: adminPartner._id,
                            receiverId: element.id,
                            message: `Terdapat pengumuman baru untuk anda`,
                            categoryId: 40,
                            categoryName: "Announcement",
                            createdAt: new Date(),
                            createdBy: adminPartner._id,
                            actionLink: `/announcements/detail/${insert}`
                        }
                        Notifications.insert(dataNotification)
                    }
                }
                return true
            }
            else if(type == 2) {
                const slug = slugify(title, {
                    lower: true,
                    strict: true,
                });
                for (let index = 0; index < idDepartment.length; index++) {
                    const element = idDepartment[index];
                    const dataSave = {
                        title,
                        slug,
                        excerpt: "",
                        author: adminPartner.full_name ?? adminPartner.fullName ?? adminPartner.fullname ?? "-",
                        content,
                        publishDate: datePublish,
                        endDate: dateEnd,
                        status: true,
                        links,
                        departmentId: element,
                        type,
                        outlets: "imavi",
                        createdAt: new Date(),
                        createdBy: adminPartner._id
                    }
                    const insert = Announcements.insert(dataSave)
                    const dataMemberDepartment = Employee.find({departmentId: element})
                    for (let j = 0; j < dataMemberDepartment.length; j++) {
                        const element = dataMemberDepartment[j];
                        const dataNotification = {
                            timestamp: new Date(),
                            senderId: adminPartner._id,
                            receiverId: element._id,
                            message: `Terdapat pengumuman baru untuk anda`,
                            categoryId: 40,
                            categoryName: "Announcement",
                            createdAt: new Date(),
                            createdBy: adminPartner._id,
                            actionLink: `/announcements/detail/${insert}`
                        }
                        Notifications.insert(dataNotification)
                    }
                }
                return true
            }
        }
        else if(adminPartner.roles[0] == "staff") {
            const slug = slugify(title, {
                lower: true,
                strict: true,
            });
            for (let index = 0; index < idProject.length; index++) {
                const element = idProject[index];
                const dataSave = {
                    title,
                    slug,
                    excerpt: "",
                    author: relatedEmployee.full_name ?? relatedEmployee.fullName ?? relatedEmployee.fullname ?? "-",
                    content,
                    publishDate: datePublish,
                    endDate: dateEnd,
                    status: true,
                    links,
                    projectId: element,
                    type: 3,
                    outlets: "imavi",
                    createdAt: new Date(),
                    createdBy: relatedEmployee._id
                }
                const insert = Announcements.insert(dataSave)
                const dataProject = Projects.findOne({_id: element})
                for (let j = 0; j < dataProject.members.length; j++) {
                    const element = dataProject.members[j];
                    if(element.id == relatedEmployee._id) {
                        continue
                    }
                    else {
                        const dataNotification = {
                            timestamp: new Date(),
                            senderId: relatedEmployee._id,
                            receiverId: element.id,
                            message: `Terdapat pengumuman baru untuk anda`,
                            categoryId: 40,
                            categoryName: "Announcement",
                            createdAt: new Date(),
                            createdBy: relatedEmployee._id,
                            actionLink: `/announcements/detail/${insert}`
                        }
                        Notifications.insert(dataNotification)
                    }
                }
            }
            return true
        }
    }
})