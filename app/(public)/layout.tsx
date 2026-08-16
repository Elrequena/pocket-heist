import PublicLayout from "@/components/PublicLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicLayout>
      <main className="public">{children}</main>
    </PublicLayout>
  );
}
