import { ResourceAvailabilityPage } from "~/components/resources/ResourceAvailabilityPage";

export default function AvailabilityPage() {
  return (
    <div className="container mx-auto py-6">
      <ResourceAvailabilityPage />
    </div>
  );
}

export const metadata = {
  title: "Resource Availability Settings",
  description: "Configure day-specific availability patterns for resources",
};