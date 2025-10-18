import StaffAuthGuard from "../components/StaffAuthGuard";
import MaintenancePage from "../components/MaintenancePage";
import ChatWidget from "../components/ChatWidget";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  // Enable maintenance mode for all staff functionality
  const maintenanceMode = false;

  if (maintenanceMode) {
    return (
      <StaffAuthGuard>
        <MaintenancePage 
          title="Staff Portal Maintenance"
          description="The staff portal is currently under maintenance. We're upgrading the system to provide you with better features and improved performance."
          expectedCompletion="We expect to complete this maintenance within 24-48 hours. We apologize for any inconvenience."
          contactInfo="For urgent matters, please contact your supervisor or HR department directly."
        />
      </StaffAuthGuard>
    );
  }

  return (
    <StaffAuthGuard>
      {children}
      <ChatWidget />
    </StaffAuthGuard>
  );
}

