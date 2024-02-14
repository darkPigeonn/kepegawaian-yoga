import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import slugify from 'slugify';
export const Songs = new Mongo.Collection( 'songs', { idGeneration: 'MONGO' } );

Meteor.methods({
    'insertSong': function(data){
      return Songs.insert(data)
    },
    'uploadSong' : async function (data) {
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

        const outlets = ['imavi'];

        const dataSave = {
          'title' : title,
          'slug' : slug,
          'author' : '-',
          'referensi' : data.sumber,
          'outlets' : outlets,
          'status' : true,
          'content' : data.content,
          'createdAt' : new Date(),
          'createdBy' : Meteor.userId()
        }

        const insert  = await Songs.insert(dataSave);

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
    'updateSong':function (data) {

      // karena ada input outlet dari form maka perlu dicek juga
      // checkOutletByInput(data.outlets)
      // memeriksa apakah diizinkan untuk update outlet ini berdasarkan
      // outlet yang diinput sebelumnya?
      const _id = new Meteor.Collection.ObjectID(data.id)
      delete data.id
      // checkOutletByCol(Song, { _id })
      const updateQuery = {
        $set: data
      }
      if(data.imageLink !== ''){
        updateQuery.$unset = {
          fireImageLink: ''
        }
      }
      return Songs.update({ _id }, updateQuery);
    },
    'toggleSong': function (data) {
      checkAllowAccess(['cmsSongDelete'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      // checkOutletByInput(data.outlets)
      // checkOutletByCol(Song, {'_id': data.id})
      return Songs.update({ _id },
      {$set: {'status': data.status}}
      )
    },
    'featuredSong': function (data) {
      checkAllowAccess(['cmsSongFeatured'])
      const _id = new Meteor.Collection.ObjectID(data.id)
      const update = Songs.update({ _id },
        {$set: {'featured': data.status}}
      )
      return update
    },
    'getSongById': function (id) {
      const _id = new Meteor.Collection.ObjectID(id)
      return Songs.findOne({
        '_id' : _id
      });
    },
    'getSongs': function(){

      return Songs.find().fetch();
    }
});