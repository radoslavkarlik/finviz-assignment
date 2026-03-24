import { useGetApi } from "./api/taxonomy";

export function Taxonomy() {
  const { data } = useGetApi();

  return (
    <main className="border border-amber-200 bg-amber-400 p-4 text-center text-xs text-amber-700 flex flex-col gap-2">
      {data?.data.map((item, index) => (
        <div key={index}>{item.name}</div>
      ))}
    </main>
  );
}
