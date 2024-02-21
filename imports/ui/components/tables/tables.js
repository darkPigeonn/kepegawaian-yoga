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
       context.dataDosen.set(res)
      }
    });
  })

  Template.tableListDosen.helpers({
    dataDosen(){
        return Template.instance().dataDosen.get();
    },
    
});