// ... (keep the existing imports)

// Add export keyword before the component
export const AdminSidebar = () => {
  return (
    <div className="h-full border-r border-border/40 bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <img
          src="/images/logo.png"
          alt="CNS Logo"
          className="h-8 w-8 mr-2"
        />
<div className="flex flex-col">
          <span className="font-semibold">CNS</span>
          <span className="text-xs text-muted-foreground">Canteen Network Simplifier</span>
        </div>
      </div>
      {/* Rest of the sidebar */}
    </div>
  );
};

// Keep the default export if it's being used elsewhere
export default AdminSidebar;
