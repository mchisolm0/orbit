import { canOpenProtocol } from "./canOpenProtocol";
import { showInstallModal } from "./installModal";
import { boltIcon, htmlStringToElement } from "./utils";

// Returns a boolean indicating if the button was successfully injected
export function snackInjector() {
  // Check if Quick Lunch button already exists in DOM
  const button = document.querySelector('button[id="eas-quick-launch"]');
  if (button) {
    return true;
  }

  let expoGoURL: string | null = null;

  const iframe = document.querySelector("iframe");
  if (iframe && iframe instanceof HTMLIFrameElement) {
    const iframeSrc = new URL(iframe.src);
    expoGoURL = new URLSearchParams(iframeSrc.search).get("initialUrl");
  } else {
    const divElements = document.getElementsByTagName("div");
    for (const divElement of divElements) {
      if (divElement.textContent?.startsWith("exp://exp.host/")) {
        expoGoURL = divElement.textContent;
        break;
      }
    }
  }

  if (!expoGoURL) {
    return false;
  }

  const url = expoGoURL.replace("exp://", "expomenubar://");
  console.log("url", url);

  if (iframe) {
    return true;
  }

  // Copy run button style and attributes
  const runButton = Array.from(
    document.querySelectorAll("button span span")
  ).find((span) => span.textContent === "Run on device")?.parentNode
    ?.parentNode;

  if (!runButton) {
    return false;
  }

  const quickLaunchButton = runButton.cloneNode(true) as HTMLElement;
  quickLaunchButton.setAttribute("id", "eas-quick-launch");

  const icon = quickLaunchButton.querySelector("svg");
  icon?.parentNode?.replaceChild(htmlStringToElement(boltIcon), icon);

  const span = quickLaunchButton.querySelector("span span");
  if (span?.textContent) {
    span.textContent = "Quick Launch";
  }

  quickLaunchButton.addEventListener("click", function () {
    canOpenProtocol(url, showInstallModal, () => {});
  });

  // Insert quick launch button in DOM
  runButton.parentNode?.insertBefore(quickLaunchButton, runButton);

  return true;
}
