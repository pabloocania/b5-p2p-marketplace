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
import { useUserContext } from "@/components/kioscoin/users/UserContext";
import { CreateDisputeRequest } from "b5-api-client";

interface DisputeOrderRequest {
  orderId: string;
  reason: string;
}

interface DisputeOrderButtonProps {
  order: Order;
}

export default function DisputeOrderButton({ order }: DisputeOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginId, user } = useUserContext();

  const onConfirmDispute = async () => {
    setLoading(true);
    try {
      const request: CreateDisputeRequest = {
        orderId: order.id ?? "",
        reason: "SELLER_NOT_LOCKING",
        creatorId: user?.id ?? "",
      };

      const headers = {
        Authorization: `Bearer ${loginId}`,
      };

      const response = await client.createDispute(request, headers);

      console.log("✅ Disputa iniciada con éxito:", response);
      setOpen(false);
    } catch (err) {
      console.error("❌ Error al iniciar la disputa:", err);
      alert("No se pudo iniciar la disputa. Intentalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span
        className="flex items-center gap-1 text-red-600 cursor-pointer select-none"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        title="Disputar orden"
        style={{ lineHeight: "2" }}
      >
        <AlertCircle className="w-4 h-4" />
        Disputar orden
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDispute}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Sí, disputar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
