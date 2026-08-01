type Category = { id: string; name: string; kind: "RECEITA" | "DESPESA" };

export function CategorySelectOptions({ categories }: { categories: Category[] }) {
  const receitas = categories.filter((c) => c.kind === "RECEITA");
  const despesas = categories.filter((c) => c.kind === "DESPESA");

  return (
    <>
      <option value="" disabled>
        Selecione...
      </option>
      {despesas.length > 0 && (
        <optgroup label="Despesas">
          {despesas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      )}
      {receitas.length > 0 && (
        <optgroup label="Receitas">
          {receitas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );
}
