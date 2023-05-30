const { Configuration, OpenAIApi } = require("openai");
const lngDetector = new (require("languagedetect"))();
const { config } = require("./config");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const supportedLanguages = ["en", "de"];

const getPrompt = (lng, history, subject, recipient, content) => {
  if (lng == "en")
    return `Include references to the prior email exchange: 
---
${history}
---
Compose an email for me to ${recipient} about ${subject}. The email should cover these points: 
---
${content}
---
Refer back to our earlier conversations, and follow the recipient's style observed in our past discussions.`;
  if (lng == "de")
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
  if (lng == "en")
    return `You're an AI trained to draft professional emails. The user requires your assistance in writing an email to ${recipient} with a purpose: ${subject}.`;

  if (lng == "de")
    return `Sie sind eine KI, die darauf trainiert ist, professionelle E-Mails zu entwerfen. Der Benutzer benötigt Ihre Unterstützung beim Verfassen einer E-Mail an ${Empfänger} mit dem Zweck: ${Betreff}.`;

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

const buildEmail = async (history, subject, recipient, content) => {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: buildPrompt(history, subject, recipient, content),
    temperature: 0.5,
    max_tokens: 2048,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return response.choices[0].message.content;
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

  commitButton.innerText = "Gen Email";
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

function logic() {
  const sendButton = getElementByXpath("//div[text() = 'Send']");
  const inputFields = document.getElementsByClassName(
    "Am aO9 Al editable LW-avf tS-tW"
  );

  if (sendButton && inputFields.length == 1) {
    const toolBar = sendButton.parentNode.parentNode.parentNode.parentNode;
    const container =
      toolBar.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode;

    const request = container.children[0].children[1].children[2];

    if (!request) return;

    const inputField = inputFields.item(0);

    clearInterval(timer);
    const commitButton = createCommitButton();

    commitButton.addEventListener("click", async () => {
      if (commitButton.innerText == "Generating...") return;
      commitButton.innerText = "Generating...";

      // TODO parse from UI
      const history = ""; // TODO handle new mail differently
      const subject = "";
      const recipient = "";
      const content = "";

      console.log("Generating email...");
      console.log(buildPrompt(history, subject, recipient, content));

      try {
        const response = await buildEmail(history, subject, recipient, content);
        console.log(response);

        inputField.innerHTML = response.replaceAll("\n", "<br>");
      } catch (error) {
        alert(error);
      }

      commitButton.innerText = "Gen Email";
    });

    toolBar.appendChild(commitButton);
  }
}

const timer = setInterval(logic, 1000);
