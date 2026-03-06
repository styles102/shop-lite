import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore  = await cookies()
  console.log(cookieStore.get('basketId')?.value);
  console.log(process.env['services__server__https__0']);
  return (
    <main>
      <h1>Shop Lite</h1>
    </main>
  )
}
