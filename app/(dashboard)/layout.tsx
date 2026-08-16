// components
import Navbar from "@/components/Navbar";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function HeistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedLayout>
      <Navbar />
      <main>{children}</main>
    </ProtectedLayout>
  );
}
