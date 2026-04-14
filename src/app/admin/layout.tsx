import SessionProvider from "@/components/SessionProvider";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
