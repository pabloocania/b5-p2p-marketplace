"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

import { Order } from "b5-api-client";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
// import { DisputeOrderRequest } from "b5-api-client"; // o el path correcto
interface DisputeOrderRequest {
  orderId: string;
  reason: string;
}

interface DisputeOrderButtonProps {
  order: Order;
}

export default function DisputeOrderButton({ order }: DisputeOrderButtonProps) {
  const [open, setOpen] = useState(false);

  const onConfirmDispute = async () => {
    console.log(`🚨 Iniciando disputa para orden ${order.id}...`);
    try {
      const request: DisputeOrderRequest = {
        orderId: order.id ?? "",
        reason: "USER_DISPUTE", // o el motivo adecuado si hay múltiples
      };

      //   const headers = {
      //     Authorization: `Bearer ${loginId}`, // suponiendo que usás un token
      //   };
      //   const response = await client.disputeOrder(request, headers);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulación de respuesta de éxito
      const response = {
        message: "Disputa iniciada (mock)",
        disputedOrderId: request.orderId,
      };
      console.log("✅ Disputa iniciada con éxito:", response);

      // Podés cerrar el modal, mostrar una notificación, refrescar el estado, etc.
    } catch (err) {
      console.error("❌ Error al iniciar la disputa:", err);
      alert("No se pudo iniciar la disputa. Intentalo más tarde.");
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="px-3 py-1 text-xs h-auto flex items-center"
        onClick={() => setOpen(true)}
      >
        <AlertCircle className="mr-1 w-4 h-4" />
        Disputar orden
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
          </DialogHeader>

          <div className="bg-muted p-3 rounded-md mt-2 text-sm">
            <p>
              <strong>ID:</strong> {order.id}
            </p>
            <p>
              <strong>Estado:</strong> {order.status}
            </p>
            <p>
              <strong>Monto:</strong> {order.amount} {order.tokenCode}
            </p>
          </div>

          <p className="mt-4">
            Esta acción pondrá la orden en disputa. No podrá deshacerse y el
            equipo de soporte intervendrá para revisar el caso.
          </p>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={() => onConfirmDispute()}>
              Sí, disputar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
