import { registrationFieldCatalog } from "@/lib/registration-fields";

export function RegistrationFieldChecklist({ selectedFieldIds }: { selectedFieldIds?: string[] }) {
  const selected = new Set(selectedFieldIds || registrationFieldCatalog.filter((field) => field.defaultSelected).map((field) => field.id));
  const groups = Array.from(new Set(registrationFieldCatalog.map((field) => field.group)));

  return (
    <div className="grid gap-4">
      {groups.map((group) => {
        const fields = registrationFieldCatalog.filter((field) => field.group === group);
        return (
          <fieldset key={group} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <legend className="px-1 text-sm font-black text-cyan-700">{group}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-600">
                  {field.required ? <input type="hidden" name="registration_fields" value={field.id} /> : null}
                  <input
                    className="mt-1 size-4 accent-[#0a84ff]"
                    name="registration_fields"
                    type="checkbox"
                    value={field.id}
                    defaultChecked={field.required || selected.has(field.id)}
                    disabled={field.required}
                  />
                  <span>
                    <span className="block text-ink">{field.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {field.required ? "Required for creator records" : `${field.field_type.replace("_", " ")} field`}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
