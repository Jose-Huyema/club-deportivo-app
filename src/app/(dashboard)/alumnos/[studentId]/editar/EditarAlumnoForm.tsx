"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui";
import { Label, Input, Select, Textarea, ErrorText } from "@/components/ui";
import { CollapsibleSection } from "@/components/ui";
import { StickyFormBar, FormBottomSpacer } from "@/components/ui";
import type { AlumnoDetalle } from "@/lib/data/alumnos";
import { actualizarAlumno } from "./actions";

const TALLES = ["XS", "S", "M", "L", "XL", "XXL"];

export function EditarAlumnoForm({ alumno }: { alumno: AlumnoDetalle }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(alumno.full_name);
  const [emergencyPhone, setEmergencyPhone] = useState(alumno.emergency_phone);
  const [phone, setPhone] = useState(alumno.phone ?? "");
  const [birthDate, setBirthDate] = useState(alumno.birth_date ?? "");
  const [tutorName, setTutorName] = useState(alumno.tutor_name ?? "");
  const [medicalNotes, setMedicalNotes] = useState(alumno.medical_notes ?? "");
  const [dni, setDni] = useState(alumno.dni ?? "");
  const [address, setAddress] = useState(alumno.address ?? "");
  const [heightCm, setHeightCm] = useState(alumno.height_cm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(alumno.weight_kg?.toString() ?? "");
  const [clothingSize, setClothingSize] = useState(alumno.clothing_size ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await actualizarAlumno(alumno.id, {
        fullName, emergencyPhone, phone, birthDate, tutorName, medicalNotes,
        dni, address, heightCm, weightKg, clothingSize,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.push(`/alumnos/${alumno.id}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Datos personales</p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Teléfono personal</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                <Input id="emergencyPhone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="tutorName">Tutor/a</Label>
              <Input id="tutorName" value={tutorName} onChange={(e) => setTutorName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="medicalNotes">Notas médicas</Label>
              <Textarea id="medicalNotes" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} />
            </div>
          </div>
        </div>

        <CollapsibleSection title="Medidas" defaultOpen>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="heightCm">Altura (cm)</Label>
              <Input id="heightCm" type="number" min={0} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weightKg">Peso (kg)</Label>
              <Input id="weightKg" type="number" min={0} step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="clothingSize">Talle</Label>
              <Select id="clothingSize" value={clothingSize} onChange={(e) => setClothingSize(e.target.value)}>
                <option value="">—</option>
                {TALLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        <FormBottomSpacer />
        <StickyFormBar>
          <ErrorText>{error}</ErrorText>
          {success && <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">Guardado.</p>}
          <Button type="submit" className="w-full" loading={isPending}>
            Guardar cambios
          </Button>
        </StickyFormBar>
      </form>
    </Card>
  );
}
