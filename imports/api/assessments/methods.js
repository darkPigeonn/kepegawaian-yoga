import { Reflections, ConfigReflections, Category, Question, TemplateReflection } from "./assessments";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
import _, { result } from 'underscore';

Meteor.methods({
    async "assessment.getConfig"() {
        return ConfigReflections.find().fetch();
    },
    async "assessment.getCategory"() {
        return Category.find({ type: "assessment" }).fetch();
    },
    async "assessment.createCategory"(name) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const data = {
            name: name,
            type: "assessment",
            createdBy: adminPartner.profileId,
            createdByName: adminPartner.fullname,
            createdAt: new Date()
        }
        return Category.insert(data);
    },
    async "assessment.getQuestion"() {
        return Question.find({ type: "assessment" }).fetch();
    },
    async "assessment.createQuestion"(question) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const data = {
            content: question,
            type: "assessment",
            createdBy: adminPartner.profileId,
            createdByName: adminPartner.fullname,
            createdAt: new Date()
        }
        return Question.insert(data);
    },
    async "assessment.getTemplate"() {
        return TemplateReflection.find().fetch();
    },
    async "assessment.createTemplate"(name, data) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const categories = Category.find({ type: "assessment" }).fetch();
        let dataQuestions = data.map(data => {
            // Cari nama kategori berdasarkan categoryId
            const category = categories.find(cat => cat._id === data.categoryId);

            return {
                categoryId: data.categoryId,
                categoryName: category ? category.name : null, // Jika kategori tidak ditemukan, null
                questions: data.questions.map(question => ({
                    questionId: question.questionId,
                    questionText: question.questionText
                }))
            };
        });

        const post = {
            name: name,
            questions: dataQuestions,
            createdAt: new Date(),
            partner: adminPartner.partners[0],
            createdBy: adminPartner.profileId ?? adminPartner._id,
            createdByName: adminPartner.fullname,
        }
        return TemplateReflection.insert(post);
    },
    async "assessment.getTemplateById"(id) {
        return TemplateReflection.findOne({ _id: id });
    },
    async "assessment.updateTemplate"(id, name, data) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });

        const categories = Category.find({ type: "assessment" }).fetch();

        let dataQuestions = data.map(item => {
            const category = categories.find(cat => cat._id === item.categoryId);
            return {
                categoryId: item.categoryId,
                categoryName: category ? category.name : null,
                questions: item.questions.map(question => ({
                    questionId: question.questionId,
                    questionText: question.questionText
                }))
            };
        });

        const updateData = {
            name: name,
            questions: dataQuestions,
        };

        return TemplateReflection.update({ _id: id }, { $set: updateData });
    },
})


