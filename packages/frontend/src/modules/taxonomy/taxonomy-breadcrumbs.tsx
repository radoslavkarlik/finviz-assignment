import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "#components/ui/breadcrumb";
import { Skeleton } from "#components/ui/skeleton";
import { Fragment } from "react/jsx-runtime";

type Props = {
  readonly breadcrumbs: ReadonlyArray<string>;
  readonly isLoading?: boolean;
  readonly onClick: (breadcrumb: string, index: number) => void;
};

export function TaxonomyBreadcrumbs({ breadcrumbs, isLoading, onClick }: Props) {
  if (isLoading) {
    return <Skeleton className="h-4 w-72" />;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index >= breadcrumbs.length - 1;

          return (
            <Fragment key={breadcrumb}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem
                onClick={!isLast ? () => onClick(breadcrumb, index) : undefined}
                className={!isLast ? "text-foreground" : undefined}
              >
                {breadcrumb}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
