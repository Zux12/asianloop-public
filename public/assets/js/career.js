document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const buttons = document.querySelectorAll(".career-select");
  const section = document.getElementById("applicationSection");
  const form = document.getElementById("careerForm");
  const typeInput = document.getElementById("applicationType");
  const formTitle = document.getElementById("formTitle");
  const formIntro = document.getElementById("formIntro");
  const msg = document.getElementById("careerMsg");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetFormBtn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      typeInput.value = type;

      if (type === "internship") {
        formTitle.textContent = "Internship Application Form";
        formIntro.textContent =
          "Please complete the form below to apply for internship placement with Asianloop.";
      } else {
        formTitle.textContent = "Career Application Form";
        formIntro.textContent =
          "Please complete the form below to apply for career opportunities with Asianloop.";
      }

      section.style.display = "block";
      msg.textContent = "";
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    msg.textContent = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!typeInput.value) {
      msg.textContent = "Please select Career Opportunities or Internship Programme first.";
      return;
    }

    const formData = new FormData(form);

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    msg.textContent = "Submitting your application. Please do not close this page.";

    try {
      const response = await fetch("/api/career/apply", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Application submission failed.");
      }

      msg.textContent =
        "Thank you. Your application has been submitted successfully. A confirmation email has been sent to you.";
      form.reset();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      msg.textContent = err.message || "Unable to submit application. Please try again later.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Application";
    }
  });
});
