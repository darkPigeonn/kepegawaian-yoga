import "./assessment.html";
import "../../components/card/card";
import "../../components/tables/tables";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import moment from "moment";
import Swal from "sweetalert2";
import { start } from "@popperjs/core";
import XLSX from "xlsx";
import Papa, { parse } from 'papaparse';
import { each, filter, isEmpty, result } from "underscore";
import { HTTP } from 'meteor/http';

Template.listReflection.onCreated(function () {
    const self = this;

    self.assessment = new ReactiveVar();


})

Template.listReflection.helpers({
    assessment() {
        return reflections.find();
    }
})

Template.configAssessment.onCreated(function () {
    const self = this;

    self.config = new ReactiveVar();
    self.isOpen = new ReactiveVar(true);
    self.category = new ReactiveVar();

    Meteor.call("assessment.getCategory", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.category.set(result);
        }
    })
})

Template.configAssessment.helpers({
    assessment() {
        return Template.instance().config.get();
    },
    isOpen() {
        return Template.instance().isOpen.get();
    },
    category() {
        return Template.instance().category.get();
    }
})

Template.createCategoryAssessment.onCreated(function () {
    const self = this;

    self.category = new ReactiveVar();

    Meteor.call("assessment.getCategory", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.category.set(result);
        }
    })
})

Template.createCategoryAssessment.helpers({
    category() {
        return Template.instance().category.get();
    }
})

Template.createCategoryAssessment.events({
    "click #createCategory"(e, t) {
        e.preventDefault();
        const name = t.find("#category").value;
        Swal.fire({
            title: "Konfirmasi Buat",
            text: "Apakah anda yakin membuat kategori baru?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                Meteor.call("assessment.createCategory", name, (error, result) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(result);
                        Swal.fire({
                            title: "Berhasil",
                            text: "Kategori berhasil dibuat",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500
                        })
                        location.reload();
                    }
                })
            }
        })
    }
})

Template.createQuestionAssessment.onCreated(function () {
    const self = this;

    self.question = new ReactiveVar();
    self.viewMode = new ReactiveVar(1);

    Meteor.call("assessment.getQuestion", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.question.set(result);
        }
    })
})

Template.createQuestionAssessment.helpers({
    question() {
        return Template.instance().question.get();
    },
    viewMode() {
        return Template.instance().viewMode.get();
    }
})

Template.createQuestionAssessment.events({
    "click #saveQuestion"(e, t) {
        e.preventDefault();
        const question = t.find("#question").value;
        Swal.fire({
            title: "Konfirmasi Buat",
            text: "Apakah anda yakin membuat pertanyaan baru?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                Meteor.call("assessment.createQuestion", question, (error, result) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(result);
                        Swal.fire({
                            title: "Berhasil",
                            text: "Pertanyaan berhasil dibuat",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500
                        })
                        location.reload();
                    }
                })
            }
        })
    },
    "click #addQuestion"(e, t) {
        t.viewMode.set(2);
    },
    "click #backToList"(e, t) {
        t.viewMode.set(1);
    }
})

Template.createTemplateAssessment.onCreated(function () {
    const self = this;

    self.template = new ReactiveVar();
    self.viewMode = new ReactiveVar(1);
    self.category = new ReactiveVar();
    self.question = new ReactiveVar();
    self.temp = new ReactiveVar([]);
    self.isPilgan = new ReactiveVar(false);
    self.answers = new ReactiveVar([]);
    Meteor.call("assessment.getTemplate", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.template.set(result);
            console.log(self.template.get());
        }
    })

    Meteor.call("assessment.getCategory", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.category.set(result);
        }
    })

    Meteor.call("assessment.getQuestion", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.question.set(result);
        }
    })
})

Template.createTemplateAssessment.helpers({
    template() {
        return Template.instance().template.get();
    },
    viewMode() {
        return Template.instance().viewMode.get();
    },
    category() {
        return Template.instance().category.get();
    },
    question() {
        return Template.instance().question.get();
    },
    temp() {
        return Template.instance().temp.get();
    },
    isPilgan() {
        return Template.instance().isPilgan.get();
    },
    answers() {
        return Template.instance().answers.get();
    }
})

Template.createTemplateAssessment.events({
    "click #addTemplate"(e, t) {
        t.viewMode.set(2);
    },
    "click #backToList"(e, t) {
        t.viewMode.set(1);
    },
    "click #addToTemp"(e, t) {
        e.preventDefault();
        const name = $("#templateName").val();
        const category = $("#category").val(); // Value dari select category (misalnya ID atau kode)
        const categoryName = $("#category option:selected").text(); // Nama dari select category (misalnya nama kategori)
        const question = $("#question").val(); // Pertanyaan yang dimasukkan oleh pengguna
        const questionText = $("#question option:selected").text();

        // Buat objek pertanyaan
        const questionObj = {
            questionId: question, // Atau tambahkan properti lain seperti questionId jika diperlukan
            questionText: questionText
        };

        // Dapatkan data yang sudah ada di temp
        let temp = t.temp.get();

        // Cari apakah kategori sudah ada di temp
        const categoryIndex = temp.findIndex(item => item.categoryId === category);

        if (categoryIndex > -1) {
            // Jika kategori sudah ada, tambahkan objek pertanyaan ke array 'questions'
            temp[categoryIndex].questions.push(questionObj);
        } else {
            // Jika kategori belum ada, buat kategori baru dengan pertanyaan ini
            temp.push({
                name: name, // Isi name dengan nilai dari input 'templateName'
                categoryId: category, // Tetapkan category yang sesuai (misalnya ID atau kode)
                categoryName: categoryName, // Tambahkan nama kategori
                questions: [questionObj] // Tambahkan array of objects berisi questionObj
            });
        }
        // Set ulang temp dengan data yang baru
        t.temp.set(temp);
    },
    "click #btn-delete"(e, t) {
        e.preventDefault();
        const questionId = $(e.target).attr("milik");
        const categoryId = $(e.target).attr("categoryId");

        let temp = t.temp.get();

        temp = temp.map(category => {
            if (category.categoryId === categoryId) {
                return {
                    ...category,
                    questions: category.questions.filter(question => question.questionId !== questionId)
                };
            }
            return category;
        }).filter(category => category.questions.length > 0);

        t.temp.set(temp);
    },
    "click #saveTemplate"(e, t) {
        e.preventDefault();
        const temp = t.temp.get();
        const templateName = $("#templateName").val();
        Swal.fire({
            title: "Konfirmasi Buat",
            text: "Apakah anda yakin membuat template baru?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                Meteor.call("assessment.createTemplate", templateName, temp, (error, result) => {
                    if (error) {
                        console.log(error);
                        Swal.fire({
                            title: "Gagal",
                            text: "Gagal membuat template",
                            icon: "error",
                            showConfirmButton: false,
                            timer: 1500
                        })
                    } else {
                        console.log(result);
                        Swal.fire({
                            title: "Berhasil",
                            text: "Template berhasil dibuat",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500
                        })
                        location.reload();
                    }
                })
            }
        })
    },
    "change #select-answer-type"(e, t) {
        e.preventDefault();
        const value = $(e.target).val();
        t.isPilgan.set(value === "pilgan");
    },
    "click #addAnswer"(e, t) {
        e.preventDefault();
        const answer = t.find("#answer").value;
        let answers = t.answers.get();
        answers.push(answer);
        t.answers.set(answers);
        t.find("#answer").value = ""; // Clear input after adding
    }
})

Template.editTemplateAssessment.onCreated(function () {
    const self = this;

    self.template = new ReactiveVar();
    self.category = new ReactiveVar();
    self.question = new ReactiveVar();
    self.temp = new ReactiveVar([]);

    const id = FlowRouter.getParam("_id");

    Meteor.call("assessment.getCategory", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.category.set(result);
        }
    });

    Meteor.call("assessment.getQuestion", (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.question.set(result);
        }
    });

    Meteor.call("assessment.getTemplateById", id, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.template.set(result);
            self.temp.set(result.questions);
        }
    });
});

Template.editTemplateAssessment.helpers({
    template() {
        return Template.instance().template.get();
    },
    category() {
        return Template.instance().category.get();
    },
    question() {
        return Template.instance().question.get();
    },
    temp() {
        return Template.instance().temp.get();
    }
});

Template.editTemplateAssessment.events({
    "click #addToTemp"(e, t) {
        e.preventDefault();
        const name = $("#templateName").val();
        const category = $("#category").val();
        const categoryName = $("#category option:selected").text();
        const question = $("#question").val();
        const questionText = $("#question option:selected").text();

        const questionObj = {
            questionId: question,
            questionText: questionText
        };

        let temp = t.temp.get();

        const categoryIndex = temp.findIndex(item => item.categoryId === category);

        if (categoryIndex > -1) {
            temp[categoryIndex].questions.push(questionObj);
        } else {
            temp.push({
                name: name,
                categoryId: category,
                categoryName: categoryName,
                questions: [questionObj]
            });
        }
        t.temp.set(temp);
    },
    "click #btn-delete"(e, t) {
        e.preventDefault();
        const questionId = $(e.target).attr("milik");
        const categoryId = $(e.target).attr("categoryId");

        let temp = t.temp.get();

        temp = temp.map(category => {
            if (category.categoryId === categoryId) {
                return {
                    ...category,
                    questions: category.questions.filter(question => question.questionId !== questionId)
                };
            }
            return category;
        }).filter(category => category.questions.length > 0);

        t.temp.set(temp);
    },
    "click #saveTemplate"(e, t) {
        e.preventDefault();
        const temp = t.temp.get();
        const id = FlowRouter.getParam("_id");
        const templateName = $("#templateName").val();

        Swal.fire({
            title: "Konfirmasi Ubah",
            text: "Apakah anda yakin mengubah template ini?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                Meteor.call("assessment.updateTemplate", id, templateName, temp, (error, result) => {
                    if (error) {
                        console.log(error);
                        Swal.fire({
                            title: "Gagal",
                            text: "Gagal mengubah template",
                            icon: "error",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    } else {
                        console.log(result);
                        Swal.fire({
                            title: "Berhasil",
                            text: "Template berhasil diubah",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        FlowRouter.go('/assessment/create/template');
                    }
                });
            }
        });
    }
});

Template.detailTemplateAssessment.onCreated(function () {
    const self = this;

    self.template = new ReactiveVar();

    const id = FlowRouter.getParam("_id");

    Meteor.call("assessment.getTemplateById", id, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            self.template.set(result);
        }
    });
})

Template.detailTemplateAssessment.helpers({
    template() {
        return Template.instance().template.get();
    }
});
