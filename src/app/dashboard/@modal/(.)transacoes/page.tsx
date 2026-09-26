import { Modal } from "@/components/modal";
import { TransactionsContent } from "@/app/dashboard/transacoes/transactions-content";

export default function TransacoesModal() {
  return (
    <Modal>
      <TransactionsContent showTransactionsList={false} />
    </Modal>
  );
}
