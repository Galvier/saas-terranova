
import { useEffect } from 'react';
import { DateRangeType } from '@/components/filters/DateFilter';

export const usePreferences = (
  dateRangeType: DateRangeType,
  viewMode: 'all' | 'favorites'
) => {
  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem('dashboardPreferences', JSON.stringify({
        dateType: dateRangeType,
        viewMode: viewMode,
      }));
    } catch (error) {
      console.error("Error saving preferences", error);
    }
  }, [dateRangeType, viewMode]);
};
