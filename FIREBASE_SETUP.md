# Firebase 설정 가이드 (리하원 근무·송영 프로그램)

이 프로그램은 **저장 시 클라우드 반영 + 열 때 최신 불러오기** 방식으로 Firebase(Firestore + 로그인)에 연동됩니다.
아래 값을 채우기 전에는 기존처럼 **브라우저 localStorage 전용**으로 정상 동작하며, 값을 채우는 순간 로그인 화면과 클라우드 동기화가 켜집니다.

로그인 방식은 **센터 공용 계정 1개**(이메일/비밀번호)입니다. 관리자가 계정을 만들고, 근무를 편성하는 PC들에서 그 계정으로 로그인하면 근무표·송영표가 한 곳(클라우드)에 모입니다.

---

## 1단계 · Firebase 프로젝트 만들기
1. https://console.firebase.google.com 접속 → **프로젝트 추가** → 이름(예: `rihawon`) 지정 후 생성.

## 2단계 · 로그인(Authentication) 켜기
1. 좌측 **빌드 → Authentication → 시작하기**.
2. **Sign-in method** 탭 → **이메일/비밀번호** 사용 설정(사용 설정 ON) → 저장.
3. **Users** 탭 → **사용자 추가** → 센터 공용 계정 이메일·비밀번호 입력(예: `center@rihawon.kr`).
   - 이 이메일/비밀번호가 프로그램 로그인 화면에 입력할 값입니다.

## 3단계 · 데이터베이스(Firestore) 만들기
1. 좌측 **빌드 → Firestore Database → 데이터베이스 만들기**.
2. 위치는 `asia-northeast3(서울)` 권장, **프로덕션 모드**로 생성.
3. **규칙(Rules)** 탭에 아래 규칙을 붙여넣고 **게시**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 로그인한 사용자만 센터 데이터에 접근 가능
    match /centers/{center}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4단계 · 웹 설정값을 프로그램에 넣기
1. 좌측 톱니바퀴 **프로젝트 설정 → 일반** 탭 하단 **내 앱**에서 **웹(</>)** 앱 추가(별명 예: `rihawon-web`).
2. 표시되는 `firebaseConfig` 객체의 값들을 복사.
3. 저장소의 **`firebase-config.js`** 파일을 열어 `PASTE_...` 자리표시자를 그 값으로 교체:

```js
window.FIREBASE_CONFIG = {
  apiKey:            "AIza...",              // 실제 값으로 교체
  authDomain:        "rihawon.firebaseapp.com",
  projectId:         "rihawon",
  storageBucket:     "rihawon.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abcdef",
};
window.FIREBASE_CENTER_ID = "rihawon";
```

> 웹 `apiKey`는 **비밀번호가 아닙니다.** 노출돼도 되며, 실제 보안은 위 3단계 로그인 + Firestore 규칙으로 걸립니다.

## 5단계 · 배포 후 확인
1. 변경사항을 배포(Vercel).
2. 근무표(`/`) 또는 송영표(`/transport/`)를 열면 **로그인 화면**이 뜹니다. 센터 공용 계정으로 로그인.
3. 로그인하면 우측 상단에 `☁ 클라우드 저장됨` 표시가 나타나고, 편집·저장이 자동으로 클라우드에 반영됩니다.
4. 다른 PC에서 같은 계정으로 열면 최신본을 불러옵니다.

---

## 데이터 구조 (Firestore)
- 근무표(월별): `centers/rihawon/schedules/{연}_{월}` — 예 `centers/rihawon/schedules/2026_8`
- 송영표(전체): `centers/rihawon/transport/db`
- 각 문서는 `{ payload: "<JSON 문자열>", updatedAt, by }` 형태로, 프로그램이 쓰던 데이터를 그대로 담습니다.

## 동기화 방식 (중요)
- **비실시간**입니다. 저장 시 클라우드에 올리고, 페이지를 열 때(또는 월 전환 시) 최신본을 내려받습니다.
- 두 사람이 **동시에 같은 달**을 편집하면 나중에 저장한 쪽이 덮어씁니다(문서 단위 last-write-wins).
  같은 달을 동시에 편집하지 않도록 운영하시길 권장합니다(추후 실시간 동시편집이 필요하면 확장 가능).

## 향후 확장(선택)
- 직원별 계정 + 직종별 권한(보안 규칙 세분화)
- 실시간 동시편집(onSnapshot)
- 멀티센터(SaaS): `FIREBASE_CENTER_ID`만 센터별로 분리하면 데이터가 자동 격리됩니다.
