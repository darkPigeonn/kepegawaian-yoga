import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine, MongoDBEngine } from 'meteor/easy:search'
import moment from "moment";
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'denyUpdate']);


// export const userIndex = new EasySearch.Index({
//     collection: Meteor.users,
//     fields: ['username'],
//     engine: new EasySearch.Minimongo()
// });

// export const studentIndex = new EasySearch.Index({
//     collection: Meteor.users,
//     fields: ['username'],
//     // engine: new EasySearch.Minimongo({
// 	//     selector: function (searchObject, options, aggregation) {
// 	//         var selector = this.defaultConfiguration().selector(searchObject, options, aggregation);
// 	//         // ... other filters
// 	//         if (options.search.props.birthdayFilter) {
// 	//             // what should happen here?
// 	//             // selector['profile.birthday'] = ' something... '
// 	//         }
// 	//         return selector;
// 	//     }
//     // })
//     engine: new EasySearch.Minimongo()
// });




export const Tingkats = new Mongo.Collection( 'tingkats' );
export const Dioceses = new Mongo.Collection( 'dioceses' );
export const RegistrationRequests = new Mongo.Collection( 'registrationRequests' , { idGeneration: 'MONGO' } );
TingkatsSchema = new SimpleSchema({
	"tingkatId": {
		type: Number,
		label: "id tingkat",
	},
	"name": {
		type: String,
		label: "nama tingkat",
	},
	"templateId": {
		type: String,
		label: "template Id",
		optional: true,
		autoform: {
			type: "select2",
			// options: function(){
			// 			return ScoringTemplates.find().map(function (c) {
		 //      return {label: c.name, value: c._id};
		 //    });
			// }
		}
	},
	"templateName": {
		type: String,
		label: "Template Name",
		autoform: {
			type: "hidden",
		},
		optional: true,
		// autoValue: function(){
		// 	let templateId = this.siblingField("templateId").value;
		// 	return ScoringTemplates.findOne({"_id": templateId}).name;
		// }
	}
});

Tingkats.attachSchema( TingkatsSchema );


export const Glovars = new Mongo.Collection( 'glovars' );

export const PeriodeStudis = new Mongo.Collection( 'periodeStudis' );

PeriodeStudisSchema = new SimpleSchema({
	"name": {
		type: String,
		label: "nama tahun akademik",
		autoValue: function () {
	    if (this.isSet && typeof this.value === "string") {
	      return this.value.toLowerCase();
	    }
	  }
	},
	"index": {
		type: Number,
		label: "index",
		optional: true,
		autoValue: function(){
	    if (this.isInsert) {

			let psCount = PeriodeStudis.find().fetch().length;
      return psCount + 1;
		  }
		}
	},
	"startDate": {
		type: Date,
		label: "tanggal mulai",
		optional: true
	},
	"note": {
		type: String,
		label: "Catatan",
		optional: true,
		autoform: {
			rows: 3
		}
	},
	"status": {
		type: Boolean,
		label: "Aktif",
		optional: true,
		autoform: {
			type: "boolean-radios"
		}
	},
	"activeMatkuls": {
		type: Array,
		label: "daftar mata kuliah aktif",
		optional: true,
	},
		"activeMatkuls.$": {
			type: Object,
			label: "mata kuliah aktif",
			optional: true,
		},
		"activeMatkuls.$._id": {
			type: String,
			label: "ID mata kuliah aktif",
			optional: true,
		},
		"activeMatkuls.$.matkulId": {
			type: String,
			label: "ID mata kuliah",
			optional: true,
		},
		"activeMatkuls.$.matkulName": {
			type: String,
			label: "nama mata kuliah aktif",
			optional: true,
		},
		"activeMatkuls.$.schedule": {
			type: String,
			label: "jadwal mata kuliah (Hari, Jam)",
			optional: true,
		},
		"activeMatkuls.$.venue": {
			type: String,
			label: "Ruang kelas",
			optional: true,
		},
		"activeMatkuls.$.formatorId": {
			type: String,
			label: "ID Formator",
			optional: true,
		},
		"activeMatkuls.$.formatorName": {
			type: String,
			label: "Nama Formator",
			optional: true,
		},
});

// PeriodeStudis.attachSchema( PeriodeStudisSchema );





export const Blogs = new Mongo.Collection( 'blogs' );

BlogsSchema = new SimpleSchema({
	"title": {
		type: String,
		label: "Judul",
		// autoValue: function () {
	 //    if (this.isSet && typeof this.value === "string") {
	 //      return this.value.toLowerCase();
	 //    }
	 //  }
	},
	"content": {
		type: String,
		label: "isi",
		autoform: {
			rows: 3
		}
	},
	"createdAt": {
    type: Date,
    optional: true,
    denyUpdate: true,
    autoform: {
        type: "hidden"
      },
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  "createdBy": {
    type: String,
    denyUpdate: true,
    optional: true,
    autoform: {
      type: "hidden"
    },
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
	"author": {
		type: String,
		label: "author",
		autoform: {
			type: "hidden"
		},
		optional: true,
		autoValue: function() {
      if (this.isInsert) {
        let thisUser = Meteor.users.findOne({"_id": this.userId });
        return thisUser.username;
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
	},
});

Blogs.attachSchema( BlogsSchema );
