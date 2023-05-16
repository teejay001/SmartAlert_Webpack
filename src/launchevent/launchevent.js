/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

function onMessageSendHandler(event) {
  Office.context.mailbox.item.body.getAsync("text", { asyncContext: event }, getBodyCallback);
}

function getBodyCallback(asyncResult) {
  let event = asyncResult.asyncContext;
  let body = "";
  if (asyncResult.status !== Office.AsyncResultStatus.Failed && asyncResult.value !== undefined) {
    body = asyncResult.value;
  } else {
    let message = "Failed to get body text";
    console.error(message);
    event.completed({ allowEvent: false, errorMessage: message });
    return;
  }

  let matches = hasMatches(body);
  if (matches) {
    Office.context.mailbox.item.getAttachmentsAsync({ asyncContext: event }, getAttachmentsCallback);
  } else {
    event.completed({ allowEvent: true });
  }
}

function hasMatches(body) {
  if (body == null || body == "") {
    return false;
  }

  const arrayOfTerms = ["send", "picture", "document", "attachment"];
  for (let index = 0; index < arrayOfTerms.length; index++) {
    const term = arrayOfTerms[index].trim();
    const regex = RegExp(term, "i");
    if (regex.test(body)) {
      return true;
    }
  }

  return false;
}

function getAttachmentsCallback(asyncResult) {
  let event = asyncResult.asyncContext;
  if (asyncResult.value.length > 0) {
    for (let i = 0; i < asyncResult.value.length; i++) {
      if (asyncResult.value[i].isInline == false) {
        event.completed({ allowEvent: true });
        return;
      }
    }

    event.completed({ allowEvent: false, errorMessage: "Looks like you forgot to include an attachment2 on email?" });
  } else {
    event.completed({
      allowEvent: false,
      errorMessage: "Looks like you're forgetting to include an attachment2 on email?",
    });
  }
}

// IMPORTANT: To ensure your add-in is supported in the Outlook client on Windows, remember to map the event handler name specified in the manifest's LaunchEvent element to its JavaScript counterpart.
// 1st parameter: FunctionName of LaunchEvent in the manifest; 2nd parameter: Its implementation in this .js file.
if (Office.context.platform === Office.PlatformType.PC || Office.context.platform == null) {
  Office.actions.associate("onMessageSendHandler", onMessageSendHandler);
}
