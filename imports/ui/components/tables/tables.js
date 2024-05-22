import "./tables.html";
import DataTable from 'datatables.net-dt';
import "datatables.net-responsive-dt";

  Template.tableListDosen.onCreated(function (){
    this.dataDosen = new ReactiveVar([])
  });

  Template.tableListDosen.onRendered( function(){
    const context = this;
    Meteor.call('dosen.getAll', function (err,res) {
      if(err){
        failAlert(err)
      }
      else{
        console.log(res)
        context.dataDosen.set(res)
      }
    });
  })

  Template.tableListDosen.helpers({
    dataDosen(){
        return Template.instance().dataDosen.get();
    },

  });

  Template.tableListDosen.events({
    "click .delete-lecturer" (e, t){
      const _id = $("#delete-lecturer").val()
      confirmationAlertAsync().then(function (result) {
        if (result.value) {
            Meteor.call("dosen.delete", _id, function (err, res) {
              if (err) {
                  failAlert(err);
              } else {
                  successAlert("Berhasil menghapus dosen");
                  location.reload()
              }
            });
        }
      });
    }
  })