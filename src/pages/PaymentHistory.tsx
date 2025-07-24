import PaymentHistoryList from "../components/PaymentHistoryList";

const PaymentHistory = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>
      <PaymentHistoryList />
    </div>
  );
};

export default PaymentHistory; 