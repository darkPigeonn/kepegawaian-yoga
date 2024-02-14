import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
export const Quiz = new Mongo.Collection( 'landingQuiz');

Meteor.methods({
    'quiz-details': function(_id){
        return Quiz.findOne({_id})
    },
    'quiz-insert': function(data){
        return Quiz.insert(data)
    },
    'quiz-update':function (data) {
        const _id = data.id
        delete data.id
        const updateQuery = {
            $set: data
        }

        if(data.imageLink !== ''){
            updateQuery.$unset = {
                ireImageLink: ''
            }
        }
        return Quiz.update({ _id }, updateQuery);
    },
})