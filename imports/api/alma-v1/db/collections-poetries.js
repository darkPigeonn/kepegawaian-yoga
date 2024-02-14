import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
export const Poetry = new Mongo.Collection( 'poems', { idGeneration: 'MONGO' } );

Meteor.methods({
    'uploadPoetry' : async function (data) {
      check(data, Array);

      let checkSuccess = 0;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];

        //cek title untuk slug
        const title = element.title;
        const slug = slugify(title, {
          lower:true,
          strict: true,
        })

        const outlets = ['keuskupanSby','imavi'];

        const dataSave = {
          'title' : title,
          'slug' : slug,
          'author' : element.author,
          'excerpt' : element.excerpt,
          'content' : element.content,
          'category': 'poetry',
          'outlets' : outlets,
          'publishDate' : new Date(),
          'createdAt' : new Date(),
          'createdBy' : Meteor.userId(),
          'status' : true,
          'referensi' : element.sumber,
          'status' : true,
        }

        const insert  = await Poetry.insert(dataSave);

        if (insert) {
          checkSuccess += 1;
        }
      }

      if (checkSuccess == data.length) {
        return true
      } else {
        throw new Meteor.Error(402, 'Data Gagal diuploads');
      }
    },
    'insertPoetry': function(data){
      checkAllowAccess(['cmsArticleCreate'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)

      return Poetry.insert(data)
    },
    'updatePoetry':function (data) {
      checkAllowAccess(['cmsArticleEdit'])
      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const _id = new Meteor.Collection.ObjectID(data.id)
      delete data.id
      const updateQuery = {
        $set: data
      }

      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return Poetry.update({ _id }, updateQuery);
    },
    'togglePoetry': function (data) {
      checkAllowAccess(['cmsArticleDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Article, {'_id': data.id})
      return Poetry.update({ _id },
      {
        $set: {'status': data.status}}
      )
    },
    "poetry-details": function (param) {
        const detail = Poetry.findOne({
          _id: new Meteor.Collection.ObjectID(param),
        });
        return detail;
    },
    getPoetry: function (userOutlets) {
        const $in = [];
        if (userOutlets) {
          userOutlets.forEach((element) => {
            $in.push(element);
          });
        }
        return Poetry.find({
          outlets: { $in },
        }).fetch();
    },
});