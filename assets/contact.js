document.addEventListener("DOMContentLoaded", () => {
  const tabs = [
    ...document.querySelectorAll("[data-request-tab]")
  ];

  const panels = [
    ...document.querySelectorAll("[data-request-panel]")
  ];

  const forms = [
    ...document.querySelectorAll(".request-form")
  ];

  function openPanel(name, updateUrl = true) {
    tabs.forEach(tab => {
      const isActive = tab.dataset.requestTab === name;

      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach(panel => {
      const isActive = panel.dataset.requestPanel === name;

      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("type", name);
      history.replaceState({}, "", url);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      openPanel(tab.dataset.requestTab);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("type");
  const validTypes = ["owner", "dealer", "vehicle"];

  let initialType = validTypes.includes(requestedType)
    ? requestedType
    : "owner";

  if (requestedType === "service") {
    initialType = "owner";
  }

  if (params.has("interest")) {
    initialType = "vehicle";
  }

  openPanel(initialType, false);

  prefillOwnerIssue(params);
  initializeFormSubmissions(forms);

  function prefillOwnerIssue(urlParams) {
    const issue = urlParams.get("issue");
    const symptoms = document.querySelector("#owner-symptoms");

    if (!issue || !symptoms || symptoms.value.trim()) {
      return;
    }

    const issueLabels = {
      charging: "Charging problem: ",
      warning: "Warning message or alert: ",
      computer: "Screen, computer, or module problem: ",
      "low-voltage": "Low-voltage battery or battery-drain concern: ",
      cooling: "Cooling or thermal-system concern: ",
      climate: "Air conditioning or heating concern: ",
      autopilot: "Camera, Autopilot, or driver-assistance concern: ",
      "high-voltage": "High-voltage or vehicle-will-not-drive concern: ",
      collision: "Post-collision concern: "
    };

    symptoms.value = issueLabels[issue] || `${issue}: `;
  }

  function initializeFormSubmissions(formElements) {
    formElements.forEach(form => {
      form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        removeFormMessage(form);

        const submitButton = form.querySelector(
          'button[type="submit"]'
        );

        const originalText =
          submitButton?.textContent.trim() || "Submit request";

        setSubmittingState(submitButton, true);

        try {
          const response = await fetch(form.action, {
            method: form.method || "POST",
            body: new FormData(form),
            headers: {
              Accept: "application/json"
            }
          });

          if (response.ok) {
            window.location.assign("thank-you.html");
            return;
          }

          const responseData = await response
            .json()
            .catch(() => null);

          const message = getFormspreeErrorMessage(responseData);

          showFormMessage(form, message);
        } catch (error) {
          console.error("Form submission error:", error);

          showFormMessage(
            form,
            "We could not connect to the form service. Please try again or call or text 385-477-8598."
          );
        } finally {
          setSubmittingState(
            submitButton,
            false,
            originalText
          );
        }
      });
    });
  }

  function setSubmittingState(
    button,
    isSubmitting,
    originalText = ""
  ) {
    if (!button) return;

    button.disabled = isSubmitting;
    button.setAttribute(
      "aria-busy",
      String(isSubmitting)
    );

    button.textContent = isSubmitting
      ? "Sending request..."
      : originalText;
  }

  function getFormspreeErrorMessage(responseData) {
    if (
      responseData?.errors &&
      Array.isArray(responseData.errors)
    ) {
      const messages = responseData.errors
        .map(error => error.message)
        .filter(Boolean);

      if (messages.length) {
        return messages.join(" ");
      }
    }

    return "We could not submit your request. Please review the form and try again.";
  }

  function showFormMessage(form, message) {
    const messageElement = document.createElement("div");

    messageElement.className =
      "form-submit-message form-submit-error";

    messageElement.setAttribute("role", "alert");
    messageElement.textContent = message;

    const submitArea = form.querySelector(
      ".form-submit-area"
    );

    if (submitArea) {
      submitArea.insertAdjacentElement(
        "beforebegin",
        messageElement
      );
    } else {
      form.appendChild(messageElement);
    }

    messageElement.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function removeFormMessage(form) {
    form
      .querySelectorAll(".form-submit-message")
      .forEach(element => element.remove());
  }
});