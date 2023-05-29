const { Configuration, OpenAIApi } = require("openai");
const lngDetector = new (require("languagedetect"))();

const configuration = new Configuration({
  apiKey: "YOUR_API_KEY",
});
const openai = new OpenAIApi(configuration);

const templates = {
  english: `
###

Hi Bertil,

I have attached five samples of my original designs to this email. The sixth attachment is a list of designs where I collaborated with other designers including the location (URL) of the designs on the Internet.

Thank you for allowing me to send samples to you. I will be pleased to participate in the forthcoming competition and also introduce my services to your team.

Kindly notify me should you need any other information.

Regards,
George Washington

----

[Punkte]
thanks
occupied at the moment
go ahead
inform me when my attention is required

----

Hi George,

I hope you've had a lovely week. Thank you for sending the details I requested promptly.

Unfortunately, I'm occupied with some deadlines at the moment. However, I can review the document and return it before the end of the week. In the meantime, you can go ahead with the outline for the project.

Please let me know if any new situations emerge that require my attention. It is an honour to be working on this project with you, and I hope to resume working with you soon.

Regards,
Bertil Braun

### 
`,
  german: `
###

Hallo Bertil,

Ich habe dieser E-Mail fünf Muster meiner Originaldesigns beigefügt. Der sechste Anhang ist eine Liste von Entwürfen, bei denen ich mit anderen Designern zusammengearbeitet habe, einschließlich des Standorts (URL) der Entwürfe im Internet.

Vielen Dank für die Erlaubnis, Ihnen Muster zusenden zu dürfen. Ich würde mich freuen, an dem bevorstehenden Wettbewerb teilzunehmen und auch Ihrem Team meine Dienste vorzustellen.

Bitte benachrichtigen Sie mich, wenn Sie weitere Informationen benötigen.

Mit freundlichen Grüßen,
George Washington

----

[Punkte]
danke
im Moment besetzt
machen Sie weiter
informieren Sie mich, wenn meine Aufmerksamkeit erforderlich ist

----

Hallo George,

ich hoffe, du hattest eine schöne Woche. Vielen Dank für die prompte Zusendung der von mir angeforderten Informationen.

Leider bin ich im Moment mit einigen Terminen beschäftigt. Ich kann das Dokument jedoch überprüfen und vor Ende der Woche zurückschicken. In der Zwischenzeit können Sie mit dem Entwurf für das Projekt fortfahren.

Bitte lassen Sie mich wissen, wenn sich neue Situationen ergeben, die meine Aufmerksamkeit erfordern. Es ist mir eine Ehre, mit Ihnen an diesem Projekt zu arbeiten, und ich hoffe, die Zusammenarbeit mit Ihnen bald wieder aufnehmen zu können.

Mit freundlichen Grüßen,
Bertil Braun

### 
`,
};

const getPrompt = (request, points) => {
  return `Write a professional, formal mail. The following is the conversation so far:
  ${request}


  Now write a professional sounding formal response containing the following points:
  ${points}
  
  Include a slight imitation of their habits. I.e. If partner answers with 'Kind regards', do so as well, instead of 'Best'.`;
};

const getResponse = (lng) => {
  return "// TODO";
};

const getTemplate = (lng) => {
  return "// TODO";
};

const getSystemPrompt = (lng) =>
  "You're helping me write a professional, formal Mail."; // TODO

const getLanguage = (request) => {
  const languages = lngDetector.detect(request);

  for (const [lng, probability] of languages) {
    if (Object.keys(templates).includes(lng)) {
      return lng;
    }
  }

  throw new Error("Language not supported.");
};

const buildPrompt = (request, points) => {
  const lng = getLanguage(request);

  return [
    { role: "system", content: getSystemPrompt(lng) },
    // { role: "user", content: getTemplate(lng) },
    // { role: "assistant", content: getResponse(lng) },
    { role: "user", content: getPrompt(request, points) },
  ];
};

const buildEmail = async (request, points) => {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: buildPrompt(request, points),
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

    const existing = getElementByXpath("//*[text() = 'Gen Email']");
    if (existing) existing.remove();
    const commitButton = createCommitButton();

    commitButton.addEventListener("click", async () => {
      if (commitButton.innerText == "Generating...") return;
      commitButton.innerText = "Generating...";

      console.log("Generating email...");
      console.log(buildPrompt(request.innerText, inputField.innerText));

      try {
        const response = await buildEmail(
          request.innerText,
          inputField.innerText
        );
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

setInterval(logic, 1000);
