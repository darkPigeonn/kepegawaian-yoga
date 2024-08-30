import "./card.html";


Template.cardTimeline.helpers({
    labelTimeline(actionId) {
        switch (actionId) {
            case 10 :
                return "Keringanan Terbuat";
            case 11 :
                return "Keringanan Terkirim ke Perwakilan";
            case 60 :
                return "Keringanan Tersetujui Perwakilan";
            case 90 :
                return "Keringanan Tertolak Perwakilan";
            default:
                return "Keringanan Terhapus";
        }
    }
})