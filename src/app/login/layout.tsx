export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // no header/footer/layout wrapper
    return <>{children}</>;
}
