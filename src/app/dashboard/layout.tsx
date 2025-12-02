import { OrganizationProvider } from "~/lib/organization/context";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  );
}