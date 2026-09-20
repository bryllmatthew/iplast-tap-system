import { registrationFieldCatalog } from "@/lib/registration-fields";
import type { FormField } from "@/lib/types";

export function RegistrationFieldChecklist({
  selectedFieldIds,
  selectedFields
}: {
  selectedFieldIds?: string[];
  selectedFields?: FormField[];
}) {
  const selected = new Set(
    selectedFields?.map((field) => field.id) ||
      selectedFieldIds ||
      registrationFieldCatalog.filter((field) => field.defaultSelected).map((field) => field.id)
  );
  const required = new Set(selectedFields?.filter((field) => field.required).map((field) => field.id) || registrationFieldCatalog.filter((field) => field.required).map((field) => field.id));
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
                <div key={field.id} className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-slate-600">
                  {field.required ? <input type="hidden" name="registration_fields" value={field.id} /> : null}
                  {field.required ? <input type="hidden" name="required_registration_fields" value={field.id} /> : null}
                  <div className="flex items-start gap-3">
                    <input
                      className="mt-1 size-4 accent-[#0a84ff]"
                      name="registration_fields"
                      type="checkbox"
                      value={field.id}
                      defaultChecked={field.required || selected.has(field.id)}
                      disabled={field.required}
                    />
                    <div className="min-w-0">
                      <span className="block text-ink">{field.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{field.field_type.replace("_", " ")} field</span>
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 text-xs font-black uppercase text-slate-500">
                    <input
                      className="size-4 accent-[#0a84ff]"
                      name="required_registration_fields"
                      type="checkbox"
                      value={field.id}
                      defaultChecked={field.required || required.has(field.id)}
                      disabled={field.required}
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
