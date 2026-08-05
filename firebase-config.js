// ──────────────────────────────────────────────────────────────
//  Firebase 웹 설정 (리하원 근무·송영 프로그램)
//  ▶ 여기 값을 리하원 Firebase 프로젝트의 "웹 앱 구성"으로 교체하세요.
//    Firebase 콘솔 → 프로젝트 설정 → 내 앱 → 웹 앱(</>) → SDK 설정 및 구성 → firebaseConfig
//    (웹 apiKey는 비밀이 아니며 노출돼도 됩니다. 실제 보안은 로그인 + Firestore 보안규칙으로 걸립니다.)
//
//  설정 방법 전체는 FIREBASE_SETUP.md 를 참고하세요.
//  아래 값이 자리표시자(PASTE_...) 인 동안에는 클라우드/로그인이 꺼지고
//  기존처럼 브라우저 localStorage 전용으로 정상 동작합니다.
// ──────────────────────────────────────────────────────────────
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCYKs2wlWqrAYtUJrd_1KekVCnykmHURGc",
  authDomain:        "work-shift-pickup.firebaseapp.com",
  projectId:         "work-shift-pickup",
  storageBucket:     "work-shift-pickup.firebasestorage.app",
  messagingSenderId: "288928948175",
  appId:             "1:288928948175:web:7898a3c542be19ae39fcba",
  measurementId:     "G-PJKSMP00YZ",
};

// 센터 식별자 (Firestore 경로에 사용). 향후 멀티센터로 확장할 때 이 값만 분리하면 됩니다.
window.FIREBASE_CENTER_ID = "rihawon";
