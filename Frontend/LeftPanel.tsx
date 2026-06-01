
export default function LeftPanel() {
  return (
    <Suspense fallback={<div className="flex w-full items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LeftPanelContent />
    </Suspense>
  );
}
