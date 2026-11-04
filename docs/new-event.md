# מסיבה חדשה: מהשאלונים למשחק

1. `node scripts/new-event.mjs <id>` (למשל `dana-40`). נוצרים `src/content/<id>.ts` (עותק של הדמו) ו־`events/<id>/public`.
2. ממלאים את קובץ התוכן מהתשובות:

| בשאלון | בקובץ התוכן |
| --- | --- |
| מארגן 1–2: שם, כינוי, גיל | `words` (event, brand, coin, king, last), `settings.currency`, `certRow` |
| מארגן 4–5: מקום וציוד | `challenges`, `games` |
| מארגן 6: מה עוד בערב | `night` |
| מארגן 9–14: בעל השמחה | `challenges` עליו, `quiz`, `missions` עם `{G}`, `lines` |
| מארגן 15 + שאלון בן/בת זוג | `quiz` עם `correct: null` (המנחה מסמן בערב) |
| מארגן 17–20: טון, קללות, אלכוהול, קווים אדומים | `lines`, `tasks`, `drinkWheel`, `voice`, `quizPenalty` |
| מארגן 21: פרסים | `settings.prize1..prizeLast` |
| מארגן 23 + אורח 1, 3 | `PLAYERS` (מזהה באנגלית, שם, סימול, מעגל), `circles` |
| אורח 4: במה טוב | דו־קרבות ב־`challenges` (זוגות ממעגלים שונים) |
| אורח 5: במה ידוע | `votes` |
| אורח 6: עובדה שאף אחד לא יודע | `quiz` "של מי העובדה" עם `correct` |
| אורח 7: סיפור על בעל השמחה | `quiz`, `missions`, `lines` |
| אורח 8: בלי משימות | אין צורך: נבחר בכניסה למשחק |

3. תמונות לפי המדריך: `events/<id>/public/photos/<מזהה>.jpg`, `photos/ai/king/`, `photos/shot/` וכו'. תמונות של בעל השמחה ל־`media.starGallery` ב־`photos/ai/star/`.
4. `EVENT=<id> npm run dev`, עוברים על הכל בטלפון ובטלוויזיה.
5. `scripts/deploy-event.sh <id> <קוד מנחה>`, או מ־GitHub: Actions ← Check and deploy ← Run workflow.
6. אחרי המסיבה: `node scripts/export.mjs <כתובת> <קוד מנחה> <תיקייה>`, ואז `npx wrangler delete --name party-<id>`.
