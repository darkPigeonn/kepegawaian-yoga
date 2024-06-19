import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import "./modals.html";
Template.fancyBox.onRendered(function () {
  Fancybox.bind("[data-fancybox]", {
    // Custom options for FancyBox
    on: {
      reveal: (fancybox, slide) => {
        if (slide.src.endsWith(".pdf")) {
          fancybox.setContent(`
                  <iframe src="${slide.src}" frameborder="0" allowfullscreen></iframe>
              `);
        }
      },
    },
  });
});

Template.fancyBox.helpers({
  isPDF(url) {
    console.log(url);
    return url.endsWith(".pdf");
  },
  pdfUrl(url) {
    return url.toLowerCase().endsWith(".pdf")
      ? "/viewer?url=" + encodeURIComponent(url)
      : url;
  },
});
