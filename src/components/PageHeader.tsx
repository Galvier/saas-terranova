
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
  backButton?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actionButton, backButton }) => {
  return (
    <div className="pb-6 border-b mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          {backButton && (
            <div>{backButton}</div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {actionButton && (
            <div>{actionButton}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
