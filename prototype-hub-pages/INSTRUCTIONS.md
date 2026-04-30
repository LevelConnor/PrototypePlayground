# Deploy your prototype hub — step by step

These are the only four things you need to do. After this, your hub is
live on the internet and you can publish new prototypes by double-clicking
a file.

Total time: about 10 minutes.

---

## Step 1 — Replace your old folder with this new one

The folder you unzipped is a clean version of the project. We're going to
replace your existing `prototype-hub` folder with this one, while keeping
the `.git` folder from the old one (that's what's connected to GitHub).

### What you need to do

1. **Open your existing `prototype-hub` folder** in your file manager
   (Finder on Mac, File Explorer on Windows). Probably on your Desktop.

2. **Show hidden files** so you can see the `.git` folder:
   - **Mac:** press `Cmd + Shift + .` (period). Hidden files become visible
     as faded icons. The `.git` folder will appear.
   - **Windows:** in File Explorer, click the **View** tab → check
     **Hidden items**. The `.git` folder will appear.

3. **Copy the `.git` folder** out of your old `prototype-hub` to somewhere
   safe temporarily (like your Desktop, next to the folder). Right-click
   → Copy, paste it onto the Desktop.

4. **Delete your old `prototype-hub` folder entirely.** Move it to Trash
   / Recycle Bin.

5. **Move the new unzipped `prototype-hub` folder** into the same spot
   where the old one was (probably your Desktop).

6. **Move the `.git` folder you saved** in step 3 INTO the new
   `prototype-hub` folder. This is the critical step — it reconnects the
   new files to your GitHub repo.

7. **Verify.** Open the new `prototype-hub` folder. With hidden files
   visible, you should see:
   - `.git` (folder)
   - `prototypes` (folder)
   - `index.html`
   - `README.md`
   - `publish.command` (Mac) and `publish.bat` (Windows)
   - `INSTRUCTIONS.md` (this file)

If `.git` is there, you're connected. You can re-hide hidden files now
(same shortcut as before).

---

## Step 2 — Push everything to GitHub

This is the same Terminal commands you've used before. Three lines.

1. Open Terminal (Mac) or PowerShell (Windows).

2. Navigate into your project folder. If it's on your Desktop:

   ```
   cd ~/Desktop/prototype-hub
   ```

   (If you put it somewhere else, drag the folder into Terminal to autofill
   the path.)

3. Run these three commands one at a time:

   ```
   git add .
   ```

   ```
   git commit -m "Switch to GitHub Pages structure with first prototype"
   ```

   ```
   git push
   ```

4. The last command should show output ending with `main -> main`. That
   means everything uploaded successfully.

---

## Step 3 — Turn on GitHub Pages

This is the part that makes your site go live on the internet.

1. Go to your repo on GitHub: `github.com/YOUR-USERNAME/prototype-hub`.

2. Click the **Settings** tab in the top nav bar of the repo (near the
   right end of the row).

3. In the left sidebar of the Settings page, click **Pages**.

4. Under "Build and deployment":
   - **Source** dropdown: leave as "Deploy from a branch."
   - **Branch** dropdown: change from "None" to **main**.
   - The second dropdown next to it: leave as **/ (root)**.

5. Click **Save**.

6. A box will appear saying the site is being built. Wait 60 seconds.
   Refresh the page. The box should change to:

   > Your site is live at `https://YOUR-USERNAME.github.io/prototype-hub/`

7. Click **Visit site**. You should see the cream-colored "Prototype Hub"
   landing page.

8. Click the "College cost calculator" link. You should see the working
   calculator.

If both pages load, **you're done.** Your hub is live. Anyone with the URL
can visit it.

---

## Step 4 — Try the publish script (one-time test)

The `publish.command` (Mac) or `publish.bat` (Windows) file is your
shortcut for future updates. Let's verify it works.

### On Mac

The first time you double-click `publish.command`, macOS will refuse to
open it because it wasn't downloaded from the App Store. To allow it:

1. **Right-click** (or Control+click) on `publish.command` → **Open**.
2. A dialog appears: "macOS cannot verify the developer..." Click **Open**.
3. A Terminal window opens, runs through the script, and shows
   "Nothing to publish. No files have changed." Press any key to close.

After this first time, double-clicking will work normally.

### On Windows

Double-click `publish.bat`. Windows might show a "Windows protected your
PC" warning the first time — click **More info** → **Run anyway**. After
that it will run normally.

You'll see "Nothing to publish" because nothing has changed yet. Press any
key to close.

This script is what you'll use going forward. Whenever you've added a new
prototype:

1. Double-click `publish.command` (Mac) or `publish.bat` (Windows).
2. Type a short message describing what you changed (e.g. "Added
   investment growth calculator").
3. Press Enter.
4. Wait a few seconds. Press any key to close.

That's the whole publish flow from now on. No Terminal commands needed.

---

## Adding a new prototype later

When you want to add a new prototype:

1. **Make a new folder** under `prototypes/` named with kebab-case
   (lowercase, words separated by hyphens). Example: `investment-growth`.

2. **Create an `index.html`** inside that folder with your prototype code.
   Easiest way: open `prototypes/college-cost-calc/index.html` in TextEdit
   or Notepad to use as a template, modify it, save it as `index.html` in
   your new folder.

3. **Edit the root `index.html`** (the landing page) to add a new entry.
   Open it in TextEdit/Notepad. Find the `<article class="entry">` block
   for the calculator, copy the whole block, paste it below, and edit the
   link, title, question, and date for the new prototype.

4. **Double-click `publish.command`** (Mac) or `publish.bat` (Windows).
   Type a quick description. Press Enter. Done.

5. **Wait 60 seconds.** Your new prototype is live on the hub.

---

## If something goes wrong

**The publish script doesn't open / shows an error.** Almost always a
permissions issue on first run. See Step 4 for how to grant permission.

**`git push` says "Updates were rejected"** — your local copy is missing
something that's on GitHub. Run `git pull` first, then try `git push`
again.

**Your site loads but the calculator link 404s.** Check that the folder
under `prototypes/` is exactly `college-cost-calc` (lowercase, hyphens, no
spaces). URL paths are case-sensitive.

**Anything else.** Take a screenshot of the error and ask Claude — most
issues at this stage are five-minute fixes once someone can see the exact
error message.
