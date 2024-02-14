import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search'
import moment from "moment";
import { SimpleSchema } from "simpl-schema";
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
SimpleSchema.extendOptions(['autoform', 'index', 'denyInsert', 'defaultValue']);



export const bookStatusOptions = [
  {
    value: 10,
    label: "available"
  },
  {
    value: 20,
    label: "borrowed"
  },
  {
    value: 29,
    label: "unavailable - other reasons"
  },
  {
    value: 90,
    label: "retired"
  },
  {
    value: 91,
    label: "destroyed"
  },
];

export const Books = new Mongo.Collection( 'books' );

export const BooksIndex = new EasySearch.Index({
    collection: Books,
    fields: ['title', 'barcode.name', 'author', 'topic'],
    engine: new EasySearch.Minimongo(),
    defaultSearchOptions: {
      limit: 5
    },
    placeholder: "Search..."
});

BooksSchema = new SimpleSchema({
  "title": {
    type: String,
    label: "judul",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "status": {
    type: Number,
    label: "Status",
    optional: true,
    autoform: {
      options: bookStatusOptions
    }
  },
  "barcode": {
    type: Array,
    label: "Barcode",
    optional: true,
  },
    "barcode.$" : {
      type: Object,
      optional: true,
      label: " ",
    },
    "barcode.$.name": {
      type: String,
      optional: true,
      label: " ",
      // remove label
    },
  "isbn": {
    type: Number,
    label: "isbn",
    optional: true,
  },
  "year": {
    type: Number,
    label: "Tahun",
    optional: true,
  },
  "author": {
    type: String,
    label: "Penulis",
    optional: true
  },
  "publisher": {
    type: String,
    label: "Penerbit",
    optional: true
  },
  "description": {
    type: String,
    label: "deskripsi",
    optional: true,
    autoform: {
      rows: 3
    }
  },
  "topic": {
    type: String,
    label: "Topik",
    optional: true,
    autoform: {
      rows: 3
    }
  },
  "borrowerId": {
    type: String,
    label: "Peminjam",
    optional: true,
    autoform: {
      type: "hidden"
    }
  },
  "borrowHistory": {
      type: Array,
      optional: true,
      autoform: {
        type: "hidden"
      },
    },
    "borrowHistory.$": {
      type: Object,
      optional: true,
      autoform: {
        type: "hidden"
      },
    },
    "borrowHistory.$.ticketId": {
      type: String,
      autoform: {
        type: "hidden"
      },
      optional: true,
      autoValue: function(){
      let ticketId = this.siblingField("_id").value;
      return ticketId;
      }
    },
    "borrowHistory.$.timestamp": {
      type: Date,
      autoform: {
        type: "hidden"
      },
      optional: true
    },
    "borrowHistory.$.returnTimestamp": {
      type: Date,
      autoform: {
        type: "hidden"
      },
      defaultValue: null,
      optional: true
    },
    "borrowHistory.$.borrowerId": {
      type: String,
      label: "",
      optional: true,
      autoform: {
        type: "hidden"
      },

    },
    "borrowHistory.$.borrowerName": {
      type: String,
      label: "",
      optional: true,
      autoform: {
        type: "hidden"
      },
    },
});

Books.attachSchema( BooksSchema );


export const LibTickets = new Mongo.Collection( 'libTickets' );

export const LibTicketsIndex = new EasySearch.Index({
    collection: LibTickets,
    fields: ['title', 'barcode.name', 'author'],
    engine: new EasySearch.Minimongo(),
    defaultSearchOptions: {
      limit: 5
    },
    placeholder: "Search..."
});

LibTicketsSchema = new SimpleSchema({
  "name": {
    type: String,
    label: "judul",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "books": {
    type: Array,
    label: "buku",
    optional: false,
  },
  "books.$": {
    type: Object,
    optional: false,
  },
  "books.$._id": {
    type: String,
    label: "ID buku",
  },
  "books.$.title": {
    type: String,
    label: "judul",
    autoValue: function () {
      if (this.isSet && typeof this.value === "string") {
        return this.value.toLowerCase();
      }
    }
  },
  "books.$.barcode": {
    type: Array,
    label: "Barcode",
    optional: true,
  },
    "books.$.barcode.$" : {
      type: Object,
      optional: true,
      label: " ",
    },
    "books.$.barcode.$.name": {
      type: String,
      optional: true,
      label: " ",
      // remove label
    },
  "books.$.isbn": {
    type: Number,
    label: "isbn",
    optional: true,
  },
  "books.$.year": {
    type: Number,
    label: "Tahun",
    optional: true,
  },
  "books.$.author": {
    type: String,
    label: "Penulis",
    optional: true
  },
  "books.$.publisher": {
    type: String,
    label: "Penerbit",
    optional: true
  },
  "books.$.description": {
    type: String,
    label: "deskripsi",
    optional: true,
    autoform: {
      rows: 3
    }
  },
  "books.$.topic": {
    type: String,
    label: "Topik",
    optional: true,
    autoform: {
      rows: 3
    }
  },
  "borrowerId": {
    type: String,
    label: "ID peminjam",
    optional: false,
  },
  "borrowerName": {
    type: String,
    label: "nama peminjam",
    optional: false,

  },
  "timestamp": {
    type: Date,
    label: "hari/jam keluar",
    optional: false,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  "returnTimestamp": {
    type: Date,
    label: "hari jam kembali",
    optional: true,
  },

});

LibTickets.attachSchema( LibTicketsSchema );
