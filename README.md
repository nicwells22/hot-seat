# On the Hot Seat

A two-minute, no-data-entry get-to-know-you game for seminary classes.

## Run it

Because the questions are loaded from the adjacent `questions.json` file, open the folder through a local web server instead of double-clicking `index.html`.

If Python is installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. You can also upload the four web files together to any static host.

## Customize it

- Change the round length by editing `ROUND_SECONDS` near the top of `app.js`.
- Add, remove, or edit prompts in `questions.json`.
- Supported question types are `one-word` and `choice`.
- Student names are saved only in that browser using local storage. Verbal answers are never entered or saved.
