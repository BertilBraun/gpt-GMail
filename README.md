# GPT3 Email Response Extension

Generates a response to an email using a GPT-3 model. Using the last email in the conversation and a view Bullet Points that you provide which describe the rough content of the email, the model generates a response.

# Installation

1. Clone the repository to your local machine.
2. Setup your API_KEY
3. Go to the Chrome extension page [chrome://extensions/](chrome://extensions/) and click the "Developer mode" button in the top right.
4. Click the "Load unpacked" button and select the folder of the extension.
5. Click the "Generate" button after adding your Bullet Points for the response.

# Development

Package via `browserify writer.js > bundle.js`.