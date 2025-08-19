import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Layout from "@/components/layout"

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">NealUI</h1>
        <p className="text-lg">Welcome to NealUI</p>
      </div>
    </Layout>
  );
}
