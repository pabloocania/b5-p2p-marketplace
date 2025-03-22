interface OrderCardProps {
  order: {
    amount: string;
    tokenCode: string;
    fiatAmount: string;
    fiatCode: string;
  };
}

export const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <div>
      <div>
        vende {order.amount} {order.tokenCode}a cambio de{" "}
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: order.fiatCode,
        }).format(parseFloat(order.fiatAmount))}
      </div>
    </div>
  );
};
