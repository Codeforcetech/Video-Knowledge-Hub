import { errorAlertBox } from "@/lib/ui";

type Props = {
  message: string;
  /** 複数行のサーバーエラー用 */
  className?: string;
};

export function ErrorAlert({ message, className = "" }: Props) {
  if (!message.trim()) return null;
  return (
    <div className={`${errorAlertBox} ${className}`} role="alert">
      {message}
    </div>
  );
}
