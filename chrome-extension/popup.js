chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        return { isPDF: document.contentType === "application/pdf" };
      },
    },
    (tab) => {
      if (!tab) {
        openEditorButton.textContent = "Open SimplePDF";
        return;
      }

      const [
        {
          result: { isPDF },
        },
      ] = tab;

      openEditorButton.textContent = isPDF
        ? "Edit with SimplePDF"
        : "Open SimplePDF";
    }
  );
});

const setConfig = () => {
  window.simplePDF = {
    isDebug: false,
    companyIdentifier: "chrome",
    disableInit: true,
  };
};

const openEditor = () => {
  const currentURL = document.location.href;

  const isPDF = document.contentType === "application/pdf";

  const href = isPDF ? currentURL : null;

  window.simplePDF.createModal({ href });
};

openEditorButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: setConfig,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["./node_modules/@simplepdf/web-embed-pdf/dist/index.js"],
  });

  setTimeout(() => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: openEditor,
      },
      (injectionResults) => {
        if (injectionResults === undefined) {
          openEditorButton.style.display = "none";
          errorMessage.textContent = "SimplePDF cannot be opened in this page";
          errorDetails.textContent = "Try navigating to a different page";
          return;
        }

        window.close();
      }
    );
  }, 100);
});