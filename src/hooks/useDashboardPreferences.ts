
import { useEffect, useState } from 'react';
import { DateRangeType } from '@/components/filters/DateFilter';

interface DashboardPreferences {
  dateType: DateRangeType;
  viewMode: 'all' | 'favorites';
}

export const useDashboardPreferences = (isAdmin: boolean) => {
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  
  // Load user preferences
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('dashboardPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        
        if (prefs.dateType) setDateRangeType(prefs.dateType);
        if (prefs.viewMode && isAdmin) setViewMode(prefs.viewMode);
      }
    } catch (error) {
      console.error("Error loading preferences", error);
    }
  }, [isAdmin]);
  
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
  
  return {
    dateRangeType,
    setDateRangeType,
    viewMode,
    setViewMode
  };
};
