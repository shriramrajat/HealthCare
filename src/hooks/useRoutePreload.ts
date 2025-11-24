import { useCallback } from 'react';

// Route preload functions
const routePreloaders: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('../pages/PatientDashboard'),
  '/doctor-dashboard': () => import('../pages/DoctorDashboard'),
  '/appointments': () => import('../pages/Appointments'),
  '/medications': () => import('../pages/Medications'),
  '/symptoms': () => import('../pages/Symptoms'),
  '/teleconsultation': () => import('../pages/Teleconsultation'),
  '/education': () => import('../pages/Education'),
  '/reviews': () => import('../pages/Reviews'),
  '/diagnostic': () => import('../pages/DiagnosticTest'),
};

// Track which routes have been preloaded
const preloadedRoutes = new Set<string>();

export function useRoutePreload() {
  const preloadRoute = useCallback((path: string) => {
    // Don't preload if already preloaded
    if (preloadedRoutes.has(path)) {
      return;
    }

    const preloader = routePreloaders[path];
    if (preloader) {
      preloader()
        .then(() => {
          preloadedRoutes.add(path);
          console.log(`Preloaded route: ${path}`);
        })
        .catch((error) => {
          console.error(`Failed to preload route ${path}:`, error);
        });
    }
  }, []);

  const handleMouseEnter = useCallback(
    (path: string) => {
      return () => preloadRoute(path);
    },
    [preloadRoute]
  );

  const handleFocus = useCallback(
    (path: string) => {
      return () => preloadRoute(path);
    },
    [preloadRoute]
  );

  return {
    preloadRoute,
    handleMouseEnter,
    handleFocus,
  };
}
