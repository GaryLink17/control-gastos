import Auth from "./components/Auth";
import InstallPrompt from "./components/InstallPrompt";
import AppHeader from "./components/AppHeader";
import NavMenu from "./components/NavMenu";
import SummaryCards from "./components/SummaryCards";
import TransactionForm from "./components/TransactionForm";
import HistoryView from "./components/HistoryView";
import CategoriesView from "./components/CategoriesView";
import TodosView from "./components/TodosView";
import TransactionModal from "./components/TransactionModal";
import { useAuth } from "./context/AuthContext";
import { useAppState } from "./hooks/useAppState";
import { useTransactions } from "./hooks/useTransactions";
import { useCategories } from "./hooks/useCategories";
import { useTodos } from "./hooks/useTodos";

function App() {
  const { user, showResetPasswordForm, setShowResetPasswordForm, handleLogout: authLogout } = useAuth();
  const { currentView, setCurrentView, selectedTransaction, setSelectedTransaction, closingTransaction, closeTransactionModal, darkMode, setDarkMode } = useAppState();
  const {
    customCategories, setCustomCategories,
    addCategory,
    deleteCategory,
    getCategoryIconByName,
    closeIconsModal,
    newCategoryName, setNewCategoryName,
    newCategoryType, setNewCategoryType,
    newCategoryIcon, setNewCategoryIcon,
    showIcons, setShowIcons,
    categoryMessage,
    closingIcons,
    loading: categoriesLoading,
    createDefaultCategories,
  } = useCategories({ userId: user?.id });
  const {
    setTransactions,
    hasIncome,
    saveError,
    type, setType,
    description, setDescription,
    amount, setAmount,
    category, setCategory,
    errors,
    filterDate, setFilterDate,
    filterMonth, setFilterMonth,
    lastTransaction,
    categories,
    cycleExpenses, totalSavings, balance,
    filteredTransactions,
    loading: transactionsLoading,
    getCategoryIcon,
    handleSubmit,
    clearFieldError,
    formatDate, formatAmount,
  } = useTransactions({ userId: user?.id, customCategories });
  const {
    todos,
    loading: todosLoading,
    newTodoTitle, setNewTodoTitle,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos({ userId: user?.id });

  const handleLogout = async () => {
    await authLogout();
    setTransactions([]);
    setCustomCategories({ income: [], expense: [] });
  };

  return (
    <>
      {user === undefined ? null : !user || showResetPasswordForm ? (
        <Auth showResetPasswordForm={showResetPasswordForm} setShowResetPasswordForm={setShowResetPasswordForm} createDefaultCategories={createDefaultCategories} />
      ) : (
        <div className="app">
      <AppHeader darkMode={darkMode} setDarkMode={setDarkMode} userEmail={user.email} handleLogout={handleLogout} />

      <NavMenu currentView={currentView} setCurrentView={setCurrentView} />

      <SummaryCards balance={balance} totalSavings={totalSavings} cycleExpenses={cycleExpenses} formatAmount={formatAmount} loading={transactionsLoading} hasIncome={hasIncome} />

      <main className="main">
        {currentView === "register" && (
          <TransactionForm
            type={type} setType={setType}
            description={description} setDescription={setDescription}
            amount={amount} setAmount={setAmount}
            category={category} setCategory={setCategory}
            errors={errors} clearFieldError={clearFieldError}
            saveError={saveError}
            categories={categories}
            handleSubmit={handleSubmit}
            lastTransaction={lastTransaction}
            getCategoryIcon={getCategoryIcon}
            formatDate={formatDate} formatAmount={formatAmount}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === "history" && (
          <HistoryView
            filterDate={filterDate} setFilterDate={setFilterDate}
            filterMonth={filterMonth} setFilterMonth={setFilterMonth}
            filteredTransactions={filteredTransactions}
            getCategoryIcon={getCategoryIcon}
            formatDate={formatDate} formatAmount={formatAmount}
            setSelectedTransaction={setSelectedTransaction}
            loading={transactionsLoading}
          />
        )}

        {currentView === "categories" && (
          <CategoriesView
            newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName}
            newCategoryType={newCategoryType} setNewCategoryType={setNewCategoryType}
            newCategoryIcon={newCategoryIcon} setNewCategoryIcon={setNewCategoryIcon}
            showIcons={showIcons} setShowIcons={setShowIcons}
            closingIcons={closingIcons}
            categoryMessage={categoryMessage}
            customCategories={customCategories}
            addCategory={addCategory}
            deleteCategory={deleteCategory}
            closeIconsModal={closeIconsModal}
            loading={categoriesLoading}
          />
        )}
        {currentView === "todos" && (
          <TodosView
            todos={todos}
            newTodoTitle={newTodoTitle} setNewTodoTitle={setNewTodoTitle}
            addTodo={addTodo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            getCategoryIconByName={getCategoryIconByName}
            formatDate={formatDate}
            loading={todosLoading}
          />
        )}
      </main>

      <TransactionModal
        selectedTransaction={selectedTransaction}
        closingTransaction={closingTransaction}
        closeTransactionModal={closeTransactionModal}
        getCategoryIcon={getCategoryIcon}
        formatDate={formatDate}
        formatAmount={formatAmount}
      />
        </div>
      )}
      <InstallPrompt />
    </>
  );
}

export default App;
