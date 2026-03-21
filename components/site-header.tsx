"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { findStudyItem } from "@/lib/curriculum";

export function SiteHeader() {
  const pathname = usePathname();

  const crumbs = buildCrumbs(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>홈</BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <ThemeToggle />
    </header>
  );
}

function buildCrumbs(pathname: string) {
  if (pathname === "/") return [];

  if (pathname.startsWith("/study/")) {
    const slug = pathname.replace("/study/", "");
    const found = findStudyItem(slug);
    if (found) {
      return [
        { label: found.track.title, href: `/#${found.track.id}` },
        { label: found.item.title, href: pathname },
      ];
    }
    return [{ label: slug, href: pathname }];
  }

  if (pathname === "/posts") {
    return [{ label: "팀 블로그", href: "/posts" }];
  }

  if (pathname.startsWith("/posts/")) {
    return [
      { label: "팀 블로그", href: "/posts" },
      { label: pathname.replace("/posts/", ""), href: pathname },
    ];
  }

  return [];
}
