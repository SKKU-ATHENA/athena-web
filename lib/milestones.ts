export interface Milestone {
  id: string;
  label: string;
  period: string;
  goals: string[];
  status: "completed" | "in-progress" | "upcoming";
}

export const milestones: Milestone[] = [
  {
    id: "m0",
    label: "M0",
    period: "~3월",
    goals: ["인프라 세팅", "팀 온보딩"],
    status: "in-progress",
  },
  {
    id: "m1",
    label: "M1",
    period: "4월",
    goals: ["PROTOv1 개선", "v2 핵심 파이프라인"],
    status: "upcoming",
  },
  {
    id: "m2",
    label: "M2",
    period: "5월",
    goals: ["v2 완성", "Notion 연동"],
    status: "upcoming",
  },
  {
    id: "m3",
    label: "M3",
    period: "6월 초",
    goals: ["테스트", "평가", "최적화"],
    status: "upcoming",
  },
  {
    id: "m4",
    label: "M4",
    period: "6월 중",
    goals: ["발표 준비", "최종 제출"],
    status: "upcoming",
  },
];
