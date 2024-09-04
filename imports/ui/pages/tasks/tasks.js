import "./tasks.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { filter, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.tasks_page.onCreated(function (){
    const self = this;
    
    self.tasks = new ReactiveVar();
    self.filter = new ReactiveVar({
      type: '',
      data: ''
    })
    self.filterMode = new ReactiveVar("1");
    
    Meteor.call("tasks.getAllUmum", function (error, result) {
        if (result) {
            self.tasks.set(result);
        } else {
            console.log(error);
        }
    });
});

Template.tasks_page.helpers({
    tasks() {
        const t = Template.instance()
        const tasks = t.tasks.get();
        const filter = t.filter.get()

        if(tasks){
            const result =  tasks.filter((x) => {
                const query = filter.data.toString().toLowerCase();
                                
                if(filter.type == 'nama_task'){
                    return x.nama_task.toString().toLowerCase().includes(query);
                }
                if(filter.type == 'priority'){
                    return x.priority.toString().toLowerCase().includes(query);
                }
                if(filter.type == 'deadline'){
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
        else{
            return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    },
});

Template.tasks_page.events({
    "input .filter"(e, t){
        e.preventDefault();
        
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t){        
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t){
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if(filterMode == 2){
            t.filterMode.set("1");
        }
    }
});

Template.tasks_create.onCreated(function () {
    const self = this;
    self.projectEmployee = new ReactiveVar();
    self.employee = new ReactiveVar();
    self.projectId = new ReactiveVar(FlowRouter.getParam("_id"));

    const idProject = FlowRouter.getParam("_id");

    if (idProject != "umum") {        
        Meteor.call("projects.getAllEmployeeThisProject", idProject, function (error, result) {
            if (result) {
                self.projectEmployee.set(result);
            } else {
                console.log(error);
            }
        });
    }

    Meteor.call("employee.getAll", function (error, result) {
        if (result) {
            self.employee.set(result);
        } else {
            console.log(error);
        }
    });

    // startSelect2();

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

Template.tasks_create.onRendered(function () {
    startSelect2();
});
  
Template.tasks_create.helpers({
    projectId() {
        return Template.instance().projectId.get();
    },
    projectEmployee() {
        return Template.instance().projectEmployee.get();
    },
    employee() {
        return Template.instance().employee.get();
    },
    isUmumProject(projectId) {
        return projectId === "umum";
    }
});

Template.tasks_create.events({
    "click #btn_save"(e, t){
        e.preventDefault();
    
        const nama_tasks = $("#nama_task").val();
        const deskripsi = t[`template-field-deskripsi`].get().getData();
        let deadline = $("#deadline").val();
        const priority = $('input[name=select-priority]:checked').val();
        const members = $("#select-member").val();
        
        const idProject = t.projectId.get(); //Bisa project umum / project dengan specific id
        const notifType = 'tasks';
        const messages = "Kamu telah di-daftarkan pada task baru, silahkan check web kepegawaian";
        const employee = t.employee.get();
        
        const dateNow = new Date();
        deadline = new Date(deadline);
        
        const updatedMembers = members.map((x) => {
            const thisMember = employee.find((y) => y._id == x);

            return {
              id: thisMember._id,
              name: thisMember.full_name,
              email: thisMember.email_address
            }
        });
        
        const data = {
            idProject, nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages
        }
        
        if (deskripsi && priority) {       
            if (dateNow < deadline) {                
                Meteor.call('tasks.insert', data, function (error, result) {
                    if(result){
                        Swal.fire({
                            title: "Berhasil",
                            text: "Berhasil Menambahkan Tugas",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        }).then((result) => {
                            if(result.isConfirmed){
                                history.back();
                            }
                        });
                    }else{
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
            else{
                Swal.fire({
                    title: "Gagal",
                    text: "Data gagal diubah, tanggal tenggat waktu harus lebih besar daripada tanggal sekarang",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                });
                // console.log(error);
            }
        }
        else{
            Swal.fire({
                title: "Gagal",
                text: "Data gagal dimasukkan, pastikan semua field sudah terisi",
                showConfirmButton: true,
                allowOutsideClick: true,
            });
            // console.log(error);
        }
    },
});

Template.tasks_edit.onCreated(function () {
    const self = this;
    self.employee = new ReactiveVar();
    self.tasks = new ReactiveVar();
    self.status = new ReactiveVar();

    const idTasks = FlowRouter.getParam("_id");

    Meteor.call("tasks.getThisTask", idTasks, function (error, result) {
      if (result) {
        const flaten = result.project_members.flat();
        result.project_members = flaten;
        self.tasks.set(result);
      } else {
        console.log(error);
      }
    });

    Meteor.call("employee.getAllEmployee", function (error, result) {
        if (result) {
            self.employee.set(result);
            // startSelect2();
        } else {
            console.log(error);
        }
    });

    Meteor.call("tasks.getStatus", function (error, result) {
        if(result) {
            self.status.set(result)
        }
        else {
            console.log(error);
        }
    })

    self[`template-field-deskripsi`] = new ReactiveVar();
    setTimeout(() => {
        initEditor(self, 
            {
                editorEl: `editor-deskripsi`, 
                toolbarEl: `toolbar-container-deskripsi`,
                templateField: `template-field-deskripsi`,
                content: self.tasks.get().deskripsi
            })
    }, 300);

});

Template.tasks_edit.onRendered(function () {
    startSelect2();
});
  
Template.tasks_edit.helpers({
    employee() {
        return Template.instance().employee.get();
    },
    tasks(){
        return Template.instance().tasks.get();
    },
    isInTaskMembers(employeeId) {
        const members = Template.instance().tasks.get().members;
        const tasks_members = members ? members.map(x => x.id) : [];
        return tasks_members.includes(employeeId);
    },
    isUmumProject(projectType) {
        return projectType === "umum";
    },
    status(){
        return Template.instance().status.get();
    }
});

Template.tasks_edit.events({
    "click #btn_save"(e, t){
        e.preventDefault();
    
        const nama_tasks = $("#nama_task").val();
        const deskripsi = t[`template-field-deskripsi`].get().getData()
        let deadline = $("#deadline").val();
        const priority = $('input[name=select-priority]:checked').val();
        const members = $("#select-member").val();
        const status = $("#input_status").val();

        const employee = t.employee.get();
        const notifType = 'tasks';
        const messages = "Kamu telah di-daftarkan pada task baru, silahkan check web kepegawaian";
        const idTasks = FlowRouter.getParam("_id");
        
        const dateNow = new Date();
        deadline = new Date(deadline);
        
        const updatedMembers = members.map((x) => {
            const thisMember = employee.find((y) => y._id == x);

            return {
              id: thisMember._id,
              name: thisMember.full_name,
              email: thisMember.email_address
            }
        });
        
        const data = {
            nama_tasks, deskripsi, deadline, priority, updatedMembers, notifType, messages, status
        }
    
        if (deskripsi && priority) {  
            if (dateNow < deadline) {                
                Meteor.call('tasks.update', idTasks, data, function (error, result) {
                    if(result){
                        Swal.fire({
                            title: "Berhasil",
                            text: "Berhasil Edit Tugas",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        }).then((result) => {
                            if(result.isConfirmed){
                                history.back();
                            }
                        });
                    }else{
                        Swal.fire({
                            title: "Gagal",
                            text: "Data gagal diubah, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                            showConfirmButton: true,
                            allowOutsideClick: true,
                        });
                        // console.log(error);
                    }
                });
            }
            else{
                Swal.fire({
                    title: "Gagal",
                    text: "Data gagal diubah, tanggal tenggat waktu harus lebih besar daripada tanggal sekarang",
                    showConfirmButton: true,
                    allowOutsideClick: true,
                });
                // console.log(error);
            }
        }
        else{
            Swal.fire({
                title: "Gagal",
                text: "Data gagal diubah, cek kembali data yang dimasukkan sesuai dengan format yang seharusnya",
                showConfirmButton: true,
                allowOutsideClick: true,
            });
            // console.log(error);
        }
    },
});


Template.tasks_detail.onCreated(function () {
    const self = this;
    self.tasks = new ReactiveVar();

    const taskId = FlowRouter.getParam("_id");

    Meteor.call("tasks.getThisTask", taskId, function (error, result) {
        if (result) {
            // console.log(result);
            self.tasks.set(result);
            // startSelect2();
        } else {
            console.log(error);
        }
    });

});


Template.tasks_detail.onRendered( function() {
    startSelect2();
});

Template.tasks_detail.helpers({
    tasks() {
        return Template.instance().tasks.get();
    },
});

Template.tasks_members.onCreated(function (){
    const self = this;
    
    self.tasks = new ReactiveVar();
    self.employees = new ReactiveVar();
    self.filter = new ReactiveVar({
      type: '',
      data: ''
    })
    self.filterMode = new ReactiveVar("1");

    const id = FlowRouter.getParam("_id");
    
    Meteor.call("tasks.getThisTask", id, function (error, result) {
        if (result) {
            self.tasks.set(result);
        } else {
            console.log(error);
        }
    });
    
    Meteor.call("tasks.getAllEmployeeThisTask", id, function (error, result) {
        if (result) {
            self.employees.set(result);
        } else {
            console.log(error);
        }
    });

});

Template.tasks_members.helpers({
    tasks() {
        const t = Template.instance()
        const tasks = t.tasks.get();
        return tasks;
    },
    employees() {
        const t = Template.instance()
        const employee = t.employees.get();
        const filter = t.filter.get()
        
        if(employee){
          const result =  employee.members.flat().filter((x) => {
            const query = filter.data.toString().toLowerCase();
            
            if(filter.type == 'job_position'){
              return x.job_position.toString().toLowerCase().includes(query);
            }
            if(filter.type == 'start_date'){
              const thisStartDate = x.start_date
              return moment(thisStartDate).format('YYYY').includes(query);
            }
            if(filter.type == 'masa_jabatan'){
              const thisStartDate = x.start_date;
              const diff = moment().diff(thisStartDate, 'year');
              return diff.toString().includes(query);
            }
            if(filter.type == 'department_unit'){
              return x.department_unit.toString().toLowerCase().includes(query);
            }
            if(filter.type == 'full_name'){
              return x.name.toString().toLowerCase().includes(query);
            }
            return true
          })
          return result
        }
        else{
          return []
        }
    },
    filterMode() {
        return Template.instance().filterMode.get();
    },
});

Template.tasks_members.events({
    "input .filter"(e, t){
        e.preventDefault();
        
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "change .filter"(e, t){
        const type = $("#input_type").val();
        const data = $('#input_data').val();
        t.filter.set({
            type,
            data
        })
    },
    "click .btn-filter"(e, t){
        let filterMode = t.filterMode.get();
        if (filterMode == 1) {
            t.filterMode.set("2");
        }
        else if(filterMode == 2){
            t.filterMode.set("1");
        }
    }
});

// startSelect2 = function () {
//     setTimeout(() => {
//       $(".select2").select2();
//     }, 300);
// };