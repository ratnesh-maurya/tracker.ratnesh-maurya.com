export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // On desktop: push content right of the 224px (w-56) sidebar
        // On mobile: add bottom padding for the fixed bottom nav
        <div className="lg:ml-56 xl:ml-60 min-h-screen pb-20 lg:pb-0">
            {children}
        </div>
    );
}
