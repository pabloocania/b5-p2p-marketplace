import React from "react";

interface StablecoinBalanceProps {
  name: string;
  balance: string;
}

const StablecoinBalance: React.FC<StablecoinBalanceProps> = ({
  name,
  balance,
}) => {
  return (
    <div>
      <p>
        {name} Balance: {balance}
      </p>
    </div>
  );
};

export default StablecoinBalance;
