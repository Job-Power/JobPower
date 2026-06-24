# Job Power HR — אתר תדמית

אתר התדמית של **Job Power HR (ג'וב פאוור)** — חברת גיוס והשמת משאבי אנוש מחדרה, מאז 2010.

🌐 **אתר חי:** https://job-power.github.io/JobPower/

## על האתר
אתר עמוד-אחד (single page), עברית / RTL, עם רקע וידאו קולנועי, אנימציות גלילה וסגנון עיצובי עריכותי.

## טכנולוגיות
- HTML / CSS / JavaScript (vanilla, ללא build step)
- [GSAP](https://gsap.com/) + ScrollTrigger — אנימציות
- [Lenis](https://lenis.darkroom.engineering/) — גלילה חלקה
- [hls.js](https://github.com/video-dev/hls.js/) — רקע וידאו (HLS)

הספריות מצורפות מקומית תחת `assets/vendor/` כך שהאתר עובד גם ללא רשת (פרט לווידאו והגופנים).

## מבנה
```
index.html            עמוד האתר
assets/css/style.css   עיצוב
assets/js/main.js      אינטראקציות ואנימציות
assets/img/            לוגו
assets/vendor/         ספריות צד-שלישי
```

## הרצה מקומית
מספיק לפתוח את `index.html` בדפדפן, או להריץ שרת סטטי פשוט:
```bash
npx serve .
```

---
עוצב ונבנה על ידי **Elevate Creative**.
