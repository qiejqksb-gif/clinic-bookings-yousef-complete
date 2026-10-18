# يوسف | إدارة العيادة

## قبل الاستخدام
1. افتح `app.js` في GitHub.
2. من Firebase Console افتح Project settings → General → Your apps → SDK setup and configuration → Config.
3. انسخ القيم الحقيقية إلى `firebaseConfig` مكان القيم التي تبدأ بـ `PASTE_`. لا ترسل كلمة مرور حسابك لأي أحد.
4. تحقق من UID المدير في Authentication → Users؛ القيمة الموضوعة في الملف مأخوذة من المعلومات السابقة، لكن يجب التأكد أنها UID حساب المدير نفسه.
5. ارفع الملفات إلى جذر المستودع الحالي ثم انتظر تحديث GitHub Pages.

## الملفات
`index.html`, `app.js`, `style.css`, `manifest.json`, `sw.js`, `icon.svg`.

## تحذير أمان مهم
لا تترك Firestore rules مفتوحة (`allow read, write: if true`). إخفاء السجلات في الواجهة ليس حماية حقيقية. يجب أن تفرض قواعد Firestore صلاحيات المدير والموظف على الخادم قبل إدخال بيانات مرضى حقيقية. الموظف في هذه النسخة يفلتر السجلات في الواجهة، لكن هذا لا يكفي وحده لحماية البيانات. السجلات القديمة التي لا تحتوي `userId` أو `createdBy` تحتاج مراجعة قبل تطبيق العزل.

## التحويل إلى APK
هذه حزمة ملفات ويب PWA وليست APK جاهزاً. بعد رفعها على HTTPS وإكمال إعداد Firebase واختبار تسجيل الدخول والحفظ، افتح PWABuilder وأدخل رابط الموقع ثم اختر Android → Generate Package. راجع ملف assetlinks.json الناتج إذا أردت تجربة Trusted Web Activity بلا شريط عنوان. التفاصيل الرسمية: https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md

## ما تتضمنه النسخة
واجهة RTL داكنة بالذهبي، تسجيل دخول Firebase Email/Password، إنشاء حجز، البحث والتصفية، حذف المدير، تقارير إجمالية، تصدير CSV، وأيقونة وملفات PWA.
