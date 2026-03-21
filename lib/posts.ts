import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  sources?: {
    type: "official-docs" | "github" | "youtube" | "paper";
    label: string;
    url: string;
  }[];
  youtube?: string[];
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(contentDirectory)) return [];

  const fileNames = fs.readdirSync(contentDirectory);
  return fileNames
    .filter((name) => name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const filePath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: (data.title as string) || slug,
        description: (data.description as string) || "",
        sources: data.sources,
        youtube: data.youtube,
      };
    });
}

export async function getPost(slug: string) {
  const filePath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(content);

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    sources: data.sources as PostMeta["sources"],
    youtube: data.youtube as string[],
    contentHtml: processedContent.toString(),
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) return [];

  return fs
    .readdirSync(contentDirectory)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}
