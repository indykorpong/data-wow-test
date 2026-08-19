export async function getHello() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`);
  return res.text();
}
