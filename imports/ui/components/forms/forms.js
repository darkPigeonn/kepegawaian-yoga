import { css } from "jquery";
import "./forms.html";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Session } from 'meteor/session';



Template.formLecturers.onCreated(function () {
    const self = this;
    self.formPage = new ReactiveVar(1);
    self.formData = new ReactiveVar({});
    // self.listExperiences = new ReactiveVar([])
    self.listEducationalHistory = new ReactiveVar([])
    self.listCertification = new ReactiveVar([])
    self.submitType = new ReactiveVar(self.data.submitType)
    self.pageMode = new ReactiveVar();
    self.skImage = new ReactiveVar(false)
    self.listKerjaPenugasan = new ReactiveVar([])
    self.listPengajaran = new ReactiveVar([])
    self.listPengujian = new ReactiveVar([])
    self.listBimbingan = new ReactiveVar([])
    self.listBahanAjar = new ReactiveVar([])
    self.listProject  = new ReactiveVar([])
    self.listPublicationTypes = new ReactiveVar([])
    self.listJournal = new ReactiveVar([])
    self.listMagazine = new ReactiveVar([])
    self.listOtherPublication = new ReactiveVar([])
    self.listIpr = new ReactiveVar([])
    self.listScholarship = new ReactiveVar([])
    self.listKesejahteraan = new ReactiveVar([])
    self.listTunjangan = new ReactiveVar([])
    self.listDedication = new ReactiveVar([])
    self.listSpeaker = new ReactiveVar([])
    self.listJournalManager = new ReactiveVar([])
    self.listOthersMedia = new ReactiveVar([])
    self.listImaviStructure = new ReactiveVar([])
    self.listProfesi = new ReactiveVar([])
    self.listAward = new ReactiveVar([])
    self.listCoachingLevel = new ReactiveVar([])
    self.listStudentGuidance = new ReactiveVar([])
    self.listresearchinterest = new ReactiveVar([])
    self.listEmail = new ReactiveVar([])

    const lecturerId = FlowRouter.getParam("_id");
    const mode = lecturerId ? "edit" : "add";
    self.pageMode.set(mode);




});

Template.formLecturers.onRendered( function(){
    function formatRupiah(angka) {
        var reverse = angka.toString().split('').reverse().join(''),
            ribuan = reverse.match(/\d{1,3}/g);
        ribuan = ribuan.join('.').split('').reverse().join('');
        return 'Rp. ' + ribuan;
    }

    this.findAll('.nominal').forEach(function(elem) {
        elem.addEventListener('input', function () {
            var nominal = parseInt(this.value.replace(/[^0-9]/g, ''));
            this.value = formatRupiah(nominal);
        });
    });
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        Swal.fire({
          title: "Konfirmasi",
          text: "Apakah anda yakin merefresh halaman ini?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya",
          cancelButtonText: "Tidak"
        }).then((result) => {
          if (result.isConfirmed) {
            window.removeEventListener('beforeunload', arguments.callee);
            location.reload();
          } else {
          }
        });

        return '';
    });
    const context = Template.instance();
    if (this.submitType.get() === 2) {
        const id = FlowRouter.getParam("_id")
        Meteor.call("dosen.getDetails", id, function (err, res) {
            if (err) {
                failAlert("Dosen Tidak Ditemukan!");
                history.back();
            } else {
                context.formData.set(res)
                // context.listExperiences.set(res.listExperiences)
                context.listEducationalHistory.set(res.listEducationalHistory)
                context.listCertification.set(res.listCertification)
                context.listKerjaPenugasan.set(res.listKerjaPenugasan)
                context.listPengajaran.set(res.listPengajaran)
                context.listBimbingan.set(res.listBimbingan)
                context.listPengujian.set(res.listPengujian)
                context.listBahanAjar.set(res.listBahanAjar)
                context.listProject.set(res.listProject)
                context.listPublicationTypes.set(res.listPublicationTypes)
                context.listJournal.set(res.listJournal)
                context.listMagazine.set(res.listMagazine)
                context.listOtherPublication.set(res.listOtherPublication)
                context.listIpr.set(res.listIpr)
                context.listScholarship.set(res.listScholarship)
                context.listKesejahteraan.set(res.listKesejahteraan)
                context.listTunjangan.set(res.listTunjangan)
                context.listDedication.set(res.listDedication)
                context.listSpeaker.set(res.listSpeaker)
                context.listJournalManager.set(res.listJournalManager)
                context.listOthersMedia.set(res.listOthersMedia)
                context.listImaviStructure.set(res.listImaviStructure)
                context.listProfesi.set(res.listProfesi)
                context.listAward.set(res.listAward)
                context.listresearchinterest.set(res.listresearchinterest)
                context.listStudentGuidance.set(res.listStudentGuidance)
                context.listCoachingLevel.set(res.listCoachingLevel)
                context.listEmail.set(res.listEmail)
            }
        });
    }




})

Template.formLecturers.helpers({
    listPengujian(){
        return Template.instance().listPengujian.get()
    },
    listBimbingan(){
        return Template.instance().listBimbingan.get()
    },
    listPengajaran(){
        return Template.instance().listPengajaran.get()
    },
    listKerjaPenugasan(){
        return Template.instance().listKerjaPenugasan.get()
    },
    skImage(){
        return Template.instance().skImage.get()
    },
    formPage(){
        return Template.instance().formPage.get();
    },
    formData(){
        return Template.instance().formData.get()
    },
    // listExperiences(){
    //     return Template.instance().listExperiences.get()
    // },
    listEducationalHistory(){
        return Template.instance().listEducationalHistory.get()
    },
    listCertification(){
        return Template.instance().listCertification.get()
    },
    pageMode(){
        return Template.instance().pageMode.get();
    },
    listBahanAjar(){
        return Template.instance().listBahanAjar.get()
    },
    listProject(){
        return Template.instance().listProject.get()
    },
    listPublicationTypes(){
        return Template.instance().listPublicationTypes.get()
    },
    listJournal(){
        return Template.instance().listJournal.get()
    },
    listMagazine(){
        return Template.instance().listMagazine.get()
    },
    listOtherPublication(){
        return Template.instance().listOtherPublication.get()
    },
    listIpr(){
        return Template.instance().listIpr.get()
    },
    listScholarship(){
        return Template.instance().listScholarship.get()
    },
    listKesejahteraan(){
        return Template.instance().listKesejahteraan.get()
    },
    listTunjangan(){
        return Template.instance().listTunjangan.get()
    },

    listDedication(){
        return Template.instance().listDedication.get()
    },
    listSpeaker(){
        return Template.instance().listSpeaker.get()
    },
    listJournalManager(){
        return Template.instance().listJournalManager.get()
    },
    listOthersMedia(){
        return Template.instance().listOthersMedia.get()
    },
    listImaviStructure(){
        return Template.instance().listImaviStructure.get()
    },
    listProfesi(){
        return Template.instance().listProfesi.get()
    },
    listAward(){
        return Template.instance().listAward.get()
    },
    listCoachingLevel(){
        return Template.instance().listCoachingLevel.get()
    },
    listStudentGuidance(){
        return Template.instance().listStudentGuidance.get()
    },
    listresearchinterest(){
        return Template.instance().listresearchinterest.get()
    },
    listEmail(){
        return Template.instance().listEmail.get()
    }
});



Template.formLecturers.events({

    "change #inputFileSk" (e, t){
        e.preventDefault();
        const file = e.target.files[0]
        if (file) {
          t.skImage.set(true)
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            $('#skImage').attr('src', this.result)
          });
          reader.readAsDataURL(file);
        }
        else {
          $('#skImage').attr('src', '#')
        }
    },
    'click #remove-sk' (e, t){
        e.preventDefault()
        $('#inputFileSk').attr('src', "")
        $("#inputFileSk").val("")
        t.skImage.set(false)
    },
    'change #inputImageProfile'(e, t) {
        e.preventDefault();
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.addEventListener('load', function () {
            $('#inputImageProfile').attr('src', this.result)
            const formData = t.formData.get()
            formData.imageLink = this.result
            t.formData.set(formData)
          });
          reader.readAsDataURL(file);
        }
        else {
          $('#inputImageProfile').attr('src', '#')
        }
    },

    'click #remove-profile' (e, t){
        e.preventDefault()
        $('#inputImageProfile').attr('src', "")
        $("#inputImageProfile").val("")
        const formData = t.formData.get()
        delete formData.imageLink
        t.formData.set(formData)
    },
    "click #add-email" (e, t){
        e.preventDefault()
        const listEmail = t.listEmail.get()
        const email = $("#inputEmail").val()
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        if (!isValidEmail) {
            failAlert("Input Email Anda Salah Harus Ada @.");
            return;
        }
        const data = {
           email
        }
        listEmail.push(data)
        t.listEmail.set(listEmail)
    },
    'click .edit-email'(e, t) {
    e.preventDefault();
    const index = $(e.currentTarget).data('milik');
    const email = t.listEmail.get()[index];
    $("#editInputEmail").val(email.email);
    $('#editEmailModal').modal('show');
    Session.set('editedEmailIndex', index);
    },
    'click .save-email'(e, t) {
    e.preventDefault();
    const editedEmailIndex = Session.get('editedEmailIndex');
    const listEmail = t.listEmail.get();

    const email = $("#editInputEmail").val();
    listEmail[editedEmailIndex] = {
        email
    };

    t.listEmail.set(listEmail);
    $('#editEmailModal').modal('hide');

    Session.set('editedEmailIndex', undefined);
    successAlert("Email berhasil diubah");
    },


    "click #add-history" (e, t){
        e.preventDefault()
        const listEducationalHistory = t.listEducationalHistory.get()
        const educationLevel = $("#inputEducationLevel").val()
        const major = $("#inputEducationMajor").val()
        const institution = $("#inputEducationInstitution").val()
        const studyPublication = $("#inputStudyPublication").val()
        const domesticStatus = $("input[name=inputDomestic]:checked").val()
        const dateEnd = $("#inputEducationEnd").val()
        const isValidDateEnd = /^[0-9]{4}$/.test(dateEnd);

        if (!isValidDateEnd) {
            failAlert("Input Date End harus terdiri dari 4 digit angka.");
            return;
        }

        const data = {
            educationLevel,
            major,
            institution,
            domesticStatus,
            studyPublication,
            dateEnd,

        }

        listEducationalHistory.push(data)
        t.listEducationalHistory.set(listEducationalHistory)
    },
    'click .edit-history'(e,t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const educationHistory = t.listEducationalHistory.get()[index];

        $("#editInputEducationLevel").val(educationHistory.educationLevel);
        $("#editInputEducationMajor").val(educationHistory.major);
        $("#editInputEducationInstitution").val(educationHistory.institution);
        $("#editInputStudyPublication").val(educationHistory.domesticStatus);
        $("input[name=EditInputDomestic]:checked").val(educationHistory.studyPublication)
        $("#EditInputEducationEnd").val(educationHistory.dateEnd);

        $('#editEducationHistoryModal').modal('show');
        Session.set('editedEducationHistoryIndex',index);

    },
    'click .save-history'(e,t){
        e.preventDefault();
        const editedEducationHistoryIndex = Session.get('editedEducationHistoryIndex');
        const listEducationalHistory = t.listEducationalHistory.get();

        const educationLevel = $("#editInputEducationLevel").val()
        const major = $("#editInputEducationMajor").val()
        const institution = $("#editInputEducationInstitution").val()
        const studyPublication = $("#editIinputStudyPublication").val()
        const domesticStatus = $("input[name=editInputDomestic]:checked").val()
        const dateEnd = $("#editInputEducationEnd").val()

        listEducationalHistory[editedEducationHistoryIndex] = {
            educationLevel,
            major,
            institution,
            studyPublication,
            domesticStatus,
            dateEnd
        }
        t.listEducationalHistory.set(listEducationalHistory);
        $('#editEducationHistoryModal').modal('hide');
        Session.set('editedEducationHistoryIndex',undefined);
    },
    "click .add-publication" (e,t){
        e.preventDefault()
        const listPublicationTypes = t.listPublicationTypes.get()
        const category = $("#inputJenisKarya").val();
        const title = $("#inputJudulPublication").val();
        const isbn = $("#inputIsbn").val();
        const publisher =$("#inputPenerbit").val();
        const city = $("#inputKotaPenerbit").val();
        const year = $("#inputTahunTerbit").val();
        const link = $("#inputURL").val();
        const isValidYear = /^[0-9]{4}$/.test(year);

        if (!isValidYear) {
            failAlert("Input Tahun Terbit harus terdiri dari 4 digit angka.");
            return;
        }
        const data ={
            category,
            title,
            isbn,
            publisher,
            city,
            year,
            link
        }
        listPublicationTypes.push(data)
        t.listPublicationTypes.set(listPublicationTypes)
    },
    "click .edit-publication"(e,t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const publication = t.listPublicationTypes.get()[index];
        $("#editInputJenisKarya").val(publication.category)
        $("#editInputJudulPublication").val(publication.title)
        $("#editInputIsbn").val(publication.isbn)
        $("#editInputPenerbit").val(publication.publisher)
        $("#editInputKotaPenerbit").val(publication.city)
        $("#editInputTahunTerbit").val(publication.year)
        $("#editInputURL").val(publication.link)

        $('#editPublicationModal').modal('show');
        Session.set('editedPublicationIndex',index);

    },
    "click .save-publication"(e,t){
        e.preventDefault();
        const editedPublicationIndex = Session.get('editedPublicationIndex')
        const listPublicationTypes = t.listPublicationTypes.get();

        const category = $("#editInputJenisKarya").val();
        const title = $("#editInputJudulPublication").val();
        const isbn = $("#editInputIsbn").val();
        const publisher =$("#editInputPenerbit").val();
        const city = $("#editInputKotaPenerbit").val();
        const year = $("#editInputTahunTerbit").val();
        const link = $("#editInputURL").val();

        listPublicationTypes[editedPublicationIndex] ={
            category,
            title,
            isbn,
            publisher,
            city,
            year,
            link
        };

        t.listPublicationTypes.set(listPublicationTypes);
        $('#editPublicationModal').modal('hide');
        Session.set('editedPublicationIndex',undefined);
    },
    "click .add-research-interest" (e,t){
        e.preventDefault()
        const listresearchinterest = t.listresearchinterest.get()
        const title = $("#inputResearchInterest").val()
        const data ={
            title
        }
        listresearchinterest.push(data)
        t.listresearchinterest.set(listresearchinterest)
    },
    "click .edit-research-interest"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const researchInterest = t.listresearchinterest.get()[index];
        $("#editInputResearchInterest").val(researchInterest.title)

        $('#editResearchInterestModal').modal('show');
        Session.set('editedResearchInterestIndex',index);


    },
    "click .save-research-interest" (e,t){
        e.preventDefault();
        const editedResearchInterestIndex = Session.get('editedResearchInterestIndex')
        const listresearchinterest = t.listresearchinterest.get();

        const title = $("#editInputResearchInterest").val()

        listresearchinterest[editedResearchInterestIndex] ={
            title
        }
        t.listresearchinterest.set(listresearchinterest);
        $('#editResearchInterestModal').modal('hide');
        Session.set('editedResearchInterestIndex',undefined);

    },
    "click .add-student-guidance" (e,t){
        e.preventDefault()
        const listStudentGuidance = t.listStudentGuidance.get()
        const category = $("#inputCategoryActivity").val()
        const title = $("#inputTitleActivity").val()
        const cStudy = $("#inputCategoryStudy").val()
        const gegal = $('#inputSemesterPembinaan').val()
        const semester =$("#inputSemester").val()

        const data ={
            category,
            title,
            cStudy,
            gegal,
            semester
        }
        listStudentGuidance.push(data)
        t.listStudentGuidance.set(listStudentGuidance)
    },
    "click .edit-student-guidance"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const studentGuidance = t.listStudentGuidance.get()[index];
        $("#editInputCategoryActivity").val(studentGuidance.category)
        $("#editInputTitleActivity").val(studentGuidance.title)
        $("#editInputCategoryStudy").val(studentGuidance.cStudy)
        $("#editInputSemester").val(studentGuidance.semester)
        $('#editInputSemesterPembinaan').val(studentGuidance.gegal)
        $('#editStudentGuidanceModal').modal('show');
        Session.set('editedStudentGuidanceIndex',index);


    },
    "click .save-student-guidance"(e,t){
        e.preventDefault();
        const editedStudentGuidanceIndex = Session.get('editedStudentGuidanceIndex')
        const listStudentGuidance = t.listStudentGuidance.get();
        const category = $("#editInputCategoryActivity").val()
        const title    = $("#editInputTitleActivity").val()
        const cStudy   = $("#editInputCategoryStudy").val()
        const gegal = $('#editInputSemesterPembinaan').val()
        const semester = $("#editInputSemester").val()

        listStudentGuidance[editedStudentGuidanceIndex] = {
            category,
            title,
            cStudy,
            gegal,
            semester
        }
        t.listStudentGuidance.set(listStudentGuidance)
        $('#editStudentGuidanceModal').modal('hide');
        Session.set('editedStudentGuidanceIndex',undefined)
    },
    "click .input-ps"(e){
        e.preventDefault()
        var currentYear = new Date().getFullYear();
        var startYear = 2011;
        var selectElements = document.querySelectorAll(".input-ps");

        selectElements.forEach(function(selectElement) {
            for (var i = currentYear; i >= startYear; i--) {
                var option = document.createElement("option");
                var nilai = i + 1;
                option.text = i + "/" + nilai ;
                option.value = i + "/" + nilai;
                selectElement.appendChild(option);
            }
        });
    },

    "click .add-pengajaran" (e, t){
        e.preventDefault()
        const listPengajaran = t.listPengajaran.get()
        const matkul = $("#inputMataKuliah").val()
        const ps = $("#input-ps").val()
        const semester = $("#inputSemesterStudy").val()
        const type = $("#input-jenis").val()
        const bidangKeilmuan = $("#inputBidangKeilmuan").val()
        const mhsTotal = $("#inputJumlahMahasiswa").val()
        const sks = $("#inputSks").val()
        const isValidSKS = /^[0-9]+$/.test(sks);

        if (!isValidSKS) {
            failAlert("Input SKS hanya boleh berupa angka.");
            return;
        }
        const data = {
            type,
            matkul,
            ps,
            semester,
            bidangKeilmuan,
            mhsTotal,
            sks
        }
        // console.log(data)
        listPengajaran.push(data)
        t.listPengajaran.set(listPengajaran)


    },
    "click .edit-pengajaran"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const pengajaran     = t.listPengajaran.get()[index];
        $("#editInputMataKuliah").val(pengajaran.matkul)
        $("#editInput-ps").val(pengajaran.ps)
        $("#editInputSemesterStudy").val(pengajaran.semester)
        $("#editInput-jenis").val(pengajaran.type)
        $("#editInputBidangKeilmuan").val(pengajaran.bidangKeilmuan)
        $("#editInputJumlahMahasiswa").val(pengajaran.mhsTotal)
        $("#editInputSks").val(pengajaran.sks)

        $('#editPengajaranModal').modal('show');

        Session.set('editedPengajaranIndex',index);

    },
    "click .save-pengajaran"(e,t){
        e.preventDefault();
        const editedPengajaranIndex = Session.get('editedPengajaranIndex')
        const listPengajaran = t.listPengajaran.get()
        const matkul         = $("#editInputMataKuliah").val()
        const ps             = $("#editInput-ps").val()
        const semester       = $("#editInputSemesterStudy").val()
        const type           = $("#editInput-jenis").val()
        const bidangKeilmuan = $("#editInputBidangKeilmuan").val()
        const mhsTotal       = $("#editInputJumlahMahasiswa").val()
        const sks            = $("#editInputSks").val()

        listPengajaran[editedPengajaranIndex] = {
            matkul,
            ps,
            semester,
            type,
            bidangKeilmuan,
            mhsTotal,
            sks
        }
        t.listPengajaran.set(listPengajaran)
        $('#editPengajaranModal').modal('hide');
        Session.set('editedPengajaranIndex',undefined)

    },
    "click .add-magazine" (e,t){
        e.preventDefault()
        const listMagazine = t.listMagazine.get()
        const title  = $("#title_input").val()
        const name = $("#input_name").val()
        const volume = $("#volume_input").val()
        const number = $("#number_input").val()
        const dateOfPublisher = $("#date_input").val()
        const year = $("#year_input").val()
        const link = $("#link_input").val()
        const isValidYear = /^[0-9]{4}$/.test(year);

        if (!isValidYear) {
            failAlert("Input Tahun Terbit harus terdiri dari 4 digit angka.");
            return;
        }
        const data = {
            title,
            name,
            volume,
            number,
            dateOfPublisher,
            year,
            link
        }
        // console.log(data)
        listMagazine.push(data)
        t.listMagazine.set(listMagazine)
    },
    "click .edit-magazine"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const magazine = t.listMagazine.get()[index];
        $("#editTitle_input").val(magazine.title)
        $("#editInput_name").val(magazine.name)
        $("#editVolume_input").val(magazine.volume)
        $("#editNumber_input").val(magazine.number)
        $("#editDate_input").val(magazine.dateOfPublisher)
        $("#editYear_input").val(magazine.year)
        $("#editLink_input").val(magazine.link)



        $('#editMagazineModal').modal('show');
        Session.set('editedMagazineIndex',index);
    },
    "click .save-magazine"(e,t){
        e.preventDefault();
        const editedMagazineIndex = Session.get('editedMagazineIndex')
        const listMagazine = t.listMagazine.get();
        const title  = $("#editTitle_input").val()
        const name = $("#editInput_name").val()
        const volume = $("#editVolume_input").val()
        const number = $("#editNumber_input").val()
        const dateOfPublisher = $("#editDate_input").val()
        const year = $("#editYear_input").val()
        const link = $("#editLink_input").val()


        listMagazine[editedMagazineIndex] = {
            title,
            name,
            volume,
            number,
            dateOfPublisher,
            year,
            link
        }
        t.listMagazine.set(listMagazine)
        $('#editMagazineModal').modal('hide');
        Session.set('editedMagazineIndex',undefined)
    },
    "click .add-otherPublication" (e,t){
        e.preventDefault()
        const listOtherPublication = t.listOtherPublication.get()
        const title  = $("#input_title").val()
        const name = $("#input_media_name").val()
        const volume = $("#input_volume").val()
        const number = $("#input_number").val()
        const dateOfPublisher = $("#input_date").val()
        const year = $("#input_year").val()
        const link = $("#input_link").val()
        const data = {
            title,
            name,
            volume,
            number,
            dateOfPublisher,
            year,
            link
        }
        // console.log(data)
        listOtherPublication.push(data)
        t.listOtherPublication.set(listOtherPublication)
    },
    "click .edit-otherPublication"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const otherPublication = t.listOtherPublication.get()[index];
        $("#editInputTitle_input").val(otherPublication.title)
        $("#editInput_media_name").val(otherPublication.name)
        $("#editInput_volume").val(otherPublication.volume)
        $("#editInput_number").val(otherPublication.number)
        $("#editInput_date").val(otherPublication.dateOfPublisher)
        $("#editInput_year").val(otherPublication.year)
        $("#editInput_link").val(otherPublication.link)



        $('#editOtherPublicationModal').modal('show');
        Session.set('editedOtherPublicationIndex',index);
    },
    "click .save-otherPublication"(e,t){
        e.preventDefault();
        const editedOtherPublicationIndex = Session.get('editedOtherPublicationIndex')
        const listOtherPublication = t.listOtherPublication.get();
        const title     = $("#editInputTitle_input").val()
        const name      = $("#editInput_media_name").val()
        const volume    = $("#editInput_volume").val()
        const number    = $("#editInput_number").val()
        const dateOfPublisher = $("#editInput_date").val()
        const year = $("#editInput_year").val()
        const link = $("#editInput_link").val()


        listOtherPublication[editedOtherPublicationIndex] = {
            title,
            name,
            volume,
            number,
            dateOfPublisher,
            year,
            link
        }
        t.listOtherPublication.set(listOtherPublication)
        $('#editOtherPublicationModal').modal('hide');
        Session.set('editedOtherPublicationIndex',undefined)
    },
    "click .add-paten" (e, t){
        e.preventDefault()
        const listIpr = t.listIpr.get()
        const title  = $("#inputJudulPaten").val()
        const category = $("#inputKategoriKegiatan").val()
        const cActivity = $("#inputJenisKegiatan").val()
        const dateOfPublisher = $("#input-date").val()

        const data = {
            title,
            category,
            cActivity,
            dateOfPublisher

        }
        listIpr.push(data)
        t.listIpr.set(listIpr)
    },
    "click .edit-paten"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const paten = t.listIpr.get()[index];
        $("#editInputJudulPaten").val(paten.title)
        $("#editInputKategoriKegiatan").val(paten.category)
        $("#editInputJenisKegiatan").val(paten.cActivity)
        $("#editInput-date").val(paten.dateOfPublisher)

        $('#editPatenModal').modal('show');
        Session.set('editedPatenIndex',index);

    },
    "click .save-paten"(e,t){
        e.preventDefault()
        const editedPatenIndex = Session.get('editedPatenIndex')
        const listIpr           = t.listIpr.get();
        const title             = $("#editInputJudulPaten").val()
        const category          = $("#editInputKategoriKegiatan").val()
        const cActivity         = $("#editInputJenisKegiatan").val()
        const dateOfPublisher   = $("#editInput-date").val()

        listIpr[editedPatenIndex] ={
            title,
            category,
            cActivity,
            dateOfPublisher
        }
        t.listIpr.set(listIpr);
        $('#editPatenModal').modal('hide');
        Session.set('editedPatenIndex',undefined)
    },

    "click .add-scholarship" (e, t){
        e.preventDefault()
        const listScholarship = t.listScholarship.get()
        const name  = $("#input-beasiswa-name").val()
        const category = $("#input-beasiswa-category").val()
        const startYear = $("#input-start-year").val()
        const endYear = $("#input-end-year").val()
        const isValidStartYear = /^[0-9]{4}$/.test(startYear);

        if (!isValidStartYear) {
            failAlert("Input Tahun Mulai harus terdiri dari 4 digit angka.");
            return;
        }

        const isValidEndYear = /^[0-9]{4}$/.test(endYear);

        if (!isValidEndYear) {
            failAlert("Input Tahun Selesai harus terdiri dari 4 digit angka.");
            return;
        }
        if (parseInt(startYear) > parseInt(endYear)) {
            failAlert("Input Tahun Mulai tidak boleh lebih besar dari Tahun Selesai.");
            return;
        }
        const data = {
            name,
            category,
            startYear,
            endYear
        }
        // console.log(data)
        listScholarship.push(data)
        t.listScholarship.set(listScholarship)
    },
    "click .edit-scholarship"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const scholarship = t.listScholarship.get()[index];
        $("#editInput-beasiswa-name").val(scholarship.name)
        $("#editInput-beasiswa-category").val(scholarship.category)
        $("#editInput-start-year").val(scholarship.startYear)
        $("#editInput-end-year").val(scholarship.endYear)

        $('#editScholarshipModal').modal('show');
        Session.set('editedScholarshipIndex',index);
    },

    "click .save-scholarship"(e,t){
        e.preventDefault()
        const editedScholarshipIndex = Session.get('editedScholarshipIndex')
        const listScholarship   = t.listScholarship.get();
        const name      = $("#editInput-beasiswa-name").val()
        const category  = $("#editInput-beasiswa-category").val()
        const startYear = $("#editInput-start-year").val()
        const endYear   = $("#editInput-end-year").val()

        listScholarship[editedScholarshipIndex] ={
            name,
            category,
            startYear,
            endYear
        }
        t.listScholarship.set(listScholarship);
        $('#editScholarshipModal').modal('hide');
        Session.set('editedScholarshipIndex',undefined)
    },

    "click .add-kesejahteraan" (e, t){
        e.preventDefault()
        const listKesejahteraan = t.listKesejahteraan.get()
        const serviceName  = $("#input-service-name").val()
        const category = $("#input-category-service").val()
        const organizer = $("#input-organizer").val()
        const startYear = $("#start-year-input").val()
        const endYear = $("#end-year-input").val()
        const isValidStartYear = /^[0-9]{4}$/.test(startYear);

        if (!isValidStartYear) {
            failAlert("Input Tahun Mulai harus terdiri dari 4 digit angka.");
            return;
        }

        const isValidEndYear = /^[0-9]{4}$/.test(endYear);

        if (!isValidEndYear) {
            failAlert("Input Tahun Selesai harus terdiri dari 4 digit angka.");
            return;
        }
        if (parseInt(startYear) > parseInt(endYear)) {
            failAlert("Input Tahun Mulai tidak boleh lebih besar dari Tahun Selesai.");
            return;
        }
        const data = {
            serviceName,
            category,
            organizer,
            startYear,
            endYear
        }
        // console.log(data)
        listKesejahteraan.push(data)
        t.listKesejahteraan.set(listKesejahteraan)
    },

    "click .edit-kesejahteraan"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik');
        const kesejahteraan = t.listKesejahteraan.get()[index];
        $("#editInput-service-name").val(kesejahteraan.serviceName)
        $("#editInput-category-service").val(kesejahteraan.category)
        $("#editInput-organizer").val(kesejahteraan.organizer)
        $("#editStart-year-input").val(kesejahteraan.startYear)
        $("#editEnd-year-input").val(kesejahteraan.endYear)

        $('#editKesejahteraanModal').modal('show');
        Session.set('editedKesejahteraanIndex',index);

    },
    "click .save-kesejahteraan"(e,t){
        e.preventDefault()
        const editedKesejahteraanIndex = Session.get('editedKesejahteraanIndex')
        const listKesejahteraan = t.listKesejahteraan.get();

        const serviceName  = $("#editInput-service-name").val()
        const category     = $("#editInput-category-service").val()
        const organizer    = $("#editInput-organizer").val()
        const startYear    = $("#editStart-year-input").val()
        const endYear      = $("#editEnd-year-input").val()

        listKesejahteraan[editedKesejahteraanIndex] = {
            serviceName,
            category,
            organizer,
            startYear,
            endYear
        }
        t.listKesejahteraan.set(listKesejahteraan);
        $('#editKesejahteraanModal').modal('hide');
        Session.set('editedKesejahteraanIndex',undefined)
    },

    "click .add-coaching" (e,t){
        e.preventDefault()
        const listCoachingLevel = t.listCoachingLevel.get()
        const coachingLevel = $("#inputCoachingLevel").val()
        const place = $("#inputCoachingPlace").val()
        const periode = $("#inputPeriode").val()

        const data = {
            coachingLevel,
            place,
            periode
        }
        listCoachingLevel.push(data)
        t.listCoachingLevel.set(listCoachingLevel)
    },
    "click .edit-coaching"(e,t){
        e.preventDefault
        const index = $(e.currentTarget).data('milik');
        const coaching = t.listCoachingLevel.get()[index];
        $("#editInputCoachingLevel").val(coaching.coachingLevel)
        $("#editInputCoachingPlace").val(coaching.place)
        $("#editInputPeriode").val(coaching.periode)

        $('#editCoachingModal').modal('show');
        Session.set('editedCoachingIndex',index);

    },
    "click .save-coaching"(e,t){
        e.preventDefault()
        const editedCoachingIndex = Session.get('editedCoachingIndex')
        const listCoachingLevel = t.listCoachingLevel.get();
        const coachingLevel = $("#editInputCoachingLevel").val()
        const place         = $("#editInputCoachingPlace").val()
        const periode       = $("#editInputPeriode").val()

        listCoachingLevel[editedCoachingIndex] = {
            coachingLevel,
            place,
            periode
        }
        t.listCoachingLevel.set(listCoachingLevel);
        $('#editCoachingModal').modal('hide');
        Session.set('editedCoachingIndex',undefined)



    },

    "click .add-tunjangan" (e, t){
        e.preventDefault()
        const listTunjangan = t.listTunjangan.get()
        const name  = $("#input-allowance").val()
        const type = $("#input-allowance-type").val()
        const institution = $("#input-institution").val()
        const source = $("#input-funding-source").val()
        const startYear = $("#input-year-start").val()
        const endYear = $("#input-year-end").val()
        let nominal = $("#input-nominal").val()

        nominal = nominal.replace(/\D/g, '');

        if (!/^\d+$/.test(nominal)) {
            failAlert("Nominal harus berupa angka.");
            return;
        }

        const isValidStartYear = /^[0-9]{4}$/.test(startYear);

        if (!isValidStartYear) {
            failAlert("Input Tahun Mulai harus terdiri dari 4 digit angka.");
            return;
        }

        const isValidEndYear = /^[0-9]{4}$/.test(endYear);

        if (!isValidEndYear) {
            failAlert("Input Tahun Selesai harus terdiri dari 4 digit angka.");
            return;
        }
        if (parseInt(startYear) > parseInt(endYear)) {
            failAlert("Input Tahun Mulai tidak boleh lebih besar dari Tahun Selesai.");
            return;
        }
        const data = {
            name,
            type,
            institution,
            source,
            startYear,
            endYear,
            nominal: parseInt(nominal)
        }
        // console.log(data)
        listTunjangan.push(data)
        t.listTunjangan.set(listTunjangan)
    },
    "click .edit-tunjangan"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik')
        const tunjangan = t.listTunjangan.get()[index];

        $("#editInput-allowance").val(tunjangan.name)
        $("#editInput-allowance-type").val(tunjangan.type)
        $("#editInput-institution").val(tunjangan.institution)
        $("#editInput-funding-source").val(tunjangan.source)
        $("#editInput-year-start").val(tunjangan.startYear)
        $("#editInput-year-end").val(tunjangan.endYear)
        $("#editInput-nominal").val(tunjangan.nominal)

        $('#editTunjanganModal').modal('show');
        Session.set('editedTunjanganIndex',index);
    },
    "click .save-tunjangan"(e,t){
        e.preventDefault()
        const editedTunjanganIndex = Session.get('editedTunjanganIndex')
        const listTunjangan = t.listTunjangan.get();
        const name         = $("#editInput-allowance").val()
        const type         = $("#editInput-allowance-type").val()
        const institution  = $("#editInput-institution").val()
        const source       = $("#editInput-funding-source").val()
        const startYear    = $("#editInput-year-start").val()
        const endYear      = $("#editInput-year-end").val()
        let nominal        = $("#editInput-nominal").val()

        nominal = nominal.replace(/\D/g, '');

        if (!/^\d+$/.test(nominal)) {
            failAlert("Nominal harus berupa angka.");
            return;
        }

        const isValidStartYear = /^[0-9]{4}$/.test(startYear);

        if (!isValidStartYear) {
            failAlert("Input Tahun Mulai harus terdiri dari 4 digit angka.");
            return;
        }

        const isValidEndYear = /^[0-9]{4}$/.test(endYear);

        if (!isValidEndYear) {
            failAlert("Input Tahun Selesai harus terdiri dari 4 digit angka.");
            return;
        }
        if (parseInt(startYear) > parseInt(endYear)) {
            failAlert("Input Tahun Mulai tidak boleh lebih besar dari Tahun Selesai.");
            return;
        }
        listTunjangan[editedTunjanganIndex]={
            name,
            type,
            institution,
            source,
            startYear,
            endYear,
            nominal: parseInt(nominal)
        }
        t.listTunjangan.set(listTunjangan);
        $('#editTunjanganModal').modal('hide');
        Session.set('editedTunjanganIndex',undefined);
    },

    "click .add-Dedication" (e, t){
        e.preventDefault()
        const listDedication = t.listDedication.get()
        const name  = $("#inputActivityName").val()
        const theme = $("#inputActivityTheme").val()
        const year = $("#inputYearActivity").val()
        const duration = $("#inputDuration").val()
        const data = {
            name,
            theme,
            year,
            duration

        }
        // console.log(data)
        listDedication.push(data)
        t.listDedication.set(listDedication)
    },
    "click .edit-Dedication"(e,t){
        e.preventDefault()
        const index = $(e.currentTarget).data('milik')
        const dedication = t.listDedication.get()[index];

        $("#editInputActivityName").val(dedication.name)
        $("#editInputActivityTheme").val(dedication.theme)
        $("#editInputYearActivity").val(dedication.year)
        $("#editInputDuration").val(dedication.duration)

        $('#editDedicationModal').modal('show');
        Session.set('editedDedicationIndex',index);
    },
    "click .save-Dedication"(e,t){
        e.preventDefault()
        const editedDedicationIndex = Session.get('editedDedicationIndex')
        const listDedication = t.listDedication.get();
        const name         = $("#editInputActivityName").val()
        const theme        = $("#editInputActivityTheme").val()
        const year         = $("#editInputYearActivity").val()
        const duration     = $("#editInputDuration").val()

        const data = {
            name,
            theme,
            year,
            duration
        }

        listDedication[editedDedicationIndex] = data;
        t.listDedication.set(listDedication);
        $('#editDedicationModal').modal('hide');
        Session.set('editedDedicationIndex', undefined);
    },

    "click .add-speaker" (e, t){
        e.preventDefault()
        const listSpeaker = t.listSpeaker.get()
        const category  = $("#activityInputCategory").val()
        const title = $("#inputPaperTitle").val()
        const conference = $("#inputAcademicConferenceName").val()
        const organizer = $("#inputOrganizerName").val()
        const date = $("#yearDateInput").val()
        const dateEnd =  $("#yearDateInputEnd").val()
        const data = {
            category,
            title,
            conference,
            organizer,
            date,
            dateEnd
        }
        // console.log(data)
        listSpeaker.push(data)
        t.listSpeaker.set(listSpeaker)
    },
    'click .edit-speaker'(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const speaker = t.listSpeaker.get()[index];

        $("#editInputCategory").val(speaker.category);
        $("#editInputPaperTitle").val(speaker.title);
        $("#editInputAcademicConferenceName").val(speaker.conference);
        $("#editInputOrganizerName").val(speaker.organizer);
        $("#editYearDateInput").val(speaker.date);
        $("#editYearDateInputEnd").val(speaker.dateEnd);

        $('#editSpeakerModal').modal('show');

        Session.set('editedSpeakerIndex', index);
    },
    'click .save-speaker'(e, t) {
        e.preventDefault();
        const editedSpeakerIndex = Session.get('editedSpeakerIndex');
        const listSpeaker = t.listSpeaker.get();

        const category  = $("#editInputCategory").val();
        const title = $("#editInputPaperTitle").val();
        const conference = $("#editInputAcademicConferenceName").val();
        const organizer = $("#editInputOrganizerName").val();
        const date = $("#editYearDateInput").val();
        const dateEnd =  $("#editYearDateInputEnd").val();

        listSpeaker[editedSpeakerIndex] = {
            category,
            title,
            conference,
            organizer,
            date,
            dateEnd
        };

        t.listSpeaker.set(listSpeaker);

        $('#editSpeakerModal').modal('hide');

        Session.set('editedSpeakerIndex', undefined);
    },

    "click .add-journalManager" (e, t){
        e.preventDefault();
        console.log("Add Journal Manager clicked");
        const listJournalManager = t.listJournalManager.get();
        const name  = $("#inputNamaJurnal").val();
        const noSkPenugasan = $("#inputNoSkPenugasan").val();
        const peran = $("#inputPeran").val();
        const startDate = $("#inputStartDate").val();
        let endDate;
        const endDateCheckboxJournal = $("#endDateNow").prop("checked");
        if (endDateCheckboxJournal) {
            endDate = "Sampai Sekarang";
        } else {
            endDate = $("#inputEndDate").val();
        }
        const data = {
            name,
            noSkPenugasan,
            peran,
            startDate,
            endDate
        };
        listJournalManager.push(data);
        t.listJournalManager.set(listJournalManager);
    },
    "click .edit-journalManager"(e,t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const journalManager = t.listJournalManager.get()[index];

        $("#editInputNamaJurnal").val(journalManager.name);
        $("#editInputNoSkPenugasan").val(journalManager.noSkPenugasan);
        $("#editInputPeran").val(journalManager.peran);
        $("#editInputStartDate").val(journalManager.startDate);
        if (journalManager.endDate === "Sampai Sekarang") {
            $("#endDateNowEdit").prop("checked", true);
            $("#editInputEndDate").prop("disabled", true);
        } else {
            $("#editInputEndDate").val(journalManager.endDate);
        }

        $('#editJournalManagerModal').modal('show');
        Session.set('editedJournalManagerIndex', index);
    },
    "click .save-journalManager"(e,t){
        e.preventDefault();
        const editedJournalManagerIndex = Session.get('editedJournalManagerIndex');
        const listJournalManager = t.listJournalManager.get();
        const name           = $("#editInputNamaJurnal").val();
        const noSkPenugasan = $("#editInputNoSkPenugasan").val();
        const peran          = $("#editInputPeran").val();
        const startDate      = $("#editInputStartDate").val();
        let endDate;
        const endDateCheckboxJournal = $("#endDateNowEdit").prop("checked");
        if (endDateCheckboxJournal) {
            endDate = "Sampai Sekarang";
        } else {
            endDate = $("#editInputEndDate").val();
        }
        const data = {
            name,
            noSkPenugasan,
            peran,
            startDate,
            endDate
        };

        listJournalManager[editedJournalManagerIndex] = data;
        t.listJournalManager.set(listJournalManager);
        $('#editJournalManagerModal').modal('hide');
        Session.set('editedJournalManagerIndex', undefined);
    },

    "click .add-others-media" (e, t){
        e.preventDefault();
        console.log("Add Other Media clicked");
        const listOthersMedia = t.listOthersMedia.get();
        const name  = $("#inputNamaJurnalOthers").val();
        const noSkPenugasan = $("#inputNoSkPenugasanOthers").val();
        const peran = $("#inputPeranOthers").val();
        const startDate = $("#inputStartDateOthers").val();
        // const endDateImaviStructure = $("inputEndDateImavi").val();

        let endDateOtherMedia;
        const endDateCheckboxOther = $("#endDateOthersNow").prop("checked");
        if (endDateCheckboxOther) {
            endDateOtherMedia = "Sampai Sekarang";
        }else {
            endDateOtherMedia = $("#inputEndDateOthers").val();
        }
        const data = {
            name,
            noSkPenugasan,
            peran,
            startDate,
            endDateOtherMedia
        };
        listOthersMedia.push(data);
        t.listOthersMedia.set(listOthersMedia);
    },
    "click .edit-others-media"(e,t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const othersMedia = t.listOthersMedia.get()[index];

        $("#editInputNamaJurnalOthers").val(othersMedia.name);
        $("#editInputNoSkPenugasanOthers").val(othersMedia.noSkPenugasan);
        $("#editInputPeranOthers").val(othersMedia.peran);
        $("#editInputStartDateOthers").val(othersMedia.startDate);
        if (othersMedia.endDateOtherMedia === "Sampai Sekarang") {
            $("#endDateOthersNowEdit").prop("checked", true);
            $("#editInputEndDateOthers").prop("disabled", true);
        } else {
            $("#editInputEndDateOthers").val(othersMedia.endDateOtherMedia);
        }

        $('#editOthersMediaModal').modal('show');
        Session.set('editedOthersMediaIndex', index);
    },

    "click .save-others-media"(e,t){
        e.preventDefault();
        const editedOthersMediaIndex = Session.get('editedOthersMediaIndex');
        const listOthersMedia = t.listOthersMedia.get();
        const name           = $("#editInputNamaJurnalOthers").val();
        const noSkPenugasan = $("#editInputNoSkPenugasanOthers").val();
        const peran          = $("#editInputPeranOthers").val();
        const startDate      = $("#editInputStartDateOthers").val();
        let endDateOtherMedia;
        const endDateCheckboxOther = $("#endDateOthersNowEdit").prop("checked");
        if (endDateCheckboxOther) {
            endDateOtherMedia = "Sampai Sekarang";
        } else {
            endDateOtherMedia = $("#editInputEndDateOthers").val();
        }
        const data = {
            name,
            noSkPenugasan,
            peran,
            startDate,
            endDateOtherMedia
        };

        listOthersMedia[editedOthersMediaIndex] = data;
        t.listOthersMedia.set(listOthersMedia);
        $('#editOthersMediaModal').modal('hide');
        Session.set('editedOthersMediaIndex', undefined);
    },
    "click .add-imavistructure" (e, t){
        e.preventDefault();
        console.log("Add Imavi Struktur clicked");
        const listImaviStructure = t.listImaviStructure.get();
        const name  = $("#inputJabatanStruktural").val();
        const noSk = $("#inputNomorSkImavi").val();
        const startDate = $("#inputStartDateImavi").val();
        // const endDateImaviStructure = $("inputEndDateImavi").val();

        let endDateImaviStructure;
        const endDateCheckboxImavi = $("#endDateImaviNow").prop("checked");
        if (endDateCheckboxImavi) {
            endDateImaviStructure = "Sampai Sekarang";
        }else {
            endDateImaviStructure = $("#inputEndDateImavi").val();
        }
        const data = {
            name,
            noSk,
            startDate,
            endDateImaviStructure
        };
        listImaviStructure.push(data);
        t.listImaviStructure.set(listImaviStructure);
    },
    "click .edit-imavistructure"(e,t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const imaviStructure = t.listImaviStructure.get()[index];

        $("#editInputJabatanStruktural").val(imaviStructure.name);
        $("#editInputNomorSkImavi").val(imaviStructure.noSk);
        $("#editInputStartDateImavi").val(imaviStructure.startDate);
        if (imaviStructure.endDateImaviStructure === "Sampai Sekarang") {
            $("#endDateImaviNowEdit").prop("checked", true);
            $("#editInputEndDateImavi").prop("disabled", true);
        } else {
            $("#editInputEndDateImavi").val(imaviStructure.endDateImaviStructure);
        }

        $('#editImaviStructureModal').modal('show');
        Session.set('editedImaviStructureIndex', index);
    },

    "click .save-imavistructure"(e,t){
        e.preventDefault();
        const editedImaviStructureIndex = Session.get('editedImaviStructureIndex');
        const listImaviStructure = t.listImaviStructure.get();
        const name           = $("#editInputJabatanStruktural").val();
        const noSk          = $("#editInputNomorSkImavi").val();
        const startDate      = $("#editInputStartDateImavi").val();
        let endDateImaviStructure;
        const endDateCheckboxImavi = $("#endDateImaviNowEdit").prop("checked");
        if (endDateCheckboxImavi) {
            endDateImaviStructure = "Sampai Sekarang";
        } else {
            endDateImaviStructure = $("#editInputEndDateImavi").val();
        }
        const data = {
            name,
            noSk,
            startDate,
            endDateImaviStructure
        };

        listImaviStructure[editedImaviStructureIndex] = data;
        t.listImaviStructure.set(listImaviStructure);
        $('#editImaviStructureModal').modal('hide');
        Session.set('editedImaviStructureIndex', undefined);
    },

    "click .add-profesi" (e, t){
        e.preventDefault()
        const listProfesi = t.listProfesi.get()
        const name  = $("#inputNamaOrganisasi").val()
        const peran = $("#inputPeranProfesi").val()
        const startDate = $("#inputStartDateProfesi").val()
        const endDate = $("#inputEndDateProfesi").val()
        const instansi = $("#inputInstansiProfesi").val()
        const data = {
            name,
            peran,
            startDate,
            endDate,
            instansi
        }
        // console.log(data)
        listProfesi.push(data)
        t.listProfesi.set(listProfesi)
    },
    "click .edit-profesi" (e, t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const profesi = t.listProfesi.get()[index];

        $("#editInputNamaOrganisasi").val(profesi.name);
        $("#editInputPeranProfesi").val(profesi.peran);
        $("#editInputStartDateProfesi").val(profesi.startDate);
        $("#editInputEndDateProfesi").val(profesi.endDate);
        $("#editInputInstansiProfesi").val(profesi.instansi);

        $('#editProfesiModal').modal('show');
        Session.set('editedProfesiIndex', index);
    },

    "click .save-profesi" (e, t){
        e.preventDefault();
        const editedProfesiIndex = Session.get('editedProfesiIndex');
        const listProfesi = t.listProfesi.get();
        const name = $("#editInputNamaOrganisasi").val();
        const peran = $("#editInputPeranProfesi").val();
        const startDate = $("#editInputStartDateProfesi").val();
        const endDate = $("#editInputEndDateProfesi").val();
        const instansi = $("#editInputInstansiProfesi").val();

        const data = {
            name,
            peran,
            startDate,
            endDate,
            instansi
        };

        listProfesi[editedProfesiIndex] = data;
        t.listProfesi.set(listProfesi);
        $('#editProfesiModal').modal('hide');
        Session.set('editedProfesiIndex', undefined);
    },



    "click .add-award" (e, t){
        e.preventDefault()
        const listAward = t.listAward.get()
        const name  = $("#inputNamaPenghargaan").val()
        const type = $("#inputJenisPenghargaan").val()
        const year = $("#inputTahunPenghargaan").val()
        const instansi = $("#inputInstansiPenghargaan").val()
        const data = {
            name,
            type,
            year,
            instansi
        }
        // console.log(data)
        listAward.push(data)
        t.listAward.set(listAward)
    },

    "click .edit-award" (e, t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const award = t.listAward.get()[index];

        $("#editInputNamaPenghargaan").val(award.name);
        $("#editInputJenisPenghargaan").val(award.type);
        $("#editInputTahunPenghargaan").val(award.year);
        $("#editInputInstansiPenghargaan").val(award.instansi);

        $('#editAwardModal').modal('show');
        Session.set('editedAwardIndex', index);
    },

    "click .save-award" (e, t){
        e.preventDefault();
        const editedAwardIndex = Session.get('editedAwardIndex');
        const listAward = t.listAward.get();
        const name = $("#editInputNamaPenghargaan").val();
        const type = $("#editInputJenisPenghargaan").val();
        const year = $("#editInputTahunPenghargaan").val();
        const instansi = $("#editInputInstansiPenghargaan").val();

        const data = {
            name,
            type,
            year,
            instansi
        };

        listAward[editedAwardIndex] = data;
        t.listAward.set(listAward);
        $('#editAwardModal').modal('hide');
        Session.set('editedAwardIndex', undefined);
    },



    "click .add-bimbingan" (e, t){
        e.preventDefault()
        const listBimbingan = t.listBimbingan.get()
        const name = $("#inputName").val()
        const title = $("#inputJudul").val()
        const category = $("#inputJenisBimbingan").val()
        const pembimbingCategory = $("#input-jenis-pembimbing").val()
        const bidangKeilmuan = $("#inputBidangKeilmuanPembimbing").val()
        const programStudi = $("#inputProgramStudi").val()
        const lembagaName = $("#inputNamaLembaga").val()
        const endDate = $("#inputTahun").val()
        const isValidEndDate = /^[0-9]{4}$/.test(endDate);

        if (!isValidEndDate) {
            failAlert("Input Tahun harus terdiri dari 4 digit angka.");
            return;
        }
        const data = {
            name,
            title,
            category,
            pembimbingCategory,
            programStudi,
            bidangKeilmuan,
            lembagaName,
            endDate
        }
        // console.log(data)
        listBimbingan.push(data)
        t.listBimbingan.set(listBimbingan)
    },
    "click .edit-bimbingan" (e, t){
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const bimbingan = t.listBimbingan.get()[index];

        $("#editInputName").val(bimbingan.name);
        $("#editInputJudul").val(bimbingan.title);
        $("#editInputJenisBimbingan").val(bimbingan.category);
        $("#editInput-jenis-pembimbing").val(bimbingan.pembimbingCategory);
        $("#editInputBidangKeilmuanPembimbing").val(bimbingan.bidangKeilmuan);
        $("#editInputProgramStudi").val(bimbingan.programStudi);
        $("#editInputNamaLembaga").val(bimbingan.lembagaName);
        $("#editInputTahun").val(bimbingan.endDate);

        $('#editBimbinganModal').modal('show');
        Session.set('editedBimbinganIndex', index);
    },

    "click .save-bimbingan" (e, t){
        e.preventDefault();
        const editedBimbinganIndex = Session.get('editedBimbinganIndex');
        const listBimbingan = t.listBimbingan.get();
        const name = $("#editInputName").val();
        const title = $("#editInputJudul").val();
        const category = $("#editInputJenisBimbingan").val();
        const pembimbingCategory = $("#editInput-jenis-pembimbing").val();
        const bidangKeilmuan = $("#editInputBidangKeilmuanPembimbing").val();
        const programStudi = $("#editInputProgramStudi").val();
        const lembagaName = $("#editInputNamaLembaga").val();
        const endDate = $("#editInputTahun").val();

        const isValidEndDate = /^[0-9]{4}$/.test(endDate);

        if (!isValidEndDate) {
            failAlert("Input Tahun harus terdiri dari 4 digit angka.");
            return;
        }

        const data = {
            name,
            title,
            category,
            pembimbingCategory,
            programStudi,
            bidangKeilmuan,
            lembagaName,
            endDate
        };

        listBimbingan[editedBimbinganIndex] = data;
        t.listBimbingan.set(listBimbingan);
        $('#editBimbinganModal').modal('hide');
        Session.set('editedBimbinganIndex', undefined);
    },

    "click .add-certification" (e, t){
        e.preventDefault()
        const listCertification = t.listCertification.get()
        const type = $("#inputCertificationType").val()
        const major = $("#inputCertificationMajor").val()
        const registrationNumber = $("#inputRegistrationNumber").val()
        const skNumber = $("#inputSkNumber").val()
        const organizer = $("#inputCertificationOrganiser").val()
        const grade = $("#inputCertificationGrade").val()
        // const dateStart = $("#inputCertificationStart").val()
        const dateEnd = $("#inputCertificationEnd").val()
        const file = $("#inputFileSk").prop("files")[0]



        const isValidDateEnd = /^[0-9]{4}$/.test(dateEnd);

        if (!isValidDateEnd) {
            failAlert("Input Date End harus terdiri dari 4 digit angka.");
            return;
        }
        const data = {
            type,
            major,
            registrationNumber,
            skNumber,
            organizer,
            grade,
            // dateStart,
            dateEnd
        }
        if (file) {
            data.skFile = file
        }
        // console.log(data)
        listCertification.push(data)
        t.listCertification.set(listCertification)

        if (file){
            const reader = new FileReader()
            reader.addEventListener('load', function () {
                $('.link-'+(listCertification.length-1) +"").attr('href', this.result)
            });
            reader.readAsDataURL(file);
        //   console.log(t.listCertification.get());
        }

    },
    "click .edit-certification"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const certification = t.listCertification.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputCertificationType").val(certification.type);
        $("#editInputCertificationMajor").val(certification.major);
        $("#editInputRegistrationNumber").val(certification.registrationNumber);
        $("#editInputSkNumber").val(certification.skNumber);
        $("#editInputCertificationOrganiser").val(certification.organizer);
        $("#editInputCertificationGrade").val(certification.grade);
        $("#editInputCertificationEnd").val(certification.dateEnd);

        $('#editCertificationModal').modal('show');
        Session.set('editedCertificationIndex', index);
    },

    "click .save-certification"(e, t) {
        e.preventDefault();
        const editedCertificationIndex = Session.get('editedCertificationIndex');
        const listCertification = t.listCertification.get();
        const type = $("#editInputCertificationType").val();
        const major = $("#editInputCertificationMajor").val();
        const registrationNumber = $("#editInputRegistrationNumber").val();
        const skNumber = $("#editInputSkNumber").val();
        const organizer = $("#editInputCertificationOrganiser").val();
        const grade = $("#editInputCertificationGrade").val();
        const dateEnd = $("#editInputCertificationEnd").val();

        const isValidRegistrationNumber = /^\d+$/.test(registrationNumber); // Hanya angka
        if (!isValidRegistrationNumber) {
            failAlert("Nomor Registrasi hanya boleh berisi angka.");
            return;
        }

        const isValidDateEnd = /^[0-9]{4}$/.test(dateEnd);
        if (!isValidDateEnd) {
            failAlert("Input Date End harus terdiri dari 4 digit angka.");
            return;
        }

        const data = {
            type,
            major,
            registrationNumber,
            skNumber,
            organizer,
            grade,
            dateEnd
        };

        listCertification[editedCertificationIndex] = data;
        t.listCertification.set(listCertification);
        $('#editCertificationModal').modal('hide');
        Session.set('editedCertificationIndex', undefined);
    },



    "click .add-bahanAjar"(e, t){
        e.preventDefault()
        const listBahanAjar = t.listBahanAjar.get()
        const title = $("#inputJudulBahanAjar").val()
        const isbn = $("#inputIsbnBahanAjar").val()
        const publishDate = $("#inputTanggalTerbitBahanAjar").val()
        const publisher = $("#inputPenerbitBahanAjar").val()
        const data = {
            title,
            isbn,
            publishDate,
            publisher
        }
        listBahanAjar.push(data)
        t.listBahanAjar.set(listBahanAjar)
    },
    "click .edit-bahanAjar"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const bahanAjar = t.listBahanAjar.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputJudulBahanAjar").val(bahanAjar.title);
        $("#editInputIsbnBahanAjar").val(bahanAjar.isbn);
        $("#editInputTanggalTerbitBahanAjar").val(bahanAjar.publishDate);
        $("#editInputPenerbitBahanAjar").val(bahanAjar.publisher);

        $('#editBahanAjarModal').modal('show');
        Session.set('editedBahanAjarIndex', index);
    },

    "click .save-bahanAjar"(e, t) {
        e.preventDefault();
        const editedBahanAjarIndex = Session.get('editedBahanAjarIndex');
        const listBahanAjar = t.listBahanAjar.get();
        const title = $("#editInputJudulBahanAjar").val();
        const isbn = $("#editInputIsbnBahanAjar").val();
        const publishDate = $("#editInputTanggalTerbitBahanAjar").val();
        const publisher = $("#editInputPenerbitBahanAjar").val();

        const data = {
            title,
            isbn,
            publishDate,
            publisher
        };

        listBahanAjar[editedBahanAjarIndex] = data;
        t.listBahanAjar.set(listBahanAjar);
        $('#editBahanAjarModal').modal('hide');
        Session.set('editedBahanAjarIndex', undefined);
    },

    "click .add-journal"(e,t){
        e.preventDefault()
        const listJournal = t.listJournal.get()
        const category =$("#inputJenisPenulisan").val()
        const title = $("#inputJudulJournal").val()
        const doi =  $("#inputDoi").val()
        const name =  $("#inputNama").val()
        const volume =  $("#inputVolume").val()
        const number =  $("#inputNomor").val()
        const year =  $("#inputYearJournal").val()
        const cJournal =  $("#inputCategoryJournal").val()
        const link =  $("#inputURLJournal").val()
        const data = {
            category,
            title,
            doi,
            name,
            volume,
            number,
            year,
            cJournal,
            link
        }
        listJournal.push(data)
        t.listJournal.set(listJournal)
    },
    "click .edit-journal"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const journal = t.listJournal.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputJenisPenulisan").val(journal.category);
        $("#editInputJudulJournal").val(journal.title);
        $("#editInputDoi").val(journal.doi);
        $("#editInputNama").val(journal.name);
        $("#editInputVolume").val(journal.volume);
        $("#editInputNomor").val(journal.number);
        $("#editInputYearJournal").val(journal.year);
        $("#editInputCategoryJournal").val(journal.cJournal);
        $("#editInputURLJournal").val(journal.link);

        $('#editJournalModal').modal('show');
        Session.set('editedJournalIndex', index);
    },

    "click .save-journal"(e, t) {
        e.preventDefault();
        const editedJournalIndex = Session.get('editedJournalIndex');
        const listJournal = t.listJournal.get();
        const category = $("#editInputJenisPenulisan").val();
        const title = $("#editInputJudulJournal").val();
        const doi = $("#editInputDoi").val();
        const name = $("#editInputNama").val();
        const volume = $("#editInputVolume").val();
        const number = $("#editInputNomor").val();
        const year = $("#editInputYearJournal").val();
        const cJournal = $("#editInputCategoryJournal").val();
        const link = $("#editInputURLJournal").val();

        const data = {
            category,
            title,
            doi,
            name,
            volume,
            number,
            year,
            cJournal,
            link
        };

        listJournal[editedJournalIndex] = data;
        t.listJournal.set(listJournal);
        $('#editJournalModal').modal('hide');
        Session.set('editedJournalIndex', undefined);
    },

    "click .add-project"(e,t){
        e.preventDefault()
        const listProject = t.listProject.get()
        const title = $("#inputJudul").val()
        const study = $("#inputBidangKeilmuan").val()
        const year = $("#inputTahunPelaksanaan").val()
        const duration = $("#inputLamaKegiatan").val()
        const link  = $("#inputStatus").val()
        const data = {
            title,
            study,
            year,
            duration,
            link
        }
        listProject.push(data)
        t.listProject.set(listProject)
    },
    "click .edit-project"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const project = t.listProject.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputJudul").val(project.title);
        $("#editInputBidangKeilmuan").val(project.study);
        $("#editInputTahunPelaksanaan").val(project.year);
        $("#editInputLamaKegiatan").val(project.duration);
        $("#editInputStatus").val(project.link);

        $('#editProjectModal').modal('show');
        Session.set('editedProjectIndex', index);
    },

    "click .save-project"(e, t) {
        e.preventDefault();
        const editedProjectIndex = Session.get('editedProjectIndex');
        const listProject = t.listProject.get();
        const title = $("#editInputJudul").val();
        const study = $("#editInputBidangKeilmuan").val();
        const year = $("#editInputTahunPelaksanaan").val();
        const duration = $("#editInputLamaKegiatan").val();
        const link = $("#editInputStatus").val();

        const data = {
            title,
            study,
            year,
            duration,
            link
        };

        listProject[editedProjectIndex] = data;
        t.listProject.set(listProject);
        $('#editProjectModal').modal('hide');
        Session.set('editedProjectIndex', undefined);
    },
    "click .add-pengujian" (e, t){
        e.preventDefault()
        const listPengujian = t.listPengujian.get()
        const name = $("#inputPengujianName").val()
        const type = $("#inputJenisPengujian").val()
        const title = $("#inputJudulPengujian").val()
        const category = $("#inputKategoriKegiatanPengujian").val()
        const bidangKeilmuan = $("#inputBidangKeilmuanPengujian").val()
        const ps = $("#inputProgramStudiPengujian").val()
        const lembaga = $("#inputNamaLembagaPengujian").val()
        const dateEnd = $("#inputTahunSelesaiPengujian").val()
        const semester = $("#inputSemesterPengujian").val()

        const data = {
            name,
            type,
            title,
            category,
            bidangKeilmuan,
            ps,
            lembaga,
            dateEnd,
            semester
        }

        listPengujian.push(data)
        t.listPengujian.set(listPengujian)

    },
    "click .edit-pengujian"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const pengujian = t.listPengujian.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputPengujianName").val(pengujian.name);
        $("#editInputJenisPengujian").val(pengujian.type);
        $("#editInputJudulPengujian").val(pengujian.title);
        $("#editInputKategoriKegiatanPengujian").val(pengujian.category);
        $("#editInputBidangKeilmuanPengujian").val(pengujian.bidangKeilmuan);
        $("#editInputProgramStudiPengujian").val(pengujian.ps);
        $("#editInputNamaLembagaPengujian").val(pengujian.lembaga);
        $("#editInputTahunSelesaiPengujian").val(pengujian.dateEnd);
        $("#editInputSemesterPengujian").val(pengujian.semester);

        $('#editPengujianModal').modal('show');
        Session.set('editedPengujianIndex', index);
    },

    "click .save-pengujian"(e, t) {
        e.preventDefault();
        const editedPengujianIndex = Session.get('editedPengujianIndex');
        const listPengujian = t.listPengujian.get();
        const name = $("#editInputPengujianName").val();
        const type = $("#editInputJenisPengujian").val();
        const title = $("#editInputJudulPengujian").val();
        const category = $("#editInputKategoriKegiatanPengujian").val();
        const bidangKeilmuan = $("#editInputBidangKeilmuanPengujian").val();
        const ps = $("#editInputProgramStudiPengujian").val();
        const lembaga = $("#editInputNamaLembagaPengujian").val();
        const dateEnd = $("#editInputTahunSelesaiPengujian").val();
        const semester = $("#editInputSemesterPengujian").val();

        const data = {
            name,
            type,
            title,
            category,
            bidangKeilmuan,
            ps,
            lembaga,
            dateEnd,
            semester
        };

        listPengujian[editedPengujianIndex] = data;
        t.listPengujian.set(listPengujian);
        $('#editPengujianModal').modal('hide');
        Session.set('editedPengujianIndex', undefined);
    },

    "click .add-kerjapenugasan"(e, t){
        e.preventDefault()
        const listKerjaPenugasan = t.listKerjaPenugasan.get()
        const name = $("#inputName").val()
        const place = $("#inputPlace").val()
        const period = $("#inputPeriod").val()
        const notes = $("#inputNotes").val()


        const data = {
            name,
            place,
            period,
            notes
        }

        console.log(data)
        listKerjaPenugasan.push(data)
        t.listKerjaPenugasan.set(listKerjaPenugasan)
    },
    "click .edit-kerjapenugasan"(e, t) {
        e.preventDefault();
        const index = $(e.currentTarget).data('milik');
        const kerjaPenugasan = t.listKerjaPenugasan.get()[index];

        // Mengisi nilai-nilai input di modal edit
        $("#editInputName").val(kerjaPenugasan.name);
        $("#editInputPlace").val(kerjaPenugasan.place);
        $("#editInputPeriod").val(kerjaPenugasan.period);
        $("#editInputNotes").val(kerjaPenugasan.notes);

        $('#editKerjaPenugasanModal').modal('show');
        Session.set('editedKerjaPenugasanIndex', index);
    },

    "click .save-kerjapenugasan"(e, t) {
        e.preventDefault();
        const editedKerjaPenugasanIndex = Session.get('editedKerjaPenugasanIndex');
        const listKerjaPenugasan = t.listKerjaPenugasan.get();
        const name = $("#editInputName").val();
        const place = $("#editInputPlace").val();
        const period = $("#editInputPeriod").val();
        const notes = $("#editInputNotes").val();


        const data = {
            name,
            place,
            period,
            notes
        };

        listKerjaPenugasan[editedKerjaPenugasanIndex] = data;
        t.listKerjaPenugasan.set(listKerjaPenugasan);
        $('#editKerjaPenugasanModal').modal('hide');
        Session.set('editedKerjaPenugasanIndex', undefined);
    },

    "click .remove-list" (e, t){
        e.preventDefault()
        const index = $(e.target).data("milik")
        const identifier = $(e.target).data("id");
        // const listExperiences = t.listExperiences.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listCertification = t.listCertification.get()
        const listKerjaPenugasan = t.listKerjaPenugasan.get()
        const listPengajaran = t.listPengajaran.get()
        const listBimbingan = t.listBimbingan.get()
        const listPengujian = t.listPengujian.get()
        const listBahanAjar = t.listBahanAjar.get()
        const listProject = t.listProject.get()
        const listPublicationTypes = t.listPublicationTypes.get()
        const listJournal = t.listJournal.get()
        const listMagazine = t.listMagazine.get()
        const listOtherPublication =t.listOtherPublication.get()
        const listIpr = t.listIpr.get()
        const listScholarship = t.listScholarship.get()
        const listKesejahteraan = t.listKesejahteraan.get()
        const listTunjangan = t.listTunjangan.get()
        const listDedication = t.listDedication.get()
        const listSpeaker = t.listSpeaker.get()
        const listJournalManager = t.listJournalManager.get()
        const listOthersMedia = t.listOthersMedia.get()
        const listImaviStructure = t.listImaviStructure.get()
        const listProfesi = t.listProfesi.get()
        const listAward = t.listAward.get()
        const listresearchinterest = t.listresearchinterest.get()
        const listStudentGuidance = t.listStudentGuidance.get()
        const listCoachingLevel = t.listCoachingLevel.get()
        const listEmail = t.listEmail.get()



        confirmationAlertAsync().then(async function (result) {
            if (result.value){
                // if (identifier === "experiences"){
                //     listExperiences.splice(index, 1)
                //     t.listExperiences.set(listExperiences)
                if (identifier === "education"){
                    listEducationalHistory.splice(index, 1)
                    t.listEducationalHistory.set(listEducationalHistory)
                } else if (identifier === "certification") {
                    listCertification.splice(index, 1)
                    t.listCertification.set(listCertification)
                } else if (identifier === "kerjapenugasan" ) {
                    listKerjaPenugasan.splice(index, 1)
                    t.listKerjaPenugasan.set(listKerjaPenugasan)
                } else if (identifier === "pengajaran"){
                    listPengajaran.splice(index, 1)
                    t.listPengajaran.set(listPengajaran)
                } else if (identifier === "bimbingan"){
                    listBimbingan.splice(index, 1)
                    t.listBimbingan.set(listBimbingan)
                } else if (identifier === "pengujian"){
                    listPengujian.splice(index, 1)
                    t.listPengujian.set(listPengujian)
                } else if (identifier === "bahanAjar"){
                    listBahanAjar.splice(index, 1)
                    t.listBahanAjar.set(listBahanAjar)
                } else if (identifier === "project"){
                    listProject.splice(index, 1)
                    t.listProject.set(listProject)
                } else if (identifier === "publicationTypes"){
                    listPublicationTypes.splice(index, 1)
                    t.listPublicationTypes.set(listPublicationTypes)
                } else if (identifier === "listJournal"){
                    listJournal.splice(index,1)
                    t.listJournal.set(listJournal)
                } else if (identifier === "magazine"){
                    listMagazine.splice(index, 1)
                    t.listMagazine.set(listMagazine)
                } else if (identifier === "otherPublication"){
                    listOtherPublication.splice(index, 1)
                    t.listOtherPublication.set(listOtherPublication)
                } else if (identifier === "paten"){
                    listIpr.splice(index, 1)
                    t.listIpr.set(listIpr)
                } else if (identifier === "sholarship"){
                    listScholarship.splice(index, 1)
                    t.listScholarship.set(listScholarship)
                } else if (identifier === "kesejahteraan"){
                    listKesejahteraan.splice(index, 1)
                    t.listKesejahteraan.set(listKesejahteraan)
                } else if (identifier === "tunjangan"){
                    listTunjangan.splice(index, 1)
                    t.listTunjangan.set(listTunjangan)
                } else if (identifier === "dedication"){
                    listDedication.splice(index, 1)
                    t.listDedication.set(listDedication)
                } else if (identifier === "speaker"){
                    listSpeaker.splice(index, 1)
                    t.listSpeaker.set(listSpeaker)
                } else if (identifier === "journalManager"){
                    listJournalManager.splice(index, 1)
                    t.listJournalManager.set(listJournalManager)
                } else if (identifier === "others-media"){
                    listOthersMedia.splice(index, 1)
                    t.listOthersMedia.set(listOthersMedia)
                } else if (identifier === "imavi-structure"){
                    listImaviStructure.splice(index, 1)
                    t.listImaviStructure.set(listImaviStructure)
                } else if (identifier === "profesi"){
                    listProfesi.splice(index, 1)
                    t.listProfesi.set(listProfesi)
                } else if (identifier === "award"){
                    listAward.splice(index, 1)
                    t.listAward.set(listAward)
                } else if (identifier === "researchInterest"){
                    listresearchinterest.splice(index, 1)
                    t.listresearchinterest.set(listresearchinterest)
                } else if (identifier === "coaching"){
                    listCoachingLevel.splice(index, 1)
                    t.listCoachingLevel.set(listCoachingLevel)
                } else if(identifier === "guidanceStudent") {
                    listStudentGuidance.splice(index,1)
                    t.listStudentGuidance.set(listStudentGuidance)
                } else if(identifier === "email") {
                    listEmail.splice(index,1)
                    t.listEmail.set(listEmail)
                }
            }
        })
    },

    'click .btnNavigation' (e, t){
        e.preventDefault()
        const getValue = $(e.target).attr('data-value');
        t.formPage.set(getValue);
    },
    'click .btn-next' (e, t){
        e.preventDefault()
        const formData = t.formData.get();
        // console.log(formData);

        const getValue = $(e.currentTarget).val();
        // console.log(getValue)
        if (getValue == 1){
            if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
                const username = $("#inputUsername").val();
                const fullName = $("#inputFullname").val();
                const phoneNumber = $("#inputPhoneNumber").val();
                const nik = $("#inputNik").val();
                const nidn = $("#inputNidn").val();

                const isValidUsername = /^[a-zA-Z0-9]{6,20}$/.test(username);
                const isValidFullName = /^[a-zA-Z\s]+$/.test(fullName);
                const isValidPhoneNumber = /^[0-9]+$/.test(phoneNumber);
                const isValidNIK = /^\d{16}$/.test(nik);
                const isValidNIDN = /^\d{10}$/.test(nidn);
                let errorMessage = "";

                if (!isValidUsername) {
                    errorMessage += "Username tidak valid.\n";
                }

                if (!isValidFullName) {
                    errorMessage += "Nama lengkap tidak valid.\n";
                }

                if (!isValidPhoneNumber) {
                    errorMessage += "Nomor telepon tidak valid.\n";
                }

                if (!isValidNIK) {
                    errorMessage += "NIK harus terdiri dari 16 digit angka.\n";
                }


                if (!isValidNIDN) {
                    errorMessage += "NIDN harus terdiri dari 10 digit angka.\n";
                }

                if (errorMessage !== "") {
                    failAlert("Inputan anda salah. Mohon periksa:\n" + errorMessage);
                    return;
                }

                formData.imageFile = $('#inputImageProfile')[0].files[0];
                formData.username = $("#inputUsername").val();
                formData.fullName = $("#inputFullname").val();
                formData.pob = $("#inputPob").val();
                formData.dob = $("#inputDob").val();
                formData.gender = $("input[name=inputGender]:checked").val();
                formData.nik = $("#inputNik").val();
                formData.registeredAddress = $("#inputRegisteredAddress").val();
                formData.address = $("#inputAddress").val();
                formData.phoneNumber = $("#inputPhoneNumber").val();
                formData.religion = $("#inputReligion").val();
                formData.nationality = $("#inputNationality").val();
                formData.startDateImavi = $("#inputStartDateImaviLecture").val();
                formData.statusImavi = $("#inputImaviStatus").val();
                formData.startDateLecture = $("#inputStartDateLecture").val();
                formData.nidn = $("#inputNidn").val();
                formData.startDateLectureOther = $("#inputStartDateLectureOther").val();
                formData.anotherStatus = $("#inputAnotherStatus").val();
                formData.startDateAnotherStatus = $("#inputAnotherStartDate").val();
                formData.position = $("#inputPosition").val();
                formData.startDatePosition = $("#inputStartdatePosition").val();
                formData.academicRank = $("#inputAcademicRank").val();
                formData.startDateAcademicRank = $("#inputdateStartPosition").val();

                formData.dateDeaconOrdination  = $("#inputDateDeaconOrdination").val();
                formData.placeDeaconOrdination  = $("#inputPlaceDeaconOrdination").val();
                formData.datePriesthoodOrdination  = $("#inputDatePriesthoodOrdination").val();
                formData.placePriesthoodOrdination  = $("#inputPlacePriesthoodOrdination").val();
                formData.datePerpetualVows  = $("#inputDatePerpetualVows").val();
                formData.placePerpetualVows  = $("#inputPlacePerpetualVows").val();
                formData.congregationalAffiliation  = $("#inputCongregationalAffiliation").val();

                t.formPage.set(getValue);
                t.formData.set(formData)
            } else {
                failAlert("Pastikan username, Nama, Tempat Lahir, Tanggal Lahir,  Jenis Kelamin, NIK, Agama sudah diisi !")
            }

        } else if (getValue == 3){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 4){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 5){
            t.formPage.set(getValue);
            t.formData.set(formData)
        }
        else if (getValue == 6){
            t.formPage.set(getValue);
            t.formData.set(formData)
        }
    },
    'click .btn-previous' (e, t){
        e.preventDefault()
        const getValue = $(e.currentTarget).val();
        t.formPage.set(getValue);
    },
    async 'click #btn-submit' (e, t){
        e.preventDefault()
        const submitType = t.submitType.get()
        const formData = t.formData.get()

        //saat create dosen
        if (submitType === 1){
            formData.imageFile = $('#inputImageProfile')[0].files[0];
            formData.username = $("#inputUsername").val();
            formData.fullName = $("#inputFullname").val();
            formData.pob = $("#inputPob").val();
            formData.dob = $("#inputDob").val();
            formData.gender = $("input[name=inputGender]:checked").val();
            formData.nik = $("#inputNik").val();
            formData.registeredAddress = $("#inputRegisteredAddress").val();
            formData.address = $("#inputAddress").val();
            formData.phoneNumber = $("#inputPhoneNumber").val();
            formData.religion = $("#inputReligion").val();
            formData.nationality = $("#inputNationality").val();
            formData.startDateImavi = $("#inputStartDateImaviLecture").val();
            formData.statusImavi = $("#inputImaviStatus").val();
            formData.startDateLecture = $("#inputStartDateLecture").val();
            formData.nidn = $("#inputNidn").val();
            formData.startDateLectureOther = $("#inputStartDateLectureOther").val();
            formData.anotherStatus = $("#inputAnotherStatus").val();
            formData.startDateAnotherStatus = $("#inputAnotherStartDate").val();
            formData.position = $("#inputPosition").val();
            formData.startDatePosition = $("#inputStartdatePosition").val();
            formData.academicRank = $("#inputAcademicRank").val();
            formData.startDateAcademicRank = $("#inputdateStartPosition").val();
            formData.dateDeaconOrdination  = $("#inputDateDeaconOrdination").val();
            formData.placeDeaconOrdination  = $("#inputPlaceDeaconOrdination").val();
            formData.datePriesthoodOrdination  = $("#inputDatePriesthoodOrdination").val();
            formData.placePriesthoodOrdination  = $("#inputPlacePriesthoodOrdination").val();
            formData.datePerpetualVows  = $("#inputDatePerpetualVows").val();
            formData.placePerpetualVows  = $("#inputPlacePerpetualVows").val();
            formData.congregationalAffiliation  = $("#inputCongregationalAffiliation").val();


            if (formData.imageFile){
                const uploadData = {
                    type: 'dosen-profilePics',
                    Body: formData.imageFile
                };
                const fileLink = await uploadFiles(uploadData)
                formData.imageLink = fileLink
                delete formData.imageFile
            }
        }
        const listCertification = t.listCertification.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listKerjaPenugasan = t.listKerjaPenugasan.get()
        const listPengujian = t.listPengujian.get()
        const listBahanAjar = t.listBahanAjar.get()
        const listProject = t.listProject.get()
        const listPublicationTypes = t.listPublicationTypes.get()
        const listresearchinterest = t.listresearchinterest.get()
        const listAward = t.listAward.get()
        const listBimbingan = t.listBimbingan.get()
        const listCoachingLevel = t.listCoachingLevel.get()
        const listDedication = t.listDedication.get()
        const listImaviStructure = t.listImaviStructure.get()
        const listIpr=t.listIpr.get()
        const listJournal=t.listJournal.get()
        const listJournalManager=t.listJournalManager.get()
        const listKesejahteraan = t.listKesejahteraan.get()
        const listMagazine =t.listMagazine.get()
        const listOtherPublication=t.listOtherPublication.get()
        const listOthersMedia = t.listOthersMedia.get()
        const listPengajaran = t.listPengajaran.get()
        const listProfesi = t.listProfesi.get()
        const listScholarship = t.listScholarship.get()
        const listSpeaker = t.listSpeaker.get()
        const listStudentGuidance = t.listStudentGuidance.get()
        const listTunjangan =t.listTunjangan.get()
        const listEmail = t.listEmail.get()


        confirmationAlertAsync().then(async function (result) {
            if (result.value) {
                formData.listCertification = listCertification
                formData.listEducationalHistory = listEducationalHistory
                formData.listKerjaPenugasan = listKerjaPenugasan
                formData.listPengujian = listPengujian
                formData.listBahanAjar = listBahanAjar
                formData.listProject = listProject
                formData.listPublicationTypes = listPublicationTypes
                formData.listresearchinterest = listresearchinterest
                formData.listAward = listAward
                formData.listBimbingan=listBimbingan
                formData.listCoachingLevel =listCoachingLevel
                formData.listDedication = listDedication
                formData.listImaviStructure = listImaviStructure
                formData.listIpr=listIpr
                formData.listJournal=listJournal
                formData.listJournalManager=listJournalManager
                formData.listKesejahteraan = listKesejahteraan
                formData.listMagazine =listMagazine
                formData.listOtherPublication=listOtherPublication
                formData.listOthersMedia = listOthersMedia
                formData.listPengajaran = listPengajaran
                formData.listProfesi = listProfesi
                formData.listScholarship = listScholarship
                formData.listSpeaker = listSpeaker
                formData.listStudentGuidance = listStudentGuidance
                formData.listTunjangan =listTunjangan
                formData.listEmail = listEmail

                if (formData.imageFile){
                    const uploadData = {
                        type: 'dosen-profilePics',
                        Body: formData.imageFile
                    };
                    const fileLink = await uploadFiles(uploadData)
                    formData.imageLink = fileLink
                    delete formData.imageFile
                }

                for (const iterator of formData.listCertification) {
                    // console.log(iterator)
                    if (iterator.skFile){
                        const uploadData = {
                            type: 'dosen-sk',
                            Body: iterator.skFile
                        };
                        const fileLink = await uploadFiles(uploadData)
                        iterator.fileLink = fileLink
                        delete iterator.skFile
                    }
                }
                let postRoute = "dosen.insert"
                if (submitType === 2){
                    postRoute = "dosen.update"
                    formData._id = FlowRouter.getParam("_id")
                }
                Meteor.call(postRoute, formData, async function (err, res) {
                    if (err) {
                        failAlert(err);
                    } else {
                        successAlert("Data berhasil disimpan");
                        FlowRouter.go("/")
                    }
                });
            }
        });
    },
    async 'click .btn-personal' (e, t) {
        e.preventDefault()
        const formData = t.formData.get();
        const getValue = $(e.currentTarget).val();
        // 1 = data pribadi, 2 = identitas nasional, 3 = pengalaman profesi terbaru, 4 = pengalaman profesi sebelumnya, 5 = riwayat pendidikan, 6 = sertifikasi, 7 = bidang penelitian yang diminati
        confirmationAlertAsync().then(async function (result) {
            if (result.value) {
                if (getValue == 1){
                    // if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputEmail").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
                        formData.imageFile = $('#inputImageProfile')[0].files[0];
                        formData.username = $("#inputUsername").val();
                        formData.fullName = $("#inputFullname").val();
                        formData.pob = $("#inputPob").val();
                        formData.dob = $("#inputDob").val();
                        formData.gender = $("input[name=inputGender]:checked").val();
                        formData.nik = $("#inputNik").val();
                        formData.registeredAddress = $("#inputRegisteredAddress").val();
                        formData.address = $("#inputAddress").val();
                        formData.phoneNumber = $("#inputPhoneNumber").val();
                        formData.religion = $("#inputReligion").val();
                        formData.nationality = $("#inputNationality").val();
                        formData.startDateImavi = $("#inputStartDateImaviLecture").val();
                        formData.statusImavi = $("#inputImaviStatus").val();
                        formData.startDateLecture = $("#inputStartDateLecture").val();
                        formData.nidn = $("#inputNidn").val();
                        formData.startDateLectureOther = $("#inputStartDateLectureOther").val();
                        formData.anotherStatus = $("#inputAnotherStatus").val();
                        formData.startDateAnotherStatus = $("#inputAnotherStartDate").val();
                        formData.position = $("#inputPosition").val();
                        formData.startDatePosition = $("#inputStartdatePosition").val();
                        formData.academicRank = $("#inputAcademicRank").val();
                        formData.startDateAcademicRank = $("#inputdateStartPosition").val();
                        formData.dateDeaconOrdination  = $("#inputDateDeaconOrdination").val();
                        formData.placeDeaconOrdination  = $("#inputPlaceDeaconOrdination").val();
                        formData.datePriesthoodOrdination  = $("#inputDatePriesthoodOrdination").val();
                        formData.placePriesthoodOrdination  = $("#inputPlacePriesthoodOrdination").val();
                        formData.datePerpetualVows  = $("#inputDatePerpetualVows").val();
                        formData.placePerpetualVows  = $("#inputPlacePerpetualVows").val();
                        formData.congregationalAffiliation  = $("#inputCongregationalAffiliation").val();


                        if (formData.imageFile){
                            const uploadData = {
                                type: 'dosen-profilePics',
                                Body: formData.imageFile
                            };
                            const fileLink = await uploadFiles(uploadData)
                            formData.imageLink = fileLink
                            delete formData.imageFile
                        }
                    // }
                    else {
                        failAlert("Pastikan Username, Nama, Tempat Lahir, Tanggal Lahir,  Jenis Kelamin, NIK, Agama sudah diisi !");
                    }
                }

                Meteor.call("dosen.update", formData, async function (err, res) {
                    if (err) {
                        failAlert(err);
                    } else {
                        successAlert("Data berhasil diubah");
                        FlowRouter.go("/")
                    }
                });
            }
        });
    },
});

Template.passwordEdit.events({
    'click #editPassword' (e, t) {
        e.preventDefault();
        const userId = FlowRouter.getParam("_id");
        const old = $("#old-password").val()
        const newPassword = $("#new-password").val()
        const confirmation = $("#confirmation-password").val()

        if (old === "" || newPassword === "" || confirmation === "" ){
            failAlert("Pastikan semua Field terisi !")
        }
        else {
            if (newPassword !== confirmation){
                failAlert("Password baru dan konfirmasi password tidak sama !")
            }
            else {
                const data = {
                    userId,
                    old,
                    newPassword
                }
                Meteor.call("users.changePassword", data, function (error, result) {
                    if (error) {
                        failAlert(error)
                    }
                    else {
                        successAlert("Berhasil mengubah password")
                        FlowRouter.go("/")
                    }
                });
            }
        }
    },
    'click .hover-icon' (e, t) {
        history.back();
    },
    'click .toggle-password' (e, t) {
        const inputId = $(e.target).data("id");
        const input = t.find('#' + inputId);
        const icon = $(e.target);

        if (input.type === 'password') {
            input.type = 'text';
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    },
})