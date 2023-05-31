const lngDetector = new (require("languagedetect"))();

const EN = "english";
const DE = "german";
const supportedLanguages = [EN, DE];

const getUserPrompt = (lng, history, subject, recipient, content, name) => {
  if (history != "") {
    return (
      getHistoryPrompt(lng, history) +
      getPrompt(lng, subject, recipient, content, name)
    );
  }

  return getPrompt(lng, subject, recipient, content, name);
};

const getHistoryPrompt = (lng, history) => {
  // if history is more than 4000 words, cut it down to 4000 words, keeping the first 4000 words
  if (history.split(" ").length > 4000) {
    history = history.split(" ").slice(0, 4000).join(" ");
  }

  if (lng == EN)
    return `Include references to the prior email exchange: 
---
${history}
---
Refer back to our earlier conversations, and follow the recipient's style observed in our past discussions.
`;
  if (lng == DE)
    return `Beziehen Sie sich auf den vorherigen E-Mail-Austausch:
---
${history}
---
Verweisen Sie auf unsere früheren Unterhaltungen und folgen Sie dem Stil des Empfängers, wie er in unseren vorherigen Diskussionen beobachtet wurde.
`;
};

const getPrompt = (lng, subject, recipient, content, name) => {
  if (lng == EN)
    return `Compose an email for me ${name} to ${recipient} about ${subject}. The email should cover these points: 
---
${content}
---
Start with an improved version of the last subject. Write it as follows: "Subject: YOUR IMPROVED SUBJECT LINE\n". Start directly after that with the email content. Sign off with my name ${name}.`;

  if (lng == DE)
    return `Verfassen Sie für mich ${name} eine E-Mail an ${recipient} über ${subject}. Die E-Mail sollte diese Punkte abdecken:
---
${content}
---

Beginne mit einer verbesserten Version des letzten Betreffs. Schreibe diesen wie folgt: "Subject: YOUR IMPROVED SUBJECT LINE\n". Beginne direkt danach mit dem Inhalt der E-Mail. Unterschreibe mit meinem Namen ${name}.`;

  throw new Error("Language not supported.");
};

const getSystemPrompt = (lng, recipient, subject) => {
  if (lng == EN)
    return `You're an AI trained to draft professional emails. I require your assistance in writing an email to ${recipient} with a purpose: ${subject}.`;

  if (lng == DE)
    return `Sie sind eine KI, die darauf trainiert ist, professionelle E-Mails zu entwerfen. Ich benötige Ihre Unterstützung beim Verfassen einer E-Mail an ${recipient} mit dem Zweck: ${subject}.`;

  throw new Error("Language not supported.");
};

const getLanguage = (request) => {
  const languages = lngDetector.detect(request);

  for (const [lng, probability] of languages) {
    if (supportedLanguages.includes(lng)) {
      return lng;
    }
  }

  throw new Error("Language not supported.");
};

const buildPrompt = (history, subject, recipient, content, name) => {
  const lng = getLanguage(history + content);

  return [
    {
      role: "system",
      content: getSystemPrompt(lng, recipient, subject),
    },
    {
      role: "user",
      content: getUserPrompt(lng, history, subject, recipient, content, name),
    },
  ];
};

async function* streamAsyncIterator(stream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const { done, value } = await reader.read();
      // Exit if we're done
      if (done) return;
      // Else yield the chunk
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.apiKey);
      }
    });
  });
}

const buildEmail = async (
  history,
  subject,
  recipient,
  content,
  inputField,
  subjectField
) => {
  const url = "https://api.openai.com/v1/chat/completions";
  const apiKey = await getFromStorage("apiKey");
  const name = await getFromStorage("name");

  if (!apiKey) {
    throw new Error(
      "No API key found. Please set your API key in the extension options."
    );
  }

  // Make a POST request to the OpenAI API to get chat completions
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: buildPrompt(history, subject, recipient, content, name ?? ""),
      temperature: 0.5,
      max_tokens: 2048,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    }),
  });
  inputField.innerHTML = "";

  // Create a TextDecoder to decode the response body stream
  const decoder = new TextDecoder();

  var isFirstLine = true;
  var lastLine = "";

  // Iterate through the chunks in the response body using for-await...of
  for await (const chunk of streamAsyncIterator(response.body)) {
    const decodedChunk = decoder.decode(chunk);

    // Clean up the data
    const lines = decodedChunk
      .split("\n")
      .map((line) => line.replace("data: ", ""))
      .filter((line) => line.length > 0)
      .filter((line) => line !== "[DONE]")
      .map((line) => JSON.parse(line));

    // Destructuring!
    for (const line of lines) {
      const {
        choices: [
          {
            delta: { content },
          },
        ],
      } = line;

      if (content) {
        lastLine += content;
        if (isFirstLine) {
          if (lastLine.includes("Subject:"))
            subjectField.value = lastLine.split("Subject:")[1].trim();
        } else {
          inputField.innerHTML += content.replaceAll("\n", "<br>");
        }
        if (lastLine.includes("\n")) isFirstLine = false;
      }
    }
  }
};

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

function createCommitButton() {
  const commitButton = document.createElement("button");

  commitButton.innerText = "Gen Mail";
  commitButton.style.backgroundColor = "#00bcd4";
  commitButton.style.color = "#fff";
  commitButton.style.border = "none";
  commitButton.style.borderRadius = "5px";
  commitButton.style.padding = "10px";
  commitButton.style.margin = "10px";
  commitButton.style.fontSize = "16px";
  commitButton.style.zIndex = "9999";
  commitButton.style.borderRadius = "5px";
  commitButton.style.textAlign = "center";
  commitButton.style.fontFamily = "Roboto, sans-serif";

  return commitButton;
}

function makeHTMLToText(html) {
  return html
    .replaceAll("<br>", "\n")
    .replaceAll("<br/>", "\n")
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "")
    .replaceAll(/<[^>]*>?/gm, "");
}

function logic() {
  const sendButton = getElementByXpath("//div[text() = 'Send']");

  if (sendButton) {
    const toolBar = sendButton.parentNode.parentNode.parentNode.parentNode;

    // if the button already exists, return
    if (
      getElementByXpath("//button[text() = 'Gen Mail']") ||
      getElementByXpath("//button[text() = 'Generating...']")
    )
      return;

    console.log("Adding button...");
    const commitButton = createCommitButton();

    commitButton.addEventListener("click", async () => {
      if (commitButton.innerText == "Generating...") return;
      commitButton.innerText = "Generating...";

      const inputField = getElementByXpath("//div[@aria-label='Message Body']");
      const subjectElement = getElementByXpath("//input[@name='subjectbox']");
      const subject = subjectElement.value;
      const recipientElement =
        subjectElement.parentElement.parentElement.children[1];
      const recipient =
        recipientElement.textContent.split(">To")[1]?.split("CcBcc")[0] ??
        recipientElement.textContent;

      const content = makeHTMLToText(inputField.innerHTML);

      const historyElement = getElementByXpath(
        "//div[@style='word-wrap:break-word;line-break:after-white-space']"
      ); // TODO: issue, if a chat is in the background, this will be the chat history
      const history = makeHTMLToText(historyElement?.innerHTML ?? "");

      console.log({
        history,
        subject,
        recipient,
        content,
      });

      console.log("Generating email...");
      console.log(
        buildPrompt(history, subject, recipient, content, "TestName")
      );

      try {
        await buildEmail(
          history,
          subject,
          recipient,
          content,
          inputField,
          subjectElement
        );
      } catch (error) {
        console.log(error);
        alert(error);
      }
      commitButton.innerText = "Gen Mail";
    });

    toolBar.appendChild(commitButton);
  }
}

setInterval(logic, 1000);
