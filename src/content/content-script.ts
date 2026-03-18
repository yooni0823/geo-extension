import { extractPageData } from "../shared/extractors";
import type {
  ExtensionMessage,
  PageAnalysisResultMessage,
  RequestPageAnalysisMessage
} from "../shared/types";

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    sendResponse: (response: PageAnalysisResultMessage | undefined) => void
  ) => {
    if ((message as RequestPageAnalysisMessage).type !== "REQUEST_PAGE_ANALYSIS") {
      return false;
    }

    const response: PageAnalysisResultMessage = {
      type: "PAGE_ANALYSIS_RESULT",
      payload: extractPageData(document, window.location.href)
    };

    sendResponse(response);
    return false;
  }
);
