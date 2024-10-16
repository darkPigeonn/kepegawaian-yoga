import { Reflections, ConfigReflections, Category, Question, TemplateReflection } from "./reflections";
import { check } from "meteor/check";
import moment from "moment";
import { Employee } from "../employee/employee";
import _, { result } from 'underscore';

Meteor.methods({
    async "reflection.getConfig"() {
        return ConfigReflections.find().fetch();
    },
    async "reflection.getCategory"() {
        return Category.find({type: "reflection"}).fetch();
    },
    async "reflection.createCategory"(name) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const data = {
            name: name,
            type: "reflection",
            createdBy: adminPartner.profileId,
            createdByName: adminPartner.fullname,
            createdAt: new Date()
        }
        return Category.insert(data);
    },
    async "reflection.getQuestion"() {
        return Question.find({type: "reflection"}).fetch();
    },
    async "reflection.createQuestion"(question) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const data = {
            content: question,
            type: "reflection",
            createdBy: adminPartner.profileId,
            createdByName: adminPartner.fullname,
            createdAt: new Date()
        }
        return Question.insert(data);
    },
    async "reflection.getTemplate"() {
        return TemplateReflection.find().fetch();
    },
    async "reflection.createTemplate"(name, data) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        const categories = Category.find({type: "reflection"}).fetch();
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
    async "reflection.getTemplateById"(id) {
        return TemplateReflection.findOne({_id: id});
    },
    async "reflection.updateTemplate"(id, name, data) {
        const thisUser = Meteor.userId();
        const adminPartner = Meteor.users.findOne({
            _id: thisUser,
        });
        
        const categories = Category.find({type: "reflection"}).fetch();
        
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
        
        return TemplateReflection.update({_id: id}, {$set: updateData});
    },
})


