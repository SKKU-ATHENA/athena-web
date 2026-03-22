export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  area: string;
  bio: string;
  initial: string;
  skills: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "팀원 1",
    role: "PM / Backend",
    roleColor: "var(--chart-1)",
    area: "프로젝트 관리, API 설계",
    bio: "프로젝트 전체 일정과 백엔드 아키텍처를 담당합니다.",
    initial: "P",
    skills: ["Python", "FastAPI", "프로젝트 관리"],
  },
  {
    id: "member-2",
    name: "팀원 2",
    role: "KG Engineer",
    roleColor: "var(--chart-2)",
    area: "Neo4j, 엔티티 추출",
    bio: "Knowledge Graph 구축과 Neo4j 쿼리 최적화를 담당합니다.",
    initial: "K",
    skills: ["Neo4j", "Cypher", "APOC"],
  },
  {
    id: "member-3",
    name: "팀원 3",
    role: "ML Engineer",
    roleColor: "var(--chart-3)",
    area: "임베딩, GraphRAG",
    bio: "임베딩 모델 선택과 GraphRAG 파이프라인을 담당합니다.",
    initial: "M",
    skills: ["LangChain", "OpenAI", "GraphRAG"],
  },
  {
    id: "member-4",
    name: "팀원 4",
    role: "Frontend",
    roleColor: "var(--chart-4)",
    area: "Next.js, UI/UX",
    bio: "학습 웹사이트 개발과 사용자 경험 설계를 담당합니다.",
    initial: "F",
    skills: ["Next.js", "React", "Tailwind"],
  },
  {
    id: "member-5",
    name: "팀원 5",
    role: "Data Engineer",
    roleColor: "var(--chart-5)",
    area: "데이터 파이프라인, Notion",
    bio: "데이터 수집/전처리와 Notion 연동을 담당합니다.",
    initial: "D",
    skills: ["Python", "Notion API", "ETL"],
  },
  {
    id: "member-6",
    name: "팀원 6",
    role: "QA / DevOps",
    roleColor: "var(--primary)",
    area: "테스트, 배포, 문서화",
    bio: "품질 관리와 CI/CD 파이프라인을 담당합니다.",
    initial: "Q",
    skills: ["GitHub Actions", "테스트", "문서화"],
  },
];

export const teamInfo = {
  name: "ATHENA Team",
  university: "성균관대학교",
  program: "Co-Deep Learning",
  semester: "2026-1학기",
  mission: "의사결정 근거를 Knowledge Graph로 구조화하여 '왜?' 질문에 인과 사슬로 응답하는 AI 시스템 구축",
  memberCount: 6,
};
