import { Metadata } from "next";

export const siteConfig = {
  name: "Plannerinator",
  title: "Plannerinator - Complete Life Management System",
  description:
    "Flexible life management app: tasks, events, notes, projects, and custom collections. Built with Next.js 15, TypeScript, and Better Auth.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  keywords: [
    "Task Management",
    "Calendar",
    "Notes",
    "Projects",
    "Life Management",
    "Productivity",
    "Next.js 15",
    "TypeScript",
    "Drizzle ORM",
    "Better Auth",
    "Cloudflare Workers",
    "Tailwind CSS",
    "shadcn/ui",
  ],
  creator: "@essedev",
};

export function createMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const metaDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title: fullTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.creator,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: fullTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
      creator: siteConfig.creator,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
