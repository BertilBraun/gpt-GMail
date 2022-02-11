const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "YOUR_API_KEY",
});
const openai = new OpenAIApi(configuration);

const template = `
###

Hi Bertil,

I have attached five samples of my original designs to this email. The sixth attachment is a list of designs where I collaborated with other designers including the location (URL) of the designs on the Internet.

Thank you for allowing me to send samples to you. I will be pleased to participate in the forthcoming competition and also introduce my services to your team.

Kindly notify me should you need any other information.

Regards,
George Washington

----

[Bullet Points]
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

Hi Bertil,

I want to invite you to an event we are holding for Steve Welch, our Head of Marketing who is leaving on 12 December. The event will take place between 7 pm – 12 pm on 12 December.

Numbers are limited, and guests will be required to RSVP before the event to ensure adequate space and refreshments.

If you would like to attend, RSVP to this email with any dietary requirements. If you cannot attend, we encourage you to send your messages of support for Steve before he leaves to start his new role.

Regards,
Mandy Smith

----

[Bullet Points]
thanks
will come
all the best to Steve
vegetarian

----

Hi Mandy,

I hope you've had a lovely week. Thank you for inviting me to the event.

I'm occupied with some deadlines at the moment. However, I will be able to attend the event anyway. It has been an honour working with Steve, and I will want to wish him the best.

Regarding the dietary requirements, I'm a vegetarian and would like to be able to attend the event.

Once again, thank you for reaching out.Also, do contact me if you have any additional questions or need anything else.

Regards,
Bertil Braun

### 
`;

const buildPrompt = (request, points) => `
${template}
${request}

----

[Bullet Points]
${points}

----

`;

const buildEmail = async (request, points) => {
  const response = await openai.createCompletion("text-davinci-001", {
    prompt: buildPrompt(request, points),
    temperature: 1,
    max_tokens: 500,
    frequency_penalty: 0.15,
    presence_penalty: 0.75,
  });

  return response.data.choices[0].text;
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

    console.log(request);
    if (!request) return;

    clearInterval(timeout);

    const inputField = inputFields.item(0);

    const existing = getElementByXpath("//*[text() = 'Gen Email']");
    if (existing) existing.remove();
    const commitButton = createCommitButton();

    commitButton.addEventListener("click", async () => {
      const response = await buildEmail(
        request.innerText,
        inputField.innerText
      );
      console.log(response);
      inputField.innerHTML = response.replaceAll("\n", "<br>");
      timeout = setInterval(logic, 1000);
    });

    toolBar.appendChild(commitButton);
  }
}

let timeout = setInterval(logic, 1000);
