import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// IMPORTANT: Replace the PASTE_ values with your project's exact Firebase web config.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "clinic-bookings-yousef.firebaseapp.com",
  projectId: "clinic-bookings-yousef",
  storageBucket: "clinic-bookings-yousef.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_FIREBASE_APP_ID",
  measurementId: "PASTE_YOUR_MEASUREMENT_ID"
};
// Check this UID against Firebase Authentication > Users before using.
const MANAGER_UID = "A0GUrFHbRdWeKWw35HqsQ9Ffbp43";
const $ = id => document.getElementById(id);
let auth, db, currentUser = null, isManager = false, allBookings = [], stopBookings = null;
const configReady = !Object.values(firebaseConfig).some(v => String(v).startsWith("PASTE_"));
function message(el, text, error=false) { el.textContent=text; el.classList.toggle("error",error); }
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
$("bookingDate").value=localDate();
if(!configReady) message($("loginMsg"),"يلزم إدخال بيانات Firebase الحقيقية داخل app.js قبل تسجيل الدخول.",true);
else { try { const app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app); onAuthStateChanged(auth,user=>{currentUser=user;if(!user){showLogin();return;}isManager=user.uid===MANAGER_UID;showApp();listenBookings();}); } catch(e){message($("loginMsg"),"تعذر تهيئة Firebase: "+e.message,true);} }
function showLogin(){if(stopBookings)stopBookings();stopBookings=null;allBookings=[];$("loginPanel").classList.remove("hidden");$("appPanel").classList.add("hidden");$("userBadge").classList.add("hidden");}
function showApp(){$("loginPanel").classList.add("hidden");$("appPanel").classList.remove("hidden");$("userBadge").classList.remove("hidden");$("userBadge").textContent=isManager?"المدير":"موظف";$("roleNotice").textContent=isManager?"حساب المدير: إدارة السجلات التي تسمح بها قواعد قاعدة البيانات.":"حساب موظف: يجب أن تفرض قواعد Firestore عزل حجوزات الموظفين على الخادم.";document.querySelectorAll(".nav-card[data-view='reports']").forEach(b=>b.classList.toggle("hidden",!isManager));}
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!configReady||!auth)return message($("loginMsg"),"أكمل إعداد Firebase داخل app.js أولاً.",true);const btn=e.currentTarget.querySelector("button");btn.disabled=true;message($("loginMsg"),"جارٍ تسجيل الدخول…");try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);message($("loginMsg"),"تم تسجيل الدخول.");}catch(err){message($("loginMsg"),friendlyAuthError(err.code),true);}finally{btn.disabled=false;}});
function friendlyAuthError(code){const e={"auth/invalid-credential":"البريد الإلكتروني أو كلمة المرور غير صحيحة.","auth/user-not-found":"هذا الحساب غير موجود في Firebase Authentication.","auth/wrong-password":"كلمة المرور غير صحيحة.","auth/invalid-email":"صيغة البريد الإلكتروني غير صحيحة.","auth/too-many-requests":"محاولات كثيرة؛ انتظر قليلاً ثم حاول مجدداً.","auth/network-request-failed":"تحقق من اتصال الإنترنت.","auth/operation-not-allowed":"فعّل Email/Password من Firebase Authentication."};return e[code]||("تعذر تسجيل الدخول: "+code);}
$("logoutBtn").addEventListener("click",async()=>{try{await signOut(auth);}catch(e){message($("appMsg"),e.message,true);}});
function listenBookings(){if(stopBookings)stopBookings();message($("appMsg"),"جارٍ تحميل الحجوزات…");const q=query(collection(db,"bookings"),orderBy("createdAt","desc"));stopBookings=onSnapshot(q,snap=>{allBookings=snap.docs.map(d=>({id:d.id,...d.data()})).filter(b=>isManager||b.userId===currentUser.uid||b.createdBy===currentUser.uid);renderBookings();message($("appMsg"),"");},err=>{message($("appMsg"),"تعذر تحميل الحجوزات. راجع قواعد Firestore: "+err.message,true);$("bookingsBody").innerHTML='<tr><td colspan="6" class="empty">تعذر تحميل البيانات</td></tr>';});}
$("bookingForm").addEventListener("submit",async e=>{e.preventDefault();if(!currentUser)return;const btn=e.currentTarget.querySelector("button");btn.disabled=true;const record={patientName:$("patientName").value.trim(),age:Number($("patientAge").value),fee:Number($("fee").value),doctor:$("doctor").value.trim(),date:$("bookingDate").value,notes:$("notes").value.trim(),userId:currentUser.uid,createdBy:currentUser.uid,createdAt:serverTimestamp()};try{await addDoc(collection(db,"bookings"),record);e.currentTarget.reset();$("bookingDate").value=localDate();message($("appMsg"),"تم حفظ الحجز بنجاح.");}catch(err){message($("appMsg"),"لم يُحفظ الحجز. راجع قواعد Firestore: "+err.message,true);}finally{btn.disabled=false;}});
function filteredBookings(){const term=$("searchInput").value.trim().toLowerCase(),date=$("filterDate").value;return allBookings.filter(b=>(!date||b.date===date)&&(!term||String(b.patientName||"").toLowerCase().includes(term)||String(b.doctor||"").toLowerCase().includes(term)));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderBookings(){const rows=filteredBookings();$("countPill").textContent=`${rows.length} حجز`;$('reportCount').textContent=rows.length;$('reportTotal').textContent=rows.reduce((n,b)=>n+(Number(b.fee)||0),0).toLocaleString("en-US")+" د.ع";$('bookingsBody').innerHTML=rows.length?rows.map(b=>`<tr><td>${esc(b.patientName)}</td><td>${esc(b.age)}</td><td>${esc(b.doctor||"—")}</td><td>${esc(b.date||"—")}</td><td>${(Number(b.fee)||0).toLocaleString("en-US")} د.ع</td><td>${isManager?`<button class="delete-btn" data-delete="${esc(b.id)}">حذف</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="6" class="empty">لا توجد حجوزات مطابقة.</td></tr>';}
$("bookingsBody").addEventListener("click",async e=>{const id=e.target?.dataset?.delete;if(!id||!isManager||!confirm("هل تريد حذف هذا الحجز نهائياً؟"))return;try{await deleteDoc(doc(db,"bookings",id));message($("appMsg"),"تم حذف الحجز.");}catch(err){message($("appMsg"),"تعذر الحذف؛ تحقق من قواعد Firestore.",true);}});
$("searchInput").addEventListener("input",renderBookings);$("filterDate").addEventListener("change",renderBookings);$("clearFilter").addEventListener("click",()=>{$("filterDate").value="";$("searchInput").value="";renderBookings();});
document.querySelectorAll(".nav-card[data-view]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav-card[data-view]").forEach(x=>x.classList.toggle("active",x===btn));const r=btn.dataset.view==="reports";$("bookingsView").classList.toggle("hidden",r);$("reportsView").classList.toggle("hidden",!r);}));
$("exportBtn").addEventListener("click",()=>{const rows=filteredBookings(),data=[["اسم المريض","العمر","الطبيب","التاريخ","أجور الكشفية","ملاحظات"],...rows.map(b=>[b.patientName,b.age,b.doctor,b.date,b.fee,b.notes])];const csv="\uFEFF"+data.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="clinic-bookings.csv";a.click();URL.revokeObjectURL(url);});
if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
