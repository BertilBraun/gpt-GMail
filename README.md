# GPT GMail Response Extension

Generates a email using the OpenAI GPT model. Using the last email in the conversation and a view Bullet Points that you provide which describe the rough content of the email, the model generates a response.

## Installation

1. Clone the repository to your local machine.
2. Go to the Chrome extension page [chrome://extensions/](chrome://extensions/) and click the "Developer mode" button in the top right.
3. Click the "Load unpacked" button and select the folder of the extension.
4. Setup your API_KEY and NAME in the chrome extension options page.
5. Click the "Gen Mail" button after adding your Bullet Points for the response.

## Development

Have `browserify` installed via `npm i -g browserify`.

Package via `browserify writer.js > bundle.js` or the included `npm run package`.

## Future

- [x] Cleanup environment variables and proper modularization.
- [x] Use different Templates for different languages.
- [x] Use different Templates when there was no request.
- [x] Calculate how long the response may be, to not exceed the Token limit.
- [x] Automatically set the improved subject line.
- [x] Add Formal / Informal option.
