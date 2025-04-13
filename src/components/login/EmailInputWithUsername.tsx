import { EmailInputWithUsernameProps } from "./types";
import { FormInput } from "./FormInput";

export const EmailInputWithUsername = ({
  email,
  onEmailChange,
  onUsernameChange,
  disabled = false,
}: EmailInputWithUsernameProps) => {
  const handleEmailChange = (newEmail: string) => {
    onEmailChange(newEmail);
    const username = newEmail.split("@")[0];
    if (username) {
      onUsernameChange(username);
    }
  };

  return (
    <FormInput
      type="email"
      placeholder="Email"
      value={email}
      onChange={handleEmailChange}
      required
      disabled={disabled}
    />
  );
};
