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

Template.tasks_create.onCreated(function () {
    const self = this;
    self.projectEmployee = new ReactiveVar();
    self.employee = new ReactiveVar();
    self.projectId = new ReactiveVar(FlowRouter.getParam("_id"));

    const idProject = FlowRouter.getParam("_id");

    Meteor.call("projects.getAllEmployeeThisProject", idProject, function (error, result) {
      if (result) {
        self.projectEmployee.set(result);
      } else {
        console.log(error);
      }
    });

    Meteor.call("employee.getAllEmployee", function (error, result) {
        if (result) {
            self.employee.set(result);
        } else {
            console.log(error);
        }
    });

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
    }
});

Template.tasks_create.events({
    "click #btn_save"(e, t){
        e.preventDefault();
    
        const nama_tasks = $("#nama_task").val();
        const deskripsi = $("#deskripsi_task").val();
        let deadline = $("#deadline").val();
        const priority = $("#select-priority").val();
        const members = $("#select-member").val();

        const idProject = t.projectId.get();
        const employee = t.employee.get();
        
        deadline = new Date(deadline);
        
        const updatedMembers = members.map((x) => {
            const thisMember = employee.find((y) => y._id == x);

            return {
              id: thisMember._id,
              name: thisMember.full_name
            }
        });
        
        const data = {
            idProject, nama_tasks, deskripsi, deadline, priority, updatedMembers
        }
    
        Meteor.call('tasks.insert', data, function (error, result) {
            if(result){
                Swal.fire({
                    title: "Berhasil",
                    text: "Berhasil Menambahkan Task",
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
                console.log(error);
            }
        });
    },
});


Template.tasks_detail.onCreated(function () {
    const self = this;
    self.tasks = new ReactiveVar();

    const taskId = FlowRouter.getParam("_id");

    Meteor.call("tasks.getThisTask", taskId, function (error, result) {
        if (result) {
            self.tasks.set(result);
        } else {
            console.log(error);
        }
    });

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
    }
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
        // e.preventDefault();
        
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