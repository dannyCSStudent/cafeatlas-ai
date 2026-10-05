import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function buildQuery(searchParams: SearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  const result = query.toString();
  return result ? `?${result}` : "";
}

export default async function CoffeesCompatibilityPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  redirect(`/${buildQuery((await searchParams) ?? {})}`);
}
