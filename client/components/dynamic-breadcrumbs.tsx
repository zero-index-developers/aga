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

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // Generate segments from pathname
  const segments = pathname.split('/').filter(Boolean).filter(s => s !== 'app');

  const labelMap: Record<string, string> = {
    'repos': 'Repositories',
    'logs': 'Scan Logs',
    'settings': 'Account Settings',
    'configs': 'System Configurations',
  };

  const breadcrumbs = segments.map((segment) => {
    const actualSegments = pathname.split('/').filter(Boolean);
    const actualIndex = actualSegments.indexOf(segment);
    const href = `/${actualSegments.slice(0, actualIndex + 1).join('/')}`;
    const title = labelMap[segment] || decodeURIComponent(segment);
    return { title, href };
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
