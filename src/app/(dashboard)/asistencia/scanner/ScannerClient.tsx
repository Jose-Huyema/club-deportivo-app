"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { registrarIngreso } from "./actions";

type Feedback = { type: "success" | "error"; message: string };

export function ScannerClient() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [procesando, setProcesando] = useState(false);
  const ultimoCodigoRef = useRef<{ texto: string; hora: number } | null>(null);

  useEffect(() => {
    let scanner: any;
    let cancelado = false;

    // Import dinámico: esta librería usa APIs del navegador (cámara) y no
    // puede cargarse en el servidor.
    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (cancelado || !contenedorRef.current) return;

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        async (textoDecodificado: string) => {
          const ahora = Date.now();
          // Evita procesar el mismo QR 10 veces por segundo mientras sigue en cámara
          if (
            ultimoCodigoRef.current &&
            ultimoCodigoRef.current.texto === textoDecodificado &&
            ahora - ultimoCodigoRef.current.hora < 4000
          ) {
            return;
          }
          ultimoCodigoRef.current = { texto: textoDecodificado, hora: ahora };

          setProcesando(true);
          const result = await registrarIngreso(textoDecodificado);
          setProcesando(false);

          if (result.error) {
            setFeedback({ type: "error", message: result.error });
          } else {
            setFeedback({ type: "success", message: `Ingreso registrado: ${result.studentName}` });
          }
        },
        () => {
          // Errores de "no se detectó QR en este frame" — ignorar, son constantes.
        }
      );
    });

    return () => {
      cancelado = true;
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div>
      <Card>
        <div id="qr-reader" ref={contenedorRef} className="mx-auto max-w-sm" />
        <p className="mt-2 text-center text-xs text-slate-400">
          Si el navegador pide permiso de cámara, aceptalo para poder escanear.
        </p>
      </Card>

      {feedback && (
        <p
          className={`mt-3 text-center text-sm font-medium ${
            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
          }`}
          role="status"
        >
          {procesando ? "Procesando…" : feedback.message}
        </p>
      )}
    </div>
  );
}
