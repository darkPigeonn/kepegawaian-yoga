import "./announcement.html";
import _, { functions, result, template } from "underscore";
import DataTable from "datatables.net-dt";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";

Template.listAnnouncements.onCreated(function () {
    const self = this;
    self.dataAnnouncements = new ReactiveVar();
    Meteor.call("announcement.getAll", function(error, result) {
        if(result) {
            self.dataAnnouncements.set(result)
        }
        else {
            console.log(error);
        }
    })
})

Template.listAnnouncements.helpers({
    dataAnnouncements() {
        return Template.instance().dataAnnouncements.get();
    }
})

Template.createAnnouncements.onCreated(function () {
    const self = this;
    self.type = new ReactiveVar();
    self.project = new ReactiveVar();
    self.department = new ReactiveVar();
    self.editorContent = new ReactiveVar();
    self.buktiSurat = new ReactiveVar([]);
    this.optionsContent = {
        editorEl: "editorContent",
        toolbarEl: "toolbar-containerContent",
        templateField: "editorContent"
    };
    Meteor.call("projects.getAll", function(error, result) {
        if(result) {
            self.project.set(result)
            console.log(result);
        }
        else{
            console.log(error);
        }
    })
    Meteor.call("departement.getAll", function(error, result) {
        if(result) {
            self.department.set(result)
            console.log(result);
        }
        else {
            console.log(error);
        }
    })
    startSelect2();
})

Template.createAnnouncements.onRendered(function () {
    const context = this;
    initEditor(Template.instance(), this.optionsContent)
})

Template.createAnnouncements.helpers({
    type() {
        return Template.instance().type.get();
    },
    project() {
        return Template.instance().project.get();
    },
    department() {
        return Template.instance().department.get();
    },
    buktiSurat() {
        return Template.instance().buktiSurat.get();
    }
})

Template.createAnnouncements.events({
    "click #btn_save"(e, t) {
        e.preventDefault();
        const title = $("#title").val();
        const idProject = $("#select-project").val();
        const idDepartment = $("#select-department").val();
        const content = t.editorContent.get().getData();
        const publishDate = $("#publishDate").val();
        const endDate = $("#endDate").val();
        const files = t.buktiSurat.get();
        const type = $("#select-type").val();
        Swal.fire({
            title: "Konfirmasi",
            text: "Apakah anda ingin menyimpan data ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal"
        }).then(async(result) => {
            if(result.isConfirmed) {
                const thisForm = {};
                thisForm[files] = [];
                for (let index = 0; index < files.length; index++) {
                    const fileName = files[index].file.name;
                    const uploadData = {
                      fileName: "kepegawaian/surat-peringatan/" + fileName,
                      type: "image/png",
                      Body: files[index].file
                    }
                    const linkUpload = await uploadFiles(uploadData);
                    thisForm[files].push(
                    {
                      name: files[index].file.name,
                      link: linkUpload
                    });
                }
                const linksBukti = thisForm[files];
                const data = {
                    title,
                    idProject,
                    idDepartment,
                    content,
                    publishDate,
                    endDate,
                    links: linksBukti,
                    type
                }
                Meteor.call("announcement.create", data, function(error, result) {
                    if(result) {
                        successAlert("Pengumuman berhasil dibuat")
                        location.reload()
                    }
                    else{
                        console.log(error);
                        failAlert(error)
                    }
                })
            }
        })
    },
    "change #select-type"(e, t) {
        const value = $("#select-type").val();
        t.type.set(parseInt(value));
    },
    "change #buktiSurat": function (e, t) {
        const buktiSurat = t.buktiSurat.get();
        const files = $("#buktiSurat").prop("files");
        for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file) {
            const reader = new FileReader();
            const body = {
            file: file,
            };
            reader.addEventListener("load", function () {
            body.src = this.result;
            if (file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
                $(`#buktiSurat-${buktiSurat.length - 1}`).attr(
                "href",
                this.result
                );
            }
            });
            reader.readAsDataURL(file);
            buktiSurat.push(body);
            t.buktiSurat.set(buktiSurat);
        }
        }
    },
    "click .remove-buktiSurat": function (e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        const buktiSurat = t.buktiSurat.get();
        buktiSurat.splice(parseInt(index), 1);
        t.buktiSurat.set(buktiSurat);
    },
})

Template.editAnnouncements.onCreated(function () {
    const self = this;
    self.type = new ReactiveVar();
    self.project = new ReactiveVar();
    self.department = new ReactiveVar();
    self.editorContent = new ReactiveVar();
    self.buktiSurat = new ReactiveVar([]);
    self.dataAnnouncement = new ReactiveVar();
    this.optionsContent = {
        editorEl: "editorContent",
        toolbarEl: "toolbar-containerContent",
        templateField: "editorContent"
    };
    Meteor.call("projects.getAll", function(error, result) {
        if(result) {
            self.project.set(result)
        }
        else{
            console.log(error);
        }
    })
    Meteor.call("departement.getAll", function(error, result) {
        if(result) {
            self.department.set(result)
        }
        else {
            console.log(error);
        }
    })
    const id = FlowRouter.getParam("id");
    Meteor.call("announcement.getDetail", id, function(error, result) {
        if(result) {
            self.dataAnnouncement.set(result)
            self.type.set(result.type)
        }
        else {
            console.log(error);
        }
    })
    startSelect2();
})

Template.editAnnouncements.helpers({
    type() {
        return Template.instance().type.get();
    },
    project() {
        return Template.instance().project.get();
    },
    department() {
        return Template.instance().department.get();
    },
    buktiSurat() {
        return Template.instance().buktiSurat.get();
    },
    dataAnnouncement() {
        return Template.instance().dataAnnouncement.get();
    }
})

Template.editAnnouncements.onRendered(function (){
    const context = this;
    const template = Template.instance();
    const id = FlowRouter.getParam("id");
    Meteor.call("announcement.getDetail", id, function(error, result) {
        if(result) {
            context.optionsContent.content = result.content
            initEditor(template, context.optionsContent)
        }
        else {
            console.log(error);
            
        }
    })
})

Template.editAnnouncements.events({
    "change #select-type"(e, t) {
        const value = $("#select-type").val();
        t.type.set(parseInt(value));
    },
    "change #buktiSurat": function (e, t) {
        const buktiSurat = t.buktiSurat.get();
        const files = $("#buktiSurat").prop("files");
        for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file) {
            const reader = new FileReader();
            const body = {
            file: file,
            };
            reader.addEventListener("load", function () {
            body.src = this.result;
            if (file.type != ".png" || file.type != ".jpg" || file.type != ".jpeg") {
                $(`#buktiSurat-${buktiSurat.length - 1}`).attr(
                "href",
                this.result
                );
            }
            });
            reader.readAsDataURL(file);
            buktiSurat.push(body);
            t.buktiSurat.set(buktiSurat);
        }
        }
    },
    "click .remove-buktiSurat": function (e, t) {
        e.preventDefault();
        const index = $(e.target).attr("milik");
        const buktiSurat = t.buktiSurat.get();
        buktiSurat.splice(parseInt(index), 1);
        t.buktiSurat.set(buktiSurat);
    },
    "click #btn_save"(e, t) {
        e.preventDefault();
        const title = $("#title").val();
        const idProject = $("#select-project").val();
        const idDepartment = $("#select-department").val();
        const content = t.editorContent.get().getData();
        const publishDate = $("#publishDate").val();
        const endDate = $("#endDate").val();
        const files = t.buktiSurat.get();
        const type = $("#select-type").val();
        Swal.fire({
            title: "Konfirmasi",
            text: "Apakah anda ingin menyimpan data ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal"
        }).then(async(result) => {
            if(result.isConfirmed) {
                const thisForm = {};
                thisForm[files] = [];
                for (let index = 0; index < files.length; index++) {
                    const fileName = files[index].file.name;
                    const uploadData = {
                      fileName: "kepegawaian/surat-peringatan/" + fileName,
                      type: "image/png",
                      Body: files[index].file
                    }
                    const linkUpload = await uploadFiles(uploadData);
                    thisForm[files].push(
                    {
                      name: files[index].file.name,
                      link: linkUpload
                    });
                }
                const linksBukti = thisForm[files];
                const id = FlowRouter.getParam("id");
                const data = {
                    title,
                    idProject,
                    idDepartment,
                    content,
                    publishDate,
                    endDate,
                    links: linksBukti,
                    type
                }
                Meteor.call("announcement.edit", data, id, function(error, result) {
                    if(result) {
                        successAlert("Pengumuman berhasil diubah")
                        location.reload()
                    }
                    else{
                        console.log(error);
                        failAlert(error)
                    }
                })
            }
        })
    },
})

Template.detailAnnouncements.onCreated(function() {
    const self = this;
    self.dataAnnouncement = new ReactiveVar();
    const id = FlowRouter.getParam("id")
    Meteor.call("announcement.getDetail", id, function(error, result) {
        if(result) {
            console.log(result);
            self.dataAnnouncement.set(result)
        }
        else {
            console.log(error);
            
        }
    })
})

Template.detailAnnouncements.helpers({
    dataAnnouncement() {
        return Template.instance().dataAnnouncement.get();
    }
})