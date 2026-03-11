import { cookies } from "next/headers";
import OrderPage from "./OrderForm";

export default async function Home() {
  const cookieStore  = await cookies()
  const basketId = cookieStore.get('basketId')?.value;

  return <OrderPage basketId={basketId} />
}
