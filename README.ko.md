# OpDoc AI Auto Organizer

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

AI를 활용해 Obsidian 볼트를 자동으로 정리합니다. OpDoc은 받은 편지함 폴더를 감시하고, 새 Markdown 파일을 Ollama 또는 OpenAI로 분석해 프론트매터에 태그를 추가한 뒤 적절한 폴더로 이동합니다.

## 동작 방식

1. `.md` 파일을 **Inbox** 폴더에 넣습니다.
2. OpDoc이 파일 내용을 읽어 설정된 AI 제공자에게 전송합니다.
3. AI가 가장 적합한 대상 폴더와 관련 태그를 결정합니다.
4. OpDoc이 프론트매터에 태그를 작성하고 파일을 이동합니다.
5. 모든 작업은 `OpDoc-Log.md`에 기록됩니다.

## 기능

- **두 가지 AI 백엔드** — 로컬에서 무료로 실행하는 Ollama 또는 API 키가 필요한 클라우드 기반 OpenAI
- **임베딩 기반 폴더 매칭** — 벡터 유사도를 이용해 새 파일을 기존 폴더의 콘텐츠와 연결
- **6단계 온보딩 위저드** — 처음 실행할 때 설정 과정을 안내
- **자동 및 수동 처리** — 파일 생성 시 자동 처리, 5분 간격 스캔, 수동 명령 지원
- **프론트매터 태그 작성** — 정규식 대신 `processFrontMatter` API 사용
- **백오프 재시도** — 실패한 작업을 지수 백오프 방식으로 최대 3회 재시도
- **시작 시 밀린 파일 처리** — 재시작 후 받은 편지함에 남아 있는 파일을 자동 처리
- **활동 로그** — 원본 경로, 대상 경로, 상태, 태그, 처리 시간, 오류를 `OpDoc-Log.md`에 기록
- **오류 분류** — Ollama 연결 실패, 잘못된 API 키, 사용량 제한, 네트워크 오류 등에 관한 한국어 메시지 제공
- **파일명 충돌 해결** — `_1`부터 `_100`까지 접미사를 붙인 뒤 타임스탬프를 대체 값으로 사용

## 설치 및 설정

### 요구 사항

- Obsidian v1.5.0+
- **로컬 AI:** 로컬에서 실행 중인 [Ollama](https://ollama.ai) (예: 분석용 `llama3.2`, 임베딩용 `nomic-embed-text`)
- **클라우드 AI:** OpenAI API 키

### 설치

1. `main.js`, `styles.css`, `manifest.json`을 볼트의 `.obsidian/plugins/opdoc-ai-auto-organizer/` 디렉터리에 복사합니다.
2. **Obsidian 설정 → 커뮤니티 플러그인**에서 플러그인을 활성화합니다.
3. 처음 활성화하면 온보딩 위저드가 자동으로 열립니다.

### Ollama 설정

```bash
# Ollama 설치 (https://ollama.ai)
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve
```

OpDoc은 온보딩 중 Ollama를 `http://localhost:11434`에서 자동 감지합니다.

## 명령어

| 명령어 | 설명 |
|---------|------|
| `Process inbox now` | 받은 편지함을 수동으로 스캔하고 처리 |
| `Rebuild embedding cache` | 유사도 매칭용 폴더 임베딩 재구축 |

## 설정

| 항목 | 기본값 | 설명 |
|------|--------|------|
| Inbox folder | `Inbox` | 처리되지 않은 파일을 보관하는 폴더 |
| Processing delay | Immediate | 새 파일 처리 전 지연 시간 |
| AI provider | Ollama | `ollama` 또는 `openai` |
| AI model | `llama3.2` | 파일 분석용 채팅 모델 |
| Embedding provider | Ollama Local | `ollama_local` 또는 `openai_cloud` |
| Embedding model | `nomic-embed-text` | 벡터 임베딩용 모델 |
| Similarity threshold | `0.6` | 폴더 제안 최소 코사인 유사도 |
| Custom instructions | (empty) | AI 분석에 사용할 추가 지침 |
| Activity logging | Enabled | 처리 결과를 `OpDoc-Log.md`에 기록 |

## 프라이버시

OpDoc에는 텔레메트리, 사용 분석 또는 기타 추적 기능이 없습니다. Ollama를 사용하면 노트 내용이 설정된 Ollama 엔드포인트로만 전송됩니다. OpenAI를 사용하면 처리를 위해 노트 내용이 설정된 OpenAI 호환 엔드포인트로 직접 전송됩니다. API 키는 Obsidian에 로컬로 저장됩니다. 클라우드 서비스를 사용하기 전에 해당 AI 제공자의 개인정보 처리방침을 확인하세요.

## 의견 및 기여

이슈와 풀 리퀘스트는 어떤 언어로 작성해도 됩니다. 기여하기 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 읽고, [버그를 제보하거나 기능을 제안](https://github.com/rklpoi5678/OpDoc-AI-Auto-Organizer/issues/new/choose)해 주세요. 풀 리퀘스트는 한 가지 변경에 집중하고 검증 방법을 설명해 주세요.

## 개발

```bash
npm install
npm run dev        # watch mode
npm run build      # production build
npm run lint       # ESLint check
```

## 릴리즈

- `manifest.json`에 새 버전 번호와 최소 Obsidian 버전을 반영합니다.
- 이전 Obsidian 버전에서도 호환되는 릴리즈를 받을 수 있도록 `versions.json`에 `"new-version": "minimum-obsidian-version"`을 추가합니다.
- 버전 번호를 태그로 사용해 GitHub 릴리즈를 생성합니다. `v` 접두사는 붙이지 않습니다.
- `manifest.json`, `main.js`, `styles.css`를 릴리즈 파일로 업로드합니다.

> `manifest.json`에서 `minAppVersion` 업데이트 후 `npm version patch|minor|major` 실행 시 모든 파일의 버전이 일괄 업데이트됩니다.

## 커뮤니티 플러그인 등록

- [플러그인 가이드라인](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)을 검토합니다.
- 저장소 루트에 `README.md`를 포함해 첫 릴리즈를 배포합니다.
- [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)에 풀 리퀘스트를 열어 `community-plugins.json`에 플러그인을 추가합니다.

```json
{
    "id": "opdoc-ai-auto-organizer",
    "name": "OpDoc AI Auto Organizer",
    "author": "hey_yoon",
    "description": "AI 분석으로 Markdown 파일을 자동 정리합니다. 태그를 추가하고 받은 편지함의 파일을 적절한 폴더로 이동합니다.",
    "repo": "rklpoi5678/OpDoc-AI-Auto-Organizer"
}
```

- 승인되면 [Obsidian 포럼 쇼케이스](https://forum.obsidian.md)와 [Discord](https://discord.gg/obsidianmd)의 `#updates` 채널에 공지합니다. Discord 개발자 역할이 필요합니다.
