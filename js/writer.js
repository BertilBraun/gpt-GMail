const { Configuration, OpenAIApi } = require("openai");
const lngDetector = new (require("languagedetect"))();
const config = require("./config.json");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const EN = "english";
const DE = "german";
const supportedLanguages = [EN, DE];

const getPrompt = (lng, history, subject, recipient, content) => {
  if (lng == EN)
    return `Include references to the prior email exchange: 
---
${history}
---
Compose an email for me to ${recipient} about ${subject}. The email should cover these points: 
---
${content}
---
Refer back to our earlier conversations, and follow the recipient's style observed in our past discussions.`;

  if (lng == DE)
    return `Beziehen Sie sich auf den vorherigen E-Mail-Austausch: 
---
${history}
---
Verfassen Sie für mich eine E-Mail an ${recipient} über ${subject}. Die E-Mail sollte diese Punkte abdecken:
---
${content}
---
Beziehen Sie sich auf unsere früheren Unterhaltungen und folgen Sie dem Stil des Empfängers, wie er in unseren vorherigen Diskussionen beobachtet wurde.`;

  throw new Error("Language not supported.");
};

const getSystemPrompt = (lng, recipient, subject) => {
  if (lng == EN)
    return `You're an AI trained to draft professional emails. The user requires your assistance in writing an email to ${recipient} with a purpose: ${subject}.`;

  if (lng == DE)
    return `Sie sind eine KI, die darauf trainiert ist, professionelle E-Mails zu entwerfen. Der Benutzer benötigt Ihre Unterstützung beim Verfassen einer E-Mail an ${recipient} mit dem Zweck: ${subject}.`;

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

const buildPrompt = (history, subject, recipient, content) => {
  const lng = getLanguage(history + content);

  return [
    {
      role: "system",
      content: getSystemPrompt(lng, recipient, subject),
    },
    {
      role: "user",
      content: getPrompt(lng, history, subject, recipient, content),
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

const buildEmail = async (
  history,
  subject,
  recipient,
  content,
  elementToSet,
  then
) => {
  const url = "https://api.openai.com/v1/chat/completions";

  // Make a POST request to the OpenAI API to get chat completions
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: buildPrompt(history, subject, recipient, content),
      temperature: 0.5,
      max_tokens: 2048,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    }),
  });
  elementToSet.innerHTML = "";

  // Create a TextDecoder to decode the response body stream
  const decoder = new TextDecoder();

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
        elementToSet.innerHTML += content.replaceAll("\n", "<br>");
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
      console.log(buildPrompt(history, subject, recipient, content));

      try {
        await buildEmail(
          history,
          subject,
          recipient,
          content,
          inputField,
          () => {
            commitButton.innerText = "Gen Mail";
          }
        );
      } catch (error) {
        console.log(error);
        alert(error);
      }
    });

    toolBar.appendChild(commitButton);
  }
}

setInterval(logic, 1000);
