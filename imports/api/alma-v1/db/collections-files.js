import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from "moment";
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { FilesCollection } from 'meteor/ostrio:files';
// import { PeriodeStudis } from './collections.js';

SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);

// SimpleSchema.setDefaultMessages({
//   initialLanguage: 'en',
//   messages: {
//     en: {
//       uploadError: '{{value}}', //File-upload
//     },
//   }
// });



export const bakulFiles = new FilesCollection({
  debug: true,
  collectionName: 'bakulFiles',
  allowClientCode: true, // Required to let you remove uploaded file
  // storagePath: function() { return '/uploads/profilePics/'; },
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/bakulFiles`;
        } else {
        return `${process.env.PWD}/uploads/bakulFiles`;
      }
    },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /doc|docx|xls|xlsx|ppt|pptx|mp4|m4v|avi|pdf|png|jpg|jpeg|zip/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload documents, with size equal or less than 10MB';
    }
  }
});



export const profilePics = new FilesCollection({
  debug: true,
  collectionName: 'profilePics',
  allowClientCode: true, // Required to let you remove uploaded file
  // storagePath: function() { return '/uploads/profilePics/'; },
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/profilePics`;
        } else {
        return `${process.env.PWD}/uploads/profilePics`;
      }
    },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

// bukan untuk fitur general tetapi untuk news, article, dan sejenisnya
// mungkin dokumen juga bisa pakai ini
export const generalPics = new FilesCollection({
  debug: true,
  collectionName: 'generalPics',
  allowClientCode: true, // Required to let you remove uploaded file
  // storagePath: function() { return '/uploads/profilePics/'; },
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/general`;
        } else {
        return `${process.env.PWD}/uploads/general`;
      }
    },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

export const documentPics = new FilesCollection({
  debug: true,
  collectionName: 'documentPics',
  allowClientCode: true, // Required to let you remove uploaded file
  // storagePath: function() { return '/uploads/profilePics/'; },
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/documentPics`;
        } else {
          console.log(process.env.PWD)
        return `${process.env.PWD}/uploads/documentPics`;
      }
    },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

export const documentFiles = new FilesCollection({
  debug: true,
  collectionName: 'documentFiles',
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/documentFiles`;
      } else {
        return `${process.env.PWD}/uploads/documentFiles`;
      }
    },
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /doc|docx|xls|xlsx|ppt|pptx|mp4|m4v|avi|pdf|png|jpg|jpeg|zip/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload file, with size equal or less than 10MB';
    }
  }
});

export const rpsUploads = new FilesCollection({
  debug: true,
  collectionName: 'rpsUploads',
  allowClientCode: true, // Required to let you remove uploaded file
  // storagePath: function() { return '/uploads/profilePics/'; },
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/rpsUploads`;
        } else {
        return `${process.env.PWD}/uploads/rpsUploads`;
      }
    },
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /pdf|png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});


export const taImages = new FilesCollection({
  debug: true,
  collectionName: 'taImages',
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/taImages`;
      } else {
        return `${process.env.PWD}/uploads/taImages`;
      }
    },
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});

export const ujianFiles = new FilesCollection({
  debug: true,
  collectionName: 'ujianFiles',
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/ujianFiles`;
      } else {
        return `${process.env.PWD}/uploads/ujianFiles`;
      }
    },
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /doc|docx|xls|xlsx|ppt|pptx|mp4|m4v|avi|pdf|png|jpg|jpeg|zip/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});


export const studentUploads = new FilesCollection({
  debug: true,
  collectionName: 'studentUploads',
  storagePath: () => {
      if (Meteor.isProduction) {
        return `/uploads/studentUploads`;
      } else {
        return `${process.env.PWD}/uploads/studentUploads`;
      }
    },
  allowClientCode: true, // Required to let you remove uploaded file
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /doc|docx|xls|xlsx|ppt|pptx|mp4|m4v|avi|pdf|png|jpg|jpeg|zip/i.test(file.ext)) {
      return true;
    } else {
      return 'Please upload image, with size equal or less than 10MB';
    }
  }
});




// legend
// 1 = bakulFiles
// 2 = profilePics
// 3 = rpsUploads
// 4 = taImages