"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, ErrorText, Input, Label, Select, CollapsibleSection } from "@/components/ui";
import { asignarPlan, buscarAlumnos, cambiarEstadoPlan, crearPlan, generarCuota, getEstadoAlumno, registrarPago } from "./actions";

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  billing_period: string;
  is_free: boolean;
  is_active: boolean;
};

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(value);

export function CuotasClient({ plans, isAdmin }: { plans: Plan[]; isAdmin: boolean }) {
  const router = useRouter();
  const [studentQuery, setStudentQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentState, setStudentState] = useState<any | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [planNotes, setPlanNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const [newPlan, setNewPlan] = useState({ name: "", code: "", description: "", amount: "", billingPeriod: "monthly", isFree: false });
  const [planError, setPlanError] = useState<string | null>(null);

  async function searchStudent(value: string) {
    setStudentQuery(value);
    setStudentError(null);
    if (value.trim().length < 2) {
      setStudents([]);
      return;
    }
    const result = await buscarAlumnos(value);
    if (result.error) setStudentError(result.error);
    else setStudents(result.data ?? []);
  }

  function selectStudent(student: any) {
    setSelectedStudent(student);
    setStudents([]);
    setStudentQuery(student.full_name);
    setStudentError(null);
    startTransition(async () => {
      const result = await getEstadoAlumno(student.id);
      if (result.error) setStudentError(result.error);
      else setStudentState(result);
    });
  }

  function handleAssignPlan(planId: string) {
    if (!selectedStudent) return;
    startTransition(async () => {
      const result = await asignarPlan(selectedStudent.id, planId, planNotes);
      if (result.error) return setStudentError(result.error);
      setPlanNotes("");
      const fresh = await getEstadoAlumno(selectedStudent.id);
      if (!fresh.error) setStudentState(fresh);
      router.refresh();
    });
  }

  function handleGenerateCharge(month: string, dueDate: string) {
    if (!selectedStudent || !studentState?.membership?.id) return;
    startTransition(async () => {
      const result = await generarCuota({ studentId: selectedStudent.id, membershipId: studentState.membership.id, periodMonth: month, dueDate });
      if (result.error) setStudentError(result.error);
      else {
        const fresh = await getEstadoAlumno(selectedStudent.id);
        if (!fresh.error) setStudentState(fresh);
      }
    });
  }

  function handleNewPlan(e: FormEvent) {
    e.preventDefault();
    setPlanError(null);
    startTransition(async () => {
      const result = await crearPlan({
        ...newPlan,
        amount: Number(newPlan.amount || 0),
        billingPeriod: newPlan.billingPeriod as "monthly" | "one_time" | "other",
      });
      if (result.error) return setPlanError(result.error);
      setNewPlan({ name: "", code: "", description: "", amount: "", billingPeriod: "monthly", isFree: false });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Asignar un plan</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">El plan <strong>Gratis / Comunitario</strong> tiene $0 y no genera deuda.</p>
          <div className="mt-4">
            <Label htmlFor="student-finance-search">Buscar alumno</Label>
            <Input id="student-finance-search" value={studentQuery} onChange={(e) => searchStudent(e.target.value)} placeholder="Nombre o DNI…" autoComplete="off" />
            {students.length > 0 && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {students.map((student) => (
                  <button key={student.id} type="button" onClick={() => selectStudent(student)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                    <span className="font-medium">{student.full_name}</span>
                    <span className="text-xs text-slate-500">{student.dni ?? "Sin DNI"}</span>
                  </button>
                ))}
              </div>
            )}
            <ErrorText>{studentError}</ErrorText>
          </div>

          {selectedStudent && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{selectedStudent.full_name}</p>
                  <p className="text-xs text-slate-500">{selectedStudent.dni ?? "Sin DNI"}</p>
                </div>
                {!selectedStudent.is_active && <Badge tone="warning">Inactivo</Badge>}
              </div>

              <div className="mt-4">
                <Label htmlFor="plan-select">Plan</Label>
                <Select id="plan-select" value={studentState?.membership?.plan_id ?? ""} onChange={(e) => handleAssignPlan(e.target.value)} disabled={isPending}>
                  <option value="">Seleccionar plan…</option>
                  {plans.filter((p) => p.is_active).map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} · {plan.is_free ? "Gratis" : money(plan.amount)}</option>
                  ))}
                </Select>
                <div className="mt-2">
                  <Input value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} placeholder="Nota opcional de la asignación" />
                </div>
              </div>

              {studentState?.membership && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Plan actual</span><span className="font-semibold">{studentState.membership.membership_plans?.name}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Estado</span><Badge tone={studentState.membership.membership_plans?.is_free ? "success" : "neutral"}>{studentState.membership.membership_plans?.is_free ? "Sin costo" : "Activo"}</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-slate-500">Saldo</span><span className="font-semibold">{money(studentState.charges?.reduce((sum: number, c: any) => sum + Number(c.balance || 0), 0) ?? 0)}</span></div>
                </div>
              )}

              {selectedStudent && studentState?.membership?.id && (
                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Generar cuota</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input id="period-month" type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
                    <Input id="due-date" type="date" defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-10`} />
                  </div>
                  <Button className="mt-2 w-full" disabled={isPending} onClick={() => {
                    const month = (document.getElementById("period-month") as HTMLInputElement)?.value;
                    const dueDate = (document.getElementById("due-date") as HTMLInputElement)?.value;
                    if (month && dueDate) handleGenerateCharge(month, dueDate);
                  }}>
                    Generar cuota del período
                  </Button>
                  <p className="mt-2 text-xs text-slate-400">Para el plan Gratis se registra como bonificada y no crea deuda.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {isAdmin && (
          <Card>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Crear plan</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preparado para futuras cuotas. El club puede mantener planes gratuitos sin cobrar.</p>
            <form onSubmit={handleNewPlan} className="mt-4 space-y-3">
              <Input value={newPlan.name} onChange={(e) => setNewPlan((v) => ({ ...v, name: e.target.value }))} placeholder="Nombre del plan" required />
              <Input value={newPlan.code} onChange={(e) => setNewPlan((v) => ({ ...v, code: e.target.value }))} placeholder="Código (ej. MENSUAL-2027)" required />
              <Input value={newPlan.description} onChange={(e) => setNewPlan((v) => ({ ...v, description: e.target.value }))} placeholder="Descripción" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" min="0" step="0.01" value={newPlan.amount} onChange={(e) => setNewPlan((v) => ({ ...v, amount: e.target.value }))} placeholder="Monto" disabled={newPlan.isFree} />
                <Select value={newPlan.billingPeriod} onChange={(e) => setNewPlan((v) => ({ ...v, billingPeriod: e.target.value }))}>
                  <option value="monthly">Mensual</option>
                  <option value="one_time">Único</option>
                  <option value="other">Otro</option>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={newPlan.isFree} onChange={(e) => setNewPlan((v) => ({ ...v, isFree: e.target.checked, amount: e.target.checked ? "0" : v.amount }))} />
                Plan gratuito / comunitario
              </label>
              <ErrorText>{planError}</ErrorText>
              <Button type="submit" loading={isPending}>Crear plan</Button>
            </form>
          </Card>
        )}
      </section>

      <Card>
        <CollapsibleSection title="Planes disponibles" defaultOpen>
          <div className="space-y-2">
            {plans.length === 0 ? <EmptyState title="Todavía no hay planes" /> : plans.map((plan) => (
              <div key={plan.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2"><p className="font-semibold">{plan.name}</p><Badge tone={plan.is_free ? "success" : "neutral"}>{plan.is_free ? "Gratis" : money(plan.amount)}</Badge>{!plan.is_active && <Badge tone="neutral">Inactivo</Badge>}</div>
                  <p className="text-xs text-slate-500">{plan.code} · {plan.description ?? "Sin descripción"}</p>
                </div>
                {isAdmin && <Button variant="secondary" onClick={() => startTransition(async () => { await cambiarEstadoPlan(plan.id, !plan.is_active); router.refresh(); })}>{plan.is_active ? "Desactivar" : "Activar"}</Button>}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </Card>

      {selectedStudent && studentState && (
        <Card>
          <CollapsibleSection title={`Cuotas de ${selectedStudent.full_name}`} defaultOpen>
            {studentState.charges?.length === 0 ? (
              <EmptyState title="No hay cuotas registradas" description="Esto es completamente válido para el esquema actual del club." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-200 text-left dark:border-slate-700"><th className="px-2 py-2">Período</th><th className="px-2 py-2">Vencimiento</th><th className="px-2 py-2">Monto</th><th className="px-2 py-2">Saldo</th><th className="px-2 py-2">Estado</th><th /></tr></thead>
                  <tbody>
                    {studentState.charges.map((charge: any) => (
                      <ChargeRow key={charge.id} charge={charge} isPending={isPending} onDone={async () => { const fresh = await getEstadoAlumno(selectedStudent.id); if (!fresh.error) setStudentState(fresh); }} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>
        </Card>
      )}
    </div>
  );
}

function ChargeRow({ charge, isPending, onDone }: { charge: any; isPending: boolean; onDone: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(charge.balance));
  const [method, setMethod] = useState<"cash" | "transfer" | "card" | "mercadopago" | "other">("cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const statusTone = charge.status === "paid" || charge.status === "waived" ? "success" : charge.status === "overdue" ? "danger" : "warning";

  function pay() {
    setError(null);
    startTransition(async () => {
      const result = await registrarPago({ chargeId: charge.id, amount: Number(amount), method, reference, notes: "" });
      if (result.error) return setError(result.error);
      setOpen(false);
      await onDone();
    });
  }

  return <>
    <tr className="border-b border-slate-100 align-top last:border-b-0 dark:border-slate-800">
      <td className="px-2 py-3">{charge.period_month.slice(0, 7)}</td>
      <td className="px-2 py-3">{charge.due_date}</td>
      <td className="px-2 py-3">{money(Number(charge.amount))}</td>
      <td className="px-2 py-3 font-semibold">{money(Number(charge.balance))}</td>
      <td className="px-2 py-3"><Badge tone={statusTone}>{charge.status === "waived" ? "Bonificada" : charge.status}</Badge></td>
      <td className="px-2 py-3 text-right">{charge.balance > 0 && charge.status !== "waived" && <Button variant="secondary" disabled={isPending || pending} onClick={() => setOpen((v) => !v)}>{open ? "Cerrar" : "Registrar pago"}</Button>}</td>
    </tr>
    {open && <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40"><td colSpan={6} className="px-2 py-3"><div className="grid gap-2 sm:grid-cols-4"><Input type="number" min="0.01" step="0.01" max={charge.balance} value={amount} onChange={(e) => setAmount(e.target.value)} /><Select value={method} onChange={(e) => setMethod(e.target.value as any)}><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="mercadopago">Mercado Pago</option><option value="card">Tarjeta</option><option value="other">Otro</option></Select><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Referencia opcional" /><Button loading={pending} onClick={pay}>Confirmar pago</Button></div><ErrorText>{error}</ErrorText></td></tr>}
  </>;
}
