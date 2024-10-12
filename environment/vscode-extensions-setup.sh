#!/bin/bash

# List of extensions to install
extensions=(
    christian-kohler.npm-intellisense
    christian-kohler.path-intellisense
    dbaeumer.vscode-eslint
    dominicvonk.parameter-hints
    eamodio.gitlens
    esbenp.prettier-vscode
    firsttris.vscode-jest-runner
    formulahendry.auto-close-tag
    formulahendry.auto-complete-tag
    formulahendry.auto-rename-tag
    github.copilot
    github.copilot-chat
    humao.rest-client
    kungfoowiz.csssuggestions
    mechatroner.rainbow-csv
    mgmcdermott.vscode-language-babel
    mohsen1.prettify-json
    naumovs.color-highlight
    redhat.vscode-xml
    redhat.vscode-yaml
    shd101wyy.markdown-preview-enhanced
    streetsidesoftware.code-spell-checker
    styled-components.vscode-styled-components
    yoavbls.pretty-ts-errors
)

# Loop through each extension and install it
for extension in "${extensions[@]}"; do
    code --install-extension "$extension"
done

echo "All specified extensions installed successfully!"
