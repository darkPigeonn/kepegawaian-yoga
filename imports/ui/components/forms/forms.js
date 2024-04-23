import "./forms.html";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


Template.formLecturers.onCreated(function () {
    const self = this;
    self.formPage = new ReactiveVar(1);
    self.formData = new ReactiveVar({});
    self.listExperiences = new ReactiveVar([])
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

    const lecturerId = FlowRouter.getParam("_id");
    const mode = lecturerId ? "edit" : "add";
    self.pageMode.set(mode);
});



Template.formLecturers.onRendered( function(){
    const context = Template.instance();
    if (this.submitType.get() === 2) {
        const id = FlowRouter.getParam("_id")
        Meteor.call("dosen.getDetails", id, function (err, res) {
            if (err) {
                failAlert("Dosen Tidak Ditemukan!");
                history.back();
            } else {
                context.formData.set(res)
                context.listExperiences.set(res.listExperiences)
                context.listEducationalHistory.set(res.listEducationalHistory)
                context.listCertification.set(res.listCertification)
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
                context.listCoachingLevel.set(res.listCoachingLevel)
                context.listStudentGuidance.set(res.listStudentGuidance)
                context.listresearchinterest.set(res.listresearchinterest)
            
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
    listExperiences(){
        return Template.instance().listExperiences.get()
    },
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

    "click #add-history" (e, t){
        e.preventDefault()
        const listEducationalHistory = t.listEducationalHistory.get()
        const educationLevel = $("#inputEducationLevel").val()
        const major = $("#inputEducationMajor").val()
        const institution = $("#inputEducationInstitution").val()
        const studyPublication = $("#inputStudyPublication").val()
        const domesticStatus = $("input[name=inputDomestic]:checked").val()
        const dateEnd = $("#inputEducationEnd").val()  
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
    "click .add-publication" (e,t){
        e.preventDefault()
        const listPublicationTypes = t.listPublicationTypes.get()
        const category = $("#inputJenisKarya").val()
        const title = $("#inputJudul").val()
        const isbn = $("#inputIsbn").val()
        const publisher =$("#inputPenerbit").val()
        const city = $("#inputKotaPenerbit").val()
        const year = $("#inputTahunTerbit").val()
        const link = $("#inputURL").val()
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
    "click .add-student-guidance" (e,t){
        e.preventDefault()
        const listStudentGuidance = t.listStudentGuidance.get()
        const category = $("#inputCategoryActivity").val()
        const title = $("#inputTitleActivity").val()
        const cStudy = $("#inputCategoryStudy").val()
        const semester =$("#inputSemester").val()
     
        const data ={
            category,
            title,
            cStudy,
            semester
        }
        listStudentGuidance.push(data)
        t.listStudentGuidance.set(listStudentGuidance)
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

    "click .add-scholarship" (e, t){
        e.preventDefault()
        const listScholarship = t.listScholarship.get()
        const name  = $("#input-beasiswa-name").val()
        const category = $("#input-beasiswa-category").val()
        const startYear = $("#input-start-year").val()
        const endYear = $("#input-end-year").val()
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

    "click .add-kesejahteraan" (e, t){
        e.preventDefault()
        const listKesejahteraan = t.listKesejahteraan.get()
        const serviceName  = $("#input-service-name").val()
        const category = $("#input-category-service").val()
        const organizer = $("#input-organizer").val()
        const startYear = $("#start-year-input").val()
        const endYear = $("#end-year-input").val()
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

    "click .add-tunjangan" (e, t){
        e.preventDefault()
        const listTunjangan = t.listTunjangan.get()
        const name  = $("#input-allowance").val()
        const type = $("#input-allowance-type").val()
        const institution = $("#input-institution").val()
        const source = $("#input-funding-source").val()
        const startYear = $("#input-year-start").val()
        const endYear = $("#input-year-end").val()
        const data = {
            name,
            type,
            institution,
            source,
            startYear,
            endYear
        }
        // console.log(data)
        listTunjangan.push(data)
        t.listTunjangan.set(listTunjangan)
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

    "click .add-speaker" (e, t){
        e.preventDefault()
        const listSpeaker = t.listSpeaker.get()
        const category  = $("#activityInputCategory").val()
        const title = $("#inputPaperTitle").val()
        const conference = $("#inputAcademicConferenceName").val()
        const organizer = $("#inputOrganizerName").val()
        const date = $("#yearDateInput").val()
        const data = {
            listSpeaker,
            category,
            title,
            conference,
            organizer,
            date
        }
        // console.log(data)
        listSpeaker.push(data)
        t.listSpeaker.set(listSpeaker)
    },

    "click .add-journalManager" (e, t){
        e.preventDefault();
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
    
    "click .add-others-media" (e, t){
        e.preventDefault();
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
    
    "click .add-imavistructure" (e, t){
        e.preventDefault();
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


    "click .add-bimbingan" (e, t){
        e.preventDefault()
        const listBimbingan = t.listBimbingan.get()
        const name = $("#inputName").val()
        const title = $("#inputJudul").val()
        const pembimbingCategory = $("#input-jenis-pembimbing").val()
        const bidangKeilmuan = $("#inputBidangKeilmuanPembimbing").val()
        const programStudi = $("#inputProgramStudi").val()
        const lembagaName = $("#inputNamaLembaga").val()
        const endDate = $("#inputTahun").val()
        const data = {
            name,
            title,
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
    "click .remove-list" (e, t){
        e.preventDefault()
        const index = $(e.target).data("milik")
        const identifier = $(e.target).data("id");
        const listExperiences = t.listExperiences.get()
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
        


        confirmationAlertAsync().then(async function (result) {
            if (result.value){
                if (identifier === "experiences"){
                    listExperiences.splice(index, 1)
                    t.listExperiences.set(listExperiences)
                } else if (identifier === "education"){
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
                }
            }
        })
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
        
        const data = {
            name,
            type,
            title,
            category,
            bidangKeilmuan,
            ps,
            lembaga,
            dateEnd
        }

        listPengujian.push(data)
        t.listPengujian.set(listPengujian)

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
    "click #add-experience" (e, t){
        e.preventDefault()
        const listExperiences = t.listExperiences.get()
        const jobPosition = $("#inputJobPosition").val()
        const institution = $("#inputInstitution").val()
        const startDate = $("#inputStartDate").val()
        const endDate = $("#inputEndDate").val()
        const data = {
            jobPosition,
            institution,
            startDate,
            endDate
        }
        listExperiences.push(data)
        t.listExperiences.set(listExperiences)
        // console.log(t.listExperiences.get())
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
        console.log(getValue)
        if (getValue == 2){
            if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputEmail").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
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
                formData.email = $("#inputEmail").val();
                formData.religion = $("#inputReligion").val();
                formData.nationality = $("#inputNationality").val();
                formData.startDateImavi = $("#inputStartDateImaviLecture").val();
                formData.statusImavi = $("#inputImaviStatus").val();
                formData.nidn = $("#inputNidn").val();
                formData.startDateLecture = $("#inputStartDateLecture").val();
                formData.anotherStatus = $("#inputAnotherStatus").val();
                formData.position = $("#inputPosition").val();
                formData.startDatePosition = $("#inputStartdatePosition").val();
                formData.academicRank = $("#inputAcademicRank").val();
                formData.startDateAcademicRank = $("#inputdateStartPosition").val()

               
                t.formPage.set(getValue);
                t.formData.set(formData)
            } else {
                failAlert("Pastikan username, Nama, Tempat Lahir, Tanggal Lahir,  Jenis Kelamin, NIK, Agama sudah diisi !")
            }
            
        } else if (getValue == 3){
            formData.listExperience = $("#inputListExperience").val()
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 4){
            formData.listEducationalHistory = $("#inputListHistory").val()
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 5){
            t.formPage.set(getValue);
            t.formData.set(formData)
        }
        else if (getValue == 6){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 7){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 8){
            t.formPage.set(getValue);
            t.formData.set(formData)
        } else if (getValue == 9){
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
        const researchInterest = $("#inputResearchInterest").val()
        const formData = t.formData.get()
        const listCertification = t.listCertification.get()
        const listEducationalHistory = t.listEducationalHistory.get()
        const listExperiences = t.listExperiences.get()
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
    

        confirmationAlertAsync().then(async function (result) {
            if (result.value) {
                formData.researchInterest = researchInterest
                formData.listCertification = listCertification
                formData.listEducationalHistory = listEducationalHistory
                formData.listExperiences = listExperiences
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
               

                // console.log(formData)

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
                    if ($("#inputUsername").val() !== "" && $("#inputFullname").val() != "" && $("#inputEmail").val() != "" && $("#inputAddress").val() !== "" && $("#inputPob").val() !== "" ){
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
                        formData.email = $("#inputEmail").val();
                        formData.religion = $("#inputReligion").val();
                        formData.nationality = $("#inputNationality").val();
                        formData.startDateImavi = $("#inputStartDateImaviLecture").val();
                        formData.statusImavi = $("#inputImaviStatus").val();
                        formData.nidn = $("#inputNidn").val();
                        formData.startDateLecture = $("#inputStartDateLecture").val();
                        formData.anotherStatus = $("#inputAnotherStatus").val();
                        formData.position = $("#inputPosition").val();
                        formData.startDatePosition = $("#inputStartdatePosition").val();
                        formData.academicRank = $("#inputAcademicRank").val();
                        formData.startDateAcademicRank = $("#inputdateStartPosition").val()
        
                       
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
                    else {
                        failAlert("Pastikan Username, Nama, Tempat Lahir, Tanggal Lahir,  Jenis Kelamin, NIK, Agama sudah diisi !");
                    }
                }
         
                else if(getValue == 4){
                    formData._id = FlowRouter.getParam("_id");
                    const listExperiences = t.listExperiences.get();
                    formData.listExperiences = listExperiences;
                }
                else if(getValue == 5){
                    formData._id = FlowRouter.getParam("_id");
                    const listEducationalHistory = t.listEducationalHistory.get();
                    formData.listEducationalHistory = listEducationalHistory;
                }
                else if(getValue == 6){
                    formData._id = FlowRouter.getParam("_id");
                    const listCertification = t.listCertification.get();
                    formData.listCertification = listCertification;
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
                }
                else if(getValue == 7){
                    formData._id = FlowRouter.getParam("_id");
                    const researchInterest = $("#inputResearchInterest").val();
                    formData.researchInterest = researchInterest;
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
    }
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