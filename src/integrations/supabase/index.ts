
export * from './core';
export * from './departments';
export * from './managers';
export * from './metrics';
export * from './types/department';
// Explicitly re-export the Manager interface to resolve ambiguity
export { type Manager } from './types/manager';
export * from './types/metric';
