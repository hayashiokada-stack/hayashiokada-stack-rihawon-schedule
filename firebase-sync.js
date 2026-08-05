// ──────────────────────────────────────────────────────────────
//  firebase-sync.js — 리하원 근무·송영 프로그램 클라우드 동기화 계층
//  - 로그인(이메일/비밀번호) + Firestore 문서 저장/불러오기 원시 기능을 window.CLOUD 로 제공
//  - 설정값이 자리표시자면 "local-only" 모드로 동작(클라우드/로그인 비활성)
//  - 각 페이지(index.html / transport/index.html)가 이 원시 기능으로 월별/DB 문서를 동기화
// ──────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const cfg = window.FIREBASE_CONFIG || {};
const enabled = !!cfg.apiKey && !/^PASTE|^YOUR_/.test(cfg.apiKey);

// window.CLOUD 기본 골격 (local-only 모드에서도 안전하게 호출되도록 no-op 제공)
const CLOUD = {
  enabled,
  ready: false,
  user: null,
  async signIn() { throw new Error("cloud disabled"); },
  async signOut() {},
  async loadDoc() { return null; },
  async saveDoc() {},
};
window.CLOUD = CLOUD;

function announceLoaded() {
  window.dispatchEvent(new Event("cloud-loaded"));
}
function announceAuth(user) {
  window.dispatchEvent(new CustomEvent("cloud-auth", { detail: { user } }));
}

if (!enabled) {
  // 설정 전: 클라우드 없이 로컬 전용으로 동작
  CLOUD.ready = true;
  announceLoaded();
} else {
  try {
    const app = initializeApp(cfg);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // 브라우저에 로그인 유지 (한 번 로그인하면 근무표·송영 두 페이지 공통 인증)
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    CLOUD.signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
    CLOUD.signOut = () => signOut(auth);
    CLOUD.loadDoc = async (path) => {
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() : null;
    };
    CLOUD.saveDoc = async (path, data) => setDoc(doc(db, path), data);

    onAuthStateChanged(auth, (user) => {
      CLOUD.user = user;
      CLOUD.ready = true;
      announceAuth(user);
    });

    announceLoaded();
  } catch (e) {
    console.error("[cloud] 초기화 실패 — 로컬 전용으로 전환합니다.", e);
    CLOUD.enabled = false;
    CLOUD.ready = true;
    announceLoaded();
  }
}
