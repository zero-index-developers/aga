"use client";

import React, { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  
  // Generate segments from pathname
  // e.g., /repos/aga -> ["repos", "aga"]
  const segments = pathname.split('/').filter(Boolean);
  
  // Define custom labels for specific segments
  const labelMap: Record<string, string> = {
    'repos': 'Repositories',
  };

  const breadcrumbs = segments[0] === 'repos' 
    ? segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const title = labelMap[segment] || decodeURIComponent(segment);
        return { title, href };
      })
    : [
        { title: 'Console', href: '/' },
        ...segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const title = labelMap[segment] || decodeURIComponent(segment);
          return { title, href };
        }),
      ];

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isOverview = item.title.toLowerCase() === 'console' && breadcrumbs.length > 1;

          return (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize font-semibold text-primary">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="capitalize hover:text-foreground transition-colors">
                      {item.title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
