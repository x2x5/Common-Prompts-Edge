# Edge Prompt Inserter

A browser extension for Microsoft Edge that allows you to quickly insert predefined text prompts into input fields on webpages.

![show](./show.png)
## Features

- Store and manage a list of commonly used text prompts
- Click on a prompt to automatically insert it into the active input field
- Fallback to clipboard copying if direct insertion isn't possible
- Add, edit, and delete prompts as needed
- Prompts persist across browser sessions

## Installation

### From Source Code

1. Clone or download this repository
2. Open Microsoft Edge and navigate to `edge://extensions/`
3. Enable "Developer mode" by toggling the switch in the bottom-left corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your toolbar

## Usage

1. Click on the extension icon in the toolbar to open the prompt list
2. Click on a prompt title to insert its content into the active input field
   - If no input field is active or insertion fails, the prompt will be copied to your clipboard
3. To add a new prompt, enter a title and content at the bottom of the popup, then click "Save Prompt"
4. To edit a prompt, click the "Edit" button next to it, make your changes, then click "Save Prompt"
5. To delete a prompt, click the "Delete" button next to it and confirm

## Note About Icons

This repository includes placeholder icons. Replace them with your own custom icons before publishing or distributing the extension.

## License

This project is open source and available under the [MIT License](LICENSE). 