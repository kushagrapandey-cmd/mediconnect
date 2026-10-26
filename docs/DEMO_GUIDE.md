# LinkedIn screen-recording and interview demo guide

## Pehle ye setup karo

- Real patient data use mat karo. Website ke **Add a record** se synthetic sample PDF download karo.
- Apne synthetic patient aur doctor accounts banao. Patient normal browser mein, doctor incognito/second browser mein. Passwords, browser saved-password prompts, private tabs, email inbox and keys recording mein mat dikhao.
- Desktop notification/Do Not Disturb mode on karo. Record just the app window/tab, not the whole desktop if unnecessary.
- Use a screen recorder already available to you. In OBS, use Window Capture, microphone if needed, 1080p/30fps and hardware encoding if available; 720p/30fps is fine on a weaker laptop. A browser/window recorder is also fine. No animation-heavy editing is necessary.
- Browser text 100–110% readable rakho. Cursor slow move karo. Errors/access denied ko deliberately demonstrate karo, hide mat karo.
- Raw clip record karo, dead time/password entry trim karo, short captions add karo and export MP4. Recording-tool choice is optional; no exact current LinkedIn upload limits are assumed here.

## Recommended 90–120 second public demo

| Time      | Screen / action                                                               | What to explain                                                                                           |
| --------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 0–10 s    | Homepage, one light/dark toggle                                               | Problem: medical reports scattered across visits; focus is organisation and deliberate sharing.           |
| 10–25 s   | Patient workspace, upload sample (trim file-picker time)                      | Title, category and date; actual persisted record, not a static UI card.                                  |
| 25–40 s   | Search/filter, download, optional refresh                                     | Find the record and show persistence; do not spend the clip on styling alone.                             |
| 40–65 s   | Doctor window: access denied before sharing; patient grants the doctor's code | Identity is different from permission. Show both sides clearly with on-screen labels.                     |
| 65–85 s   | Doctor can view; patient revokes; doctor's next request/download is denied    | The main engineering point: permission checked on the server for each access.                             |
| 85–100 s  | Activity history                                                              | See who viewed/downloaded and changed permissions; call it application history, not a tamper-proof audit. |
| 100–120 s | GitHub README/code map                                                        | React/Express/PostgreSQL, tests, AI-assisted refactor and next steps; link source and live demo.          |

If real requests make the recording longer, edit pauses or publish a 2–3 minute demo; do not speed everything up until nobody can read it. For an interview keep a separate 4–5 minute version and open the relevant code when asked.

## Narration outline — adapt to your actual contribution

1. “MediConnect is our academic project for organising and sharing patient records.” Only call it “our college project” if that is accurate for your role.
2. “The patient owns the library. A patient code identifies an account; a separate grant gives a specific doctor temporary access.”
3. “Here access fails before permission. After the patient grants it, the doctor can open the library. Revocation blocks the next download.”
4. “The deployed stack is React, Express and PostgreSQL. I used substantial AI coding assistance for the refactor, testing and deployment. My original work and the assisted work are documented separately.”
5. “Next I want to validate a small clinic workflow and explore the relevant ABDM record-exchange/UHI service integrations. Those integrations are not live today.”

Do not claim personal authorship of every improvement. After you actually study/reproduce/modify code, describe those concrete actions. Nobody can honestly infer a useful “my code versus AI code percentage” from the final line count.

## Caption framework

Use your own words around five points:

- The original project and the problem you chose, with original team credit.
- Two engineering behaviours visible in the clip (for example consent/revocation and persistent records).
- Current stack and what you learned by personally tracing/reviewing the implementation.
- One clear AI-assistance disclosure; no need to repeat it every ten seconds, and do not bury it if asked.
- Live link + GitHub link + one concrete feedback request.

Avoid “launched a healthcare startup”, “integrated UHI”, “production-ready medical platform”, “zero bugs” or “I wrote every line” for the current version. Avoid calling the current PostgreSQL revision MERN. Mention 40 API checks and four security tests as the assisted QA evidence, not as a substitute for your own understanding.

## Publish checklist

1. Watch the exported clip once without sound: can a viewer follow patient → permission → doctor → revoke?
2. Check for passwords, private details and unreadable text; use only synthetic data.
3. Upload the MP4 from LinkedIn's normal post composer, add a short caption, verify the preview and links, then publish yourself.
4. Keep README/CONTRIBUTIONS/QA links ready for questions. Ask for feedback on the permission flow or clinic workflow, not vague praise.
5. Recheck the live demo before interviews; free-tier cold starts and network delays can happen. Keep an honest backup recording rather than claiming an offline clip is live.
