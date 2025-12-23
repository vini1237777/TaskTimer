type GqlResponse<T> = { data?: T; errors?: { message: string }[] };

export async function gql<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    credentials: "include",
  });

  const payload = (await res.json()) as GqlResponse<T>;

  if (!res.ok) {
    throw new Error(payload.errors?.[0]?.message || `HTTP_${res.status}`);
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  if (!payload.data) throw new Error("NO_DATA");
  return payload.data;
}
