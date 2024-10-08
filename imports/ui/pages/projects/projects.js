import "./projects.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.projects_page.onCreated(function () {
    const self = this;

    self.projects = new ReactiveVar();
    self.filter = new ReactiveVar({
        type: '',
        data: ''
    })
    self.filterMode = new ReactiveVar("1");

    Meteor.call("projects.getAll", function (error, result) {
        if (result) {
            self.projects.set(result);
        } else {
            console.log(error);
        }
    });
});

Template.projects_page.helpers({
    projects() {
        const t = Template.instance()
        const projects = t.projects.get();
        const filter = t.filter.get()

        if (projects) {
            const result = projects.filter((x) => {
                const query = filter.data.toString().toLowerCase();

                if (filter.type == 'nama_project') {
                    return x.nama_project.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'status') {
                    return x.status.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'tanggal_mulai') {
                    const thisStartDate = x.tanggal_mulai;
                    return moment(thisStartDate).format('DD').includes(query);
                }
                if (filter.type == 'tanggal_selesai') {
                    const thisStartDate = x.tanggal_selesai;
                    return moment(thisStartDate).format('DD').includes(query);
                }
                if (filter.type == 'jumlah_member') {
                    const jumlahMember = x.members.length;
                    return jumlahMember >= query;
                }

                return true
            });
            return result
        }
        else {
            return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    },
});

Template.projects_page.events({
    "input .filter"(e, t) {
        e.preventDefault();

        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t) {
        // e.preventDefault();

        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t) {
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if (filterMode == 2) {
            t.filterMode.set("1");
        }
    }
});


Template.projects_create.onCreated(function () {
    const self = this;
    self.employee = new ReactiveVar();
    self.viewMode = new ReactiveVar("1");
    self.objective = new ReactiveVar([]);
    Meteor.call("employee.getAll", function (error, result) {
        if (result) {
            self.employee.set(result);
            // startSelect2();
        } else {
            console.log(error);
        }
    });

    self[`template-field-deskripsi`] = new ReactiveVar();
    setTimeout(() => {
        initEditor(self,
            {
                editorEl: `editor-deskripsi`,
                toolbarEl: `toolbar-container-deskripsi`,
                templateField: `template-field-deskripsi`,
            })
    }, 300);

});

Template.projects_create.onRendered(function () {
    startSelect2();
});

Template.projects_create.helpers({
    employee() {
        return Template.instance().employee.get();
    },
    viewMode() {
        return Template.instance().viewMode.get();
    },
    objective() {
        return Template.instance().objective.get();
    }
});

Template.projects_create.events({
    "click #btn_save"(e, t) {
        e.preventDefault();

        const nama_project = $("#nama_project").val();
        // const deskripsi = $("#deskripsi_project").val();
        const deskripsi = t[`template-field-deskripsi`].get().getData();
        let tanggal_mulai = $("#tanggal_mulai").val();
        let tanggal_selesai = $("#tanggal_selesai").val();
        const status = $("#select-status").val();
        const members = $("#select-member").val();
        const objective = t.objective.get();

        const employee = t.employee.get();
        const notifType = 'project';
        const messages = "Kamu telah di-daftarkan pada project baru, silahkan check web kepegawaian";

        tanggal_mulai = new Date(tanggal_mulai);
        tanggal_selesai = new Date(tanggal_selesai);

        if (tanggal_selesai > tanggal_mulai) {
            const updatedMembers = members.map((x) => {
                const thisMember = employee.find((y) => y._id == x);

                return {
                    id: thisMember._id,
                    name: thisMember.full_name,
                    email: thisMember.email_address,
                }
            });

            const data = {
                nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages, objective
            }

            Meteor.call('projects.insert', data, function (error, result) {
                if (result) {
                    Swal.fire({
                        title: "Berhasil",
                        text: "Berhasil Menambahkan Project",
                        showConfirmButton: true,
                        allowOutsideClick: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            history.back();
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Gagal",
                        text: "Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                        showConfirmButton: true,
                        allowOutsideClick: true,
                    });
                    // console.log(error);
                }
            });
        }
        else {
            Swal.fire({
                title: "Gagal",
                text: "Tanggal selesai harus lebih besar daripada tanggal mulai",
                showConfirmButton: true,
                allowOutsideClick: true,
            });
        }

    },
    "click #btn_tambah_objektif"(e, t) {
        e.preventDefault();

        const finalData = t.objective.get()
        const objektifProyek = $("#objektif_proyek").val();

        const object = {
            id: generateRandomString(7),
            name: objektifProyek,
            milestone: []
        }
        finalData.push(object);
        t.objective.set(finalData);
    },
    "click #btn_save_milestone"(e, t) {
        e.preventDefault();
        let dataObjective = t.objective.get();
        const milestoneInput = $("#milestone_proyek").val()
        const objectiveChoosen = $("#choose_objective").val()
        const deadlineMilestone = $("#milestone_deadline").val();
        for (const element of dataObjective) {
            if (element.id == objectiveChoosen) {
                element.milestone = element.milestone;
                const data = {
                    idMilestone: generateRandomString(7),
                    name: milestoneInput,
                    deadline: deadlineMilestone
                }
                element.milestone.push(data);
            }
        }
        t.objective.set(dataObjective)
    },
    "click .btn_delete_objective"(e, t) {
        e.preventDefault();
        let id = $(e.target).attr("milikObjective")
        let dataObjective = t.objective.get();
        dataObjective = dataObjective.filter(obj => obj.id !== id);
        t.objective.set(dataObjective);
    },
    "click .btn_delete_milestone"(e, t) {
        e.preventDefault();
        let idMilestone = $(e.target).attr("milikMilestone");
        let idObjective = $(e.target).attr("milikObjective");
        console.log(idMilestone, idObjective);

        // Ambil data dari ReactiveVar atau data lainnya
        let dataObjective = t.objective.get();

        // Filter data untuk menghapus milestone yang sesuai dengan idMilestone dan idObjective
        dataObjective = dataObjective.map(obj => {
            if (obj.id === idObjective) {
                return {
                    ...obj,
                    milestone: obj.milestone.filter(m => m.idMilestone !== idMilestone)
                };
            }
            return obj;
        });

        // Set dataObjective yang telah diperbarui
        t.objective.set(dataObjective);
    }

});

Template.projects_edit.onCreated(function () {
    const self = this;
    self.employee = new ReactiveVar();
    self.viewMode = new ReactiveVar("1");
    self.projects = new ReactiveVar();
    self.objective = new ReactiveVar([]);
    self.deleteObjective = new ReactiveVar([]);
    self.deleteMilestone = new ReactiveVar([]);

    const id = FlowRouter.getParam("_id");

    Meteor.call("employee.getAllEmployee", function (error, result) {
        if (result) {
            self.employee.set(result);
        } else {
            console.log(error);
        }
    });

    Meteor.call("projects.getThisProject", id, function (error, result) {
        if (result) {
            // console.log(result);
            self.projects.set(result);
            console.log(self.projects.get());
            const dataProjects = self.projects.get();
            const dataObjective = dataProjects.objective;
            for (let index = 0; index < dataObjective.length; index++) {
                const element = dataObjective[index];
                element.id = element._id
                element.isInserted = true;
                for (let j = 0; j < element.milestone.length; j++) {
                    const element1 = element.milestone[j];
                    console.log(element1);
                    element1.isInserted = true;
                    element1.idMilestone = element1._id
                }
            }
            self.objective.set(dataObjective)


        } else {
            console.log(error);
        }
    });

    self[`template-field-deskripsi`] = new ReactiveVar();
    setTimeout(() => {
        initEditor(self,
            {
                editorEl: `editor-deskripsi`,
                toolbarEl: `toolbar-container-deskripsi`,
                templateField: `template-field-deskripsi`,
                content: self.projects.get().deskripsi
            })
    }, 300);

});

Template.projects_edit.onRendered(function () {
    startSelect2();
});

Template.projects_edit.helpers({
    employee() {
        return Template.instance().employee.get();
    },
    projects() {
        return Template.instance().projects.get();
    },
    viewMode() {
        return Template.instance().viewMode.get();
    },
    isInProjectMembers(employeeId) {
        const members = Template.instance().projects.get().members;
        const projectMembers = members ? members.map(x => x.id) : [];
        return projectMembers.includes(employeeId);
    },
    objective() {
        return Template.instance().objective.get();
    },

    deleteObjective() {
        return Template.instance().deleteObjective.get();
    },
    deleteMilestone() {
        return Template.instance().deleteMilestone.get()
    }
});

Template.projects_edit.events({
    "click #btn_save"(e, t) {
        e.preventDefault();

        const nama_project = $("#nama_project").val();
        const deskripsi = t[`template-field-deskripsi`].get().getData();
        let tanggal_mulai = $("#tanggal_mulai").val();
        let tanggal_selesai = $("#tanggal_selesai").val();
        const status = $("#select-status").val();
        const members = $("#select-member").val();
        const objective = t.objective.get();
        const deleteObjective = t.deleteObjective.get()
        const deleteMilestone = t.deleteMilestone.get();


        const employee = t.employee.get();
        const notifType = 'project';
        const messages = "Kamu telah di-daftarkan pada project baru, silahkan check web kepegawaian";
        const id = FlowRouter.getParam("_id");

        tanggal_mulai = new Date(tanggal_mulai);
        tanggal_selesai = new Date(tanggal_selesai);

        if (deskripsi) {
            if (tanggal_selesai > tanggal_mulai) {
                const updatedMembers = members.map((x) => {
                    const thisMember = employee.find((y) => y._id == x);

                    return {
                        id: thisMember._id,
                        name: thisMember.full_name,
                        email: thisMember.email_address
                    }
                });

                const data = {
                    nama_project, deskripsi, tanggal_mulai, tanggal_selesai, status, updatedMembers, notifType, messages, objective
                }

                console.log(deleteObjective, deleteMilestone);
                Meteor.call('projects.update', id, data, deleteObjective, deleteMilestone, function (error, result) {
                    if (result) {
                        Swal.fire({
                            title: "Berhasil",
                            text: "Berhasil Update Project",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                history.back();
                            }
                        });
                    } else {
                        Swal.fire({
                            title: "Gagal",
                            text: "Data gagal dimasukkan, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        });
                        // console.log(error);
                    }
                });
            }
            else {
                Swal.fire({
                    title: "Gagal",
                    text: "Tanggal selesai harus lebih besar daripada tanggal mulai",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                });
            }
        }
        else {
            Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan, pastikan semua data telah terisi",
                showConfirmButton: true,
                allowOutsideClick: true,
            });
        }

    },
    "click #btn_tambah_objektif"(e, t) {
        e.preventDefault();

        const finalData = t.objective.get()
        const objektifProyek = $("#objektif_proyek").val();

        const object = {
            id: generateRandomString(7),
            description: objektifProyek,
            milestone: []
        }
        finalData.push(object);
        t.objective.set(finalData);
    },
    "click #btn_save_milestone"(e, t) {
        e.preventDefault();
        let dataObjective = t.objective.get();
        const milestoneInput = $("#milestone_proyek").val()
        const objectiveChoosen = $("#choose_objective").val()
        const deadlineMilestone = $("#milestone_deadline").val();
        for (const element of dataObjective) {
            if (element.id == objectiveChoosen) {
                element.milestone = element.milestone;
                const data = {
                    idMilestone: generateRandomString(7),
                    description: milestoneInput,
                    deadline: deadlineMilestone
                }

                element.milestone.push(data);
            }
        }
        t.objective.set(dataObjective)
        // console.log(t.objective.get());
    },
    "click .btn_delete_objective"(e, t) {
        e.preventDefault();
        let id = $(e.target).attr("milikObjective")
        let dataObjective = t.objective.get();
        dataObjective = dataObjective.filter(obj => obj.id !== id);
        let setDelete = t.deleteObjective.get();
        setDelete.push(id)
        t.objective.set(dataObjective);
        t.deleteObjective.set(setDelete);
    },
    "click .btn_delete_milestone"(e, t) {
        e.preventDefault();
        let idMilestone = $(e.target).attr("milikMilestone");
        let idObjective = $(e.target).attr("milikObjective");
        // console.log(idMilestone, idObjective);

        let setDelete = t.deleteMilestone.get();
        // Ambil data dari ReactiveVar atau data lainnya
        let dataObjective = t.objective.get();

        // Filter data untuk menghapus milestone yang sesuai dengan idMilestone dan idObjective
        dataObjective = dataObjective.map(obj => {
            if (obj.id === idObjective) {
                return {
                    ...obj,
                    milestone: obj.milestone.filter(m => m.idMilestone !== idMilestone)
                };
            }
            setDelete.push(idMilestone)
            t.deleteMilestone.set(setDelete);
            return obj;
        });
        // console.log(dataObjective);

        // Set dataObjective yang telah diperbarui
        t.objective.set(dataObjective);
    }
});


Template.projects_detail.onCreated(function () {
    const self = this;

    self.projects = new ReactiveVar();
    self.tasks = new ReactiveVar();
    self.filter = new ReactiveVar({
        type: '',
        data: ''
    })
    self.filterMode = new ReactiveVar("1");

    const id = FlowRouter.getParam("_id");

    Meteor.call("projects.getThisProject", id, function (error, result) {
        if (result) {
            self.projects.set(result);

        } else {
            console.log(error);
        }
    });

    Meteor.call("tasks.getRelatedTasks", id, function (error, result) {
        if (result) {
            // console.log(result);
            self.tasks.set(result);
        } else {
            console.log(error);
        }
    });

});

Template.projects_detail.helpers({
    thisUser() {
        return Meteor.user();
    },
    projects() {
        const t = Template.instance()
        const projects = t.projects.get();

        return projects;
    },
    tasks() {
        const t = Template.instance()
        const tasks = t.tasks.get();
        const filter = t.filter.get()

        if (tasks) {
            const result = tasks.filter((x) => {
                const query = filter.data.toString().toLowerCase();

                if (filter.type == 'nama_task') {
                    return x.nama_task.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'priority') {
                    return x.priority.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'deadline') {
                    // By Tanggal
                    // const deadline = x.deadline;
                    // return moment(deadline).format('DD').includes(query);

                    // By sisa hari
                    const deadline = x.deadline;
                    const diff = moment().diff(deadline, 'day');
                    return diff.toString().includes(query);
                }

                return true
            });

            return result
        }
        else {
            return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    },
});

Template.projects_detail.events({
    "input .filter"(e, t) {
        e.preventDefault();

        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t) {
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t) {
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if (filterMode == 2) {
            t.filterMode.set("1");
        }
    }
});

Template.projects_members.onCreated(function () {
    const self = this;

    self.projects = new ReactiveVar();
    self.employees = new ReactiveVar();
    self.filter = new ReactiveVar({
        type: '',
        data: ''
    })
    self.filterMode = new ReactiveVar("1");

    const id = FlowRouter.getParam("_id");

    Meteor.call("projects.getThisProject", id, function (error, result) {
        if (result) {
            self.projects.set(result);
        } else {
            console.log(error);
        }
    });

    Meteor.call("projects.getAllEmployeeThisProject", id, function (error, result) {
        if (result) {
            self.employees.set(result);
        } else {
            console.log(error);
        }
    });

});

Template.projects_members.helpers({
    projects() {
        const t = Template.instance()
        const projects = t.projects.get();
        return projects;
    },
    employees() {
        const t = Template.instance()
        const employee = t.employees.get();
        const filter = t.filter.get()

        if (employee) {
            const result = employee.members.flat().filter((x) => {
                const query = filter.data.toString().toLowerCase();

                if (filter.type == 'job_position') {
                    return x.job_position.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'start_date') {
                    const thisStartDate = x.start_date
                    return moment(thisStartDate).format('YYYY').includes(query);
                }
                if (filter.type == 'masa_jabatan') {
                    const thisStartDate = x.start_date;
                    const diff = moment().diff(thisStartDate, 'year');
                    return diff.toString().includes(query);
                }
                if (filter.type == 'department_unit') {
                    return x.department_unit.toString().toLowerCase().includes(query);
                }
                if (filter.type == 'full_name') {
                    return x.name.toString().toLowerCase().includes(query);
                }
                return true
            })
            return result
        }
        else {
            return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    }
});

Template.projects_members.events({
    "input .filter"(e, t) {
        e.preventDefault();

        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t) {
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t) {
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if (filterMode == 2) {
            t.filterMode.set("1");
        }
    }
});

Template.projects_objective.onCreated(function () {
    const self = this;
    self.projects = new ReactiveVar();
    self.isClickFinish = new ReactiveVar(false);
    const id = FlowRouter.getParam("_id");
    const thisUser = Meteor.user();

    Meteor.call("projects.getThisProject", id, function (error, result) {
        if (result) {
            self.projects.set(result);
            if (thisUser._id == result.createdBy) {
                self.isClickFinish.set(true);
            }
        } else {
            console.log(error);
        }
    });
})

Template.projects_objective.helpers({
    projects() {
        return Template.instance().projects.get();
    },
    isClickFinish() {
        return Template.instance().isClickFinish.get();
    },
    isFinish(code) {
        return code ? 'disabled' : '';
    }
})

Template.projects_objective.events({
    "click #btn-done"(e, t) {
        e.preventDefault();
        const id = $(e.target).attr('milik');
        console.log(id);
        Swal.fire({
            title: "Konfirmasi Target Capaian Selesai",
            text: "Apakah anda yakin melakukan penyelesaian target capaian ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if(result.isConfirmed) {
                Meteor.call("projects.milestoneAchived", id, function (error, result) {
                    if (result) {
                        Swal.fire({
                            title: "Berhasil",
                            text: "Data berhasil diubah",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        });
                        location.reload()
    
                    }
                    else {
                        console.log(error);
                        Swal.fire({
                            title: "Gagal",
                            text: "Silahkan coba lagi atau hubungi administrator",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        });
                    }
                })
            }
        })
    }
})

// startSelect2 = function () {
//     setTimeout(() => {
//       $(".select2").select2();
//     }, 300);
// };

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}