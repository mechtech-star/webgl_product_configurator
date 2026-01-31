/**
 * App Component
 * Main application layout and state management
 */

import { useConfiguratorStore } from '../store/configurator.store';
import { AppThemeProvider } from '../components/theme/ThemeProvider';
import { TopBar } from '../components/layout/TopBar';
import { Viewport } from '../components/layout/Viewport';
import { Inspector } from '../components/layout/Inspector';
import { FileUploader } from '../components/configurator/FileUploader';

function AppContent() {
  const store = useConfiguratorStore();
  const hasModel = store.modelUrl !== null;

  return (
    <div className="flex flex-col h-screen bg-card">
      {/* Top Bar - Always visible */}
      <TopBar />

      {/* Main Content */}
      {hasModel ? (
        // Loaded State: Viewport and Inspector layout
        <div className="flex flex-1 overflow-hidden">
          {/* Viewport */}
          <Viewport />

          {/* Right Inspector */}
          <Inspector />
        </div>
      ) : (
        // Empty State: Centered upload area
        <div className="flex-1 flex items-center justify-center p-8">
          <FileUploader />
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
