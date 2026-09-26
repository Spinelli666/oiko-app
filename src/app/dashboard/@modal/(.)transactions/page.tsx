import { Modal } from "@/components/modal";
import { TransactionsContent } from "@/app/dashboard/transactions/transactions-content";

export default function TransactionsModal() {
  return (
    <Modal>
      <TransactionsContent showTransactionsList={false} title="Lançar Transação" />
    </Modal>
  );
}
