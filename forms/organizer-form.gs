/**
 * Builds the organizer's questionnaire as a Google Form, with a response sheet.
 * How: script.google.com → New project → paste this whole file → Run (createOrganizerForm) → allow access.
 * The links show up under "Execution log" at the bottom.
 */
function createOrganizerForm() {
  const form = FormApp.create("משחק ליום ההולדת · שאלון למארגן");
  form
    .setDescription(
      "מכינים משחק מסיבה שנבנה רק בשביל הערב הזה.\n" +
        "15 דקות. מכל תשובה יוצא משהו בערב: משימה סודית, שאלה, שורה של הקריין.\n" +
        "תשובה קצרה עדיפה על דילוג. התשובות נשארות אצלנו.",
    )
    .setConfirmationMessage("תודה. מכאן זה עלינו. לפני הערב נשלח לך קישור לבדיקה.")
    .setProgressBar(true)
    .setCollectEmail(false)
    .setAllowResponseEdits(true);

  const number = (min, max) => FormApp.createTextValidation().requireNumberBetween(min, max).setHelpText(`מספר בין ${min} ל־${max}`).build();
  const short = (title, help, required = true) => form.addTextItem().setTitle(title).setHelpText(help || "").setRequired(required);
  const long = (title, help, required = true) => form.addParagraphTextItem().setTitle(title).setHelpText(help || "").setRequired(required);
  const choice = (title, options, help, other = false) =>
    form.addMultipleChoiceItem().setTitle(title).setHelpText(help || "").setChoiceValues(options).showOtherOption(other).setRequired(true);
  const page = (title, help) => form.addPageBreakItem().setTitle(title).setHelpText(help || "");

  /* ---------- א. הערב ---------- */
  form.addSectionHeaderItem().setTitle("הערב").setHelpText("מתי, איפה, ומה יש במקום.");
  short("איך קוראים לבעל/ת השמחה, ואיך החבר׳ה קוראים לו או לה?", "שם מלא וכינוי. למשל: תומר כהן, ״טומי״");
  short("איזה גיל חוגגים?", "").setValidation(number(1, 120));
  form.addDateTimeItem().setTitle("מתי הערב?").setRequired(true);
  choice("איפה זה קורה?", ["בבית", "מרפסת או גג", "גינה"], "", true);
  short("כמה אורחים בערך?", "").setValidation(number(2, 200));
  form
    .addCheckboxItem()
    .setTitle("מה יש במקום?")
    .setHelpText("סמנו כל מה שיש. ככה בוחרים אתגרים שאפשר באמת לעשות בסלון")
    .setChoiceValues(["טלוויזיה שאפשר לחבר אליה מחשב", "רמקול", "שולחן גדול", "חפיסת קלפים", "משחקי שולחן", "קריוקי"])
    .showOtherOption(true);
  long("מה עוד מתוכנן בערב, ובאיזו שעה?", "עוגה, נאומים, ארוחה, יציאה. ככה המשחק לא נתקע באמצע העוגה", false);
  choice("בעל/ת השמחה יודע/ת על המשחק?", ["כן, יודע/ת", "לא, זו הפתעה"], "אם זו הפתעה, לא שולחים לו או לה את הקישור לשאלון האורחים");
  short("מי ינחה את המשחק בערב?", "שם וטלפון. לשם נשלח את קוד המנחה ומדריך קצר");

  /* ---------- ב. בעל/ת השמחה ---------- */
  page("בעל/ת השמחה", "מכאן יוצאים השאלות, המשימות והבדיחות של הקריין. כמה שיותר ספציפי, ככה יותר מצחיק.");
  short("עבודה, לימודים, או מה ממלא את היום", "");
  long("תחביבים, ספורט, מה אוהבים", "");
  long("שלוש בדיחות קבועות שכל החבר׳ה מכירים", "אחת בכל שורה");
  long("משפטים שחוזרים כל הזמן", "למשל ״אני רק אומר״, ״יאללה בקטנה״. מזה יוצאות משימות כמו ״תגרמו לו להגיד...״");
  long("במה ממש טובים, ובמה ממש גרועים?", "מזה יוצאים אתגרים כמו ״יצליח או לא?״");
  long("סיפור מביך שמותר לספר מול כולם", "רק מה שבעל/ת השמחה לא יתעצבנו לשמוע מול כולם", false);
  short("בן או בת זוג: שם, ואיך הכירו", "", false);
  long(
    "תמונות",
    "3 תמונות פנים ברורות ועד 10 תמונות ישנות ומצחיקות. הדביקו כאן קישור לתיקייה בדרייב או בגוגל תמונות, או כתבו ״שולח בוואטסאפ״",
  );

  /* ---------- ג. טון, צבעים וגבולות ---------- */
  page("טון, צבעים וגבולות", "את הטון והצבעים אפשר להחליף גם באמצע הערב, מהמסך של המנחה.");
  choice("איזה טון?", [
    "רגוע: חם ונעים, בלי לחץ לשתות",
    "שובב: עקיצות קלות, כולם צוחקים",
    "עוקצני: צלייה. אף אחד לא מוגן",
  ]);
  choice("באילו צבעים הערב?", [
    "קזינו: ירוק וזהב",
    "מועדון: סגול וורוד",
    "שקיעה: חום וכתום",
    "חצות: כחול וכסף",
    "רוז: בורדו וורוד",
  ]);
  choice("קללות בסדר?", ["כן", "לא"]);
  choice("יש אלכוהול בערב?", ["כן", "לא"], "בלי אלכוהול, מי שמפסיד מקבל משימה קטנה במקום לגימה");
  long("נושאים שלא נוגעים בהם", "אקסים, עבודה, משקל, כל מה שעדיף להשאיר בחוץ", false);
  long("מה המנצח מקבל, ומה המקום האחרון עושה?", "השאירו ריק ואנחנו נמציא", false);

  /* ---------- ד. האורחים ---------- */
  page("האורחים", "המשחק מחבר בין אנשים מעולמות שונים. בשביל זה צריך לדעת מי מגיע ומאיפה.");
  choice("מי כותב על האורחים?", [
    "אני כותב/ת על כולם",
    "כל אחד על עצמו. שלחו לי קישור לשאלון אורחים",
  ]);
  long(
    "רשימת האורחים",
    "שורה לכל אחד: שם, מאיפה מכירים את בעל/ת השמחה, ואם יש, משפט אחד על איך הכירו. המשפט הזה עולה לטלוויזיה כשהאורח נכנס.\n" +
      "למשל: נועם, תיכון, ישבנו באותו שולחן בכיתה י׳ ולא הפסקנו לדבר מאז",
  );

  // answers land in a sheet: File → Download → CSV, and that's what Ziv gets
  const sheet = SpreadsheetApp.create("תשובות · שאלון למארגן");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log("לשלוח למארגן: " + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log("לערוך את הטופס: " + form.getEditUrl());
  Logger.log("התשובות: " + sheet.getUrl());
}
