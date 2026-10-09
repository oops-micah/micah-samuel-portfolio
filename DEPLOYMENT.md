# Setup and deployment

## 1. Configure the contact form

1. Open https://web3forms.com/ and choose **Create your form**.
2. Enter your receiving email address on Web3Forms only. Complete the provider's verification/sign-in flow and create a form in your account. Do not enter your address in this repository or a GitHub secret.
3. Copy the form's public access key into `config.js`:

```js
window.PORTFOLIO_CONFIG = Object.freeze({
  web3formsAccessKey: "PASTE_PUBLIC_FORM_ACCESS_KEY_HERE",
});
```

4. Keep the rest of the file's comments or replace the file with the block above.

The public form key aliases your receiving address; Web3Forms does not require that address in client code. The key is intentionally public, but can be used for submissions, so enable provider spam protection and any available domain restrictions. Never paste a private account API token, a password or an inbox address. Official references: https://docs.web3forms.com/getting-started/installation and https://docs.web3forms.com/getting-started/faq.

## 2. Install prerequisites

Use Git Bash on Windows for the commands below. Install Git, Python and GitHub CLI if missing. In PowerShell:

```powershell
winget install --id Git.Git -e
winget install --id GitHub.cli -e
winget install --id Python.Python.3.13 -e
```

Restart the terminal after installation. Node is optional for local syntax checks; GitHub's hosted workflow provides Node. Python is needed only for the local preview.

## 3. Preview

Extract `micah-samuel-portfolio.zip`. In Git Bash, from the folder containing the extracted project:

```bash
cd micah-samuel-portfolio
python -m http.server 8000
```

Open http://localhost:8000. Stop the server with Ctrl+C before continuing in the same terminal.

## 4. Authenticate, create the public repository and push

These commands target the verified account `oops-micah`. Stop if authentication identifies a different account. The commit identity below uses GitHub's public noreply address rather than a personal inbox address. It is not a contact route and is never included in the published website.

```bash
gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow
gh auth setup-git
gh api user --jq .login
git init -b main
git config user.name "Micah Samuel"
git config user.email "174071370+oops-micah@users.noreply.github.com"
git add index.html styles.css script.js config.js assets .gitignore .nojekyll README.md DEPLOYMENT.md .github/workflows/pages.yml
git commit -m "Build Micah Samuel portfolio"
gh repo create oops-micah/micah-samuel-portfolio --public --source=. --remote=origin
gh api --method POST repos/oops-micah/micah-samuel-portfolio/pages -f build_type=workflow
git push -u origin main
```

Enable Pages before the first push so the first Actions deployment has a configured target. If you already pushed, enable Pages and then run:

```bash
gh workflow run pages.yml --ref main
```

If the named repository already exists, stop rather than overwrite it. If the local ZIP is extracted again later, do not run these initial-creation commands again.

## 5. Verify deployment

```bash
gh run list --workflow pages.yml --limit 5
gh run watch --exit-status
gh api repos/oops-micah/micah-samuel-portfolio/pages --jq .html_url
```

Expected URL after successful deployment: https://oops-micah.github.io/micah-samuel-portfolio/.
This URL is not evidence that publication succeeded. Wait for the successful workflow, load the URL and test the form. GitHub's workflow docs: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.

## 6. Verify privacy

In the browser, use View Source (Ctrl+U) and search for your actual inbox address and `mailto:`. Check `script.js` and `config.js` in DevTools too; View Source alone does not cover external files. Submit a test and inspect the outgoing request: it should contain the public access key and the sender's form details, never the recipient's address. Do not paste actual messages or test addresses into the repo.

Search tracked source in Git Bash:

```bash
git grep -n -i 'mailto:'
git grep -n -I -E '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}' -- ':!DEPLOYMENT.md'
git log --all --format='%h %an <%ae> %cn <%ce>'
git log --all -p -- index.html styles.css script.js config.js assets
```

No output from a `git grep` means no matches (exit code 1 is expected). Review author and committer addresses separately: both should be the public GitHub noreply identity. DEPLOYMENT.md contains that noreply identity only. In GitHub search within the repository, search for your actual address. If a personal address was ever committed, deleting it from the latest files does not erase Git history.

The delivered portrait was re-encoded without original EXIF metadata. No recipient address, mailto link or recipient schema is included.

## 7. Future edits and redeployment

```bash
git pull --ff-only
python -m http.server 8000
```

Make edits, preview the mobile and desktop layouts, then stop the server. If Node is installed:

```bash
node --check script.js
node --check config.js
```

Check privacy again, then:

```bash
git add index.html styles.css script.js config.js assets README.md DEPLOYMENT.md .github/workflows/pages.yml
git commit -m "Update portfolio content"
git push
gh run watch --exit-status
```

Every push to `main` deploys automatically. If the account, repo name or domain changes, update canonical, Open Graph and Twitter URLs in `index.html`. Run Lighthouse in Chrome DevTools on the live URL; measure mobile and desktop. Target 90+ for performance, accessibility, best practices and SEO, and investigate any lower score before considering the release complete.
