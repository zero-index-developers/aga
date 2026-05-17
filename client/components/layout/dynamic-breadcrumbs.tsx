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
} from "@client/components/ui/breadcrumb";
import { cn } from "@client/lib/utils";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // Generate segments from pathname
  const segments = pathname.split('/').filter(Boolean).filter(s => s !== 'app');

  const labelMap: Record<string, string> = {
    'repos': 'Repositories',
    'logs': 'Logs',
    'settings': 'Settings',
    'configs': 'Configurations',
  };

  const breadcrumbs = segments.map((segment) => {
    const actualSegments = pathname.split('/').filter(Boolean);
    const actualIndex = actualSegments.indexOf(segment);
    const href = `/${actualSegments.slice(0, actualIndex + 1).join('/')}`;
    const title = labelMap[segment] || decodeURIComponent(segment);
    const isRepo = actualSegments[actualIndex - 1] === 'repos';
    return { title, href, isRepo };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className={cn(
                    "font-semibold text-primary",
                    item.isRepo ? "lowercase" : "capitalize"
                  )}>
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={item.href} 
                      className={cn(
                        "hover:text-foreground transition-colors",
                        item.isRepo ? "lowercase" : "capitalize"
                      )}
                    >
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
