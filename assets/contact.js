document.addEventListener("DOMContentLoaded", () => {
  const tabs = [
    ...document.querySelectorAll("[data-request-tab]")
  ];

  const panels = [
    ...document.querySelectorAll("[data-request-panel]")
  ];

  function openPanel(name, updateUrl = true) {
    tabs.forEach(tab => {
      const active = tab.dataset.requestTab === name;

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    panels.forEach(panel => {
      const active = panel.dataset.requestPanel === name;

      panel.classList.toggle("active", active);
      panel.hidden = !active;
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

  if (requestedType === "dealer") {
    initialType = "dealer";
  }

  if (params.has("interest")) {
    initialType = "vehicle";
  }

  openPanel(initialType, false);

  const issue = params.get("issue");
  const ownerSymptoms = document.querySelector("#owner-symptoms");

  if (issue && ownerSymptoms && !ownerSymptoms.value) {
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

    ownerSymptoms.value =
      issueLabels[issue] || `${issue}: `;
  }
});