import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const API_URL = "https://law-office.al-mosa.com/api";

function Expenses() {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    amount: "",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [hoveredExpenseAmount, setHoveredExpenseAmount] = useState(null);

  useEffect(() => {
    fetchExpensesData();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [searchKeyword, expensesList]);

  useEffect(() => {
    setTotalExpenses(calculateTotalExpenses());
  }, [expensesList]);

  const calculateTotalExpenses = () => {
    return expensesList.reduce(
      (total, expense) => total + parseFloat(expense.amount),
      0
    );
  };

  const fetchExpensesData = async () => {
    Swal.fire({
      title: "جاري التحميل...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      rtl: true,
    });
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لم يتم العثور على التوكن. يرجى تسجيل الدخول.");
      }

      const response = await axios.get(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const expensesData = response.data;
      setExpensesList(expensesData);
      setFilteredExpenses(expensesData);
      const chartData = prepareChartData(expensesData);
      setChartData(chartData);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      handleApiError(err, "فشل في جلب المصروفات.");
    } finally {
      Swal.close();
    }
  };

  const prepareChartData = (expenses) => {
    const expensesMap = new Map();
    if (Array.isArray(expenses)) {
      expenses.forEach((expense) => {
        const amount = parseFloat(expense.amount);
        expensesMap.set(
          expense.name,
          (expensesMap.get(expense.name) || 0) + amount
        );
      });
    }

    const labels = Array.from(expensesMap.keys());
    const dataValues = Array.from(expensesMap.values());
    const backgroundColors = labels.map(() => generateRandomColor());

    return {
      labels: labels,
      datasets: [
        {
          label: "توزيع المصروفات",
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
          hoverOffset: 10,
        },
      ],
    };
  };

  const filterExpenses = () => {
    if (!searchKeyword) {
      setFilteredExpenses(expensesList);
      return;
    }
    const filtered = expensesList.filter((expense) =>
      expense.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };

  const handleDeleteExpense = async (expenseId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
      rtl: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/expense/${expenseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف المصروف بنجاح.",
            icon: "success",
            confirmButtonText: "حسناً",
            rtl: true,
          });
          fetchExpensesData();
        } catch (err) {
          console.error("Error deleting expense:", err);
          handleApiError(err, "فشل في حذف المصروف.");
        }
      }
    });
  };

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setEditFormData({
      name: expense.name,
      amount: expense.amount,
    });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "جاري التحديث...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      rtl: true,
    });
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/update-expense/${editingExpenseId}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.close();
      Swal.fire({
        title: "تم التعديل!",
        text: "تم تعديل المصروف بنجاح.",
        icon: "success",
        confirmButtonText: "حسناً",
        rtl: true,
      });
      setEditingExpenseId(null);
      fetchExpensesData();
    } catch (err) {
      console.error("Error updating expense:", err);
      handleApiError(err, "فشل في تعديل المصروف.");
    }
  };

  const handleApiError = (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "غير مصرح. يرجى تسجيل الدخول مرة أخرى.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    setError(errorMessage);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: errorMessage,
      rtl: true,
    });
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          font: {
            size: 18,
          },
        },
      },
      title: {
        display: true,
        text: "توزيع المصروفات",
        font: {
          size: 26,
        },
        align: "center",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const label = chartData.labels[index];
              return label;
            }
            return "";
          },
          label: (tooltipItem) => {
            const value = tooltipItem.formattedValue;
            return `المبلغ: ${value} ج.م`;
          },
          labelColor: (tooltipItem) => {
            return {
              backgroundColor:
                tooltipItem.dataset.backgroundColor[tooltipItem.dataIndex],
              borderColor:
                tooltipItem.dataset.borderColor[tooltipItem.dataIndex],
            };
          },
          labelTextColor: () => "#fff",
        },
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 16,
        },
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.85)",
        borderColor: "rgba(255,255,255,0.5)",
        borderWidth: 1,
      },
    },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        const index = chartElement[0].index;
        const amount = chartData.datasets[0].data[index];
        setHoveredExpenseAmount(amount);
      } else {
        setHoveredExpenseAmount(null);
      }
    },
  };

  return (
    <div className="container mt-4" style={{ backgroundColor: "#f0f0f0" }}>
      <h2
        className="text-center mb-4 py-2 py-md-4 fs-2 fw-bold"
        style={{ color: "#1a237e" }}
      >
        تقارير المصروفات
      </h2>
      <div className="row" dir="rtl">
        <div className="col-md-8 mb-4">
          <div className="d-flex flex-column align-items-center">
            <div style={{ height: "400px", width: "100%" }}>
              {chartData && <Pie data={chartData} options={chartOptions} />}
            </div>
            <p className="lead mt-3 text-center" style={{ color: "#000" }}>
              {hoveredExpenseAmount !== null ? (
                <>
                  قيمة المصروف:{" "}
                  <span className="fw-bold">
                    {hoveredExpenseAmount.toFixed(2)} ج.م
                  </span>
                </>
              ) : (
                <>
                  إجمالي المصروفات:{" "}
                  <span className="fw-bold">
                    {totalExpenses.toFixed(2)} ج.م
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <input
              type="text"
              className="form-control custom-input text-end"
              placeholder="ابحث عن المصروفات..."
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{
                borderWidth: "2px",
                borderColor: "#64b5f6",
                boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                fontSize: "1rem",
                padding: "10px",
                transition: "border-color 0.3s ease",
              }}
            />
          </div>
          <div
            className="mb-3"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {filteredExpenses && filteredExpenses.length > 0 ? (
              <div className="d-flex flex-wrap flex-column-reverse">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="card m-2"
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                    }}
                    dir="rtl"
                  >
                    <div className="card-body text-end">
                      {editingExpenseId === expense.id ? (
                        <ExpenseEditForm
                          expense={expense}
                          editFormData={editFormData}
                          handleEditFormChange={handleEditFormChange}
                          handleUpdateExpense={handleUpdateExpense}
                          handleCancelEdit={handleCancelEdit}
                        />
                      ) : (
                        <ExpenseItem
                          expense={expense}
                          handleEditExpense={handleEditExpense}
                          handleDeleteExpense={handleDeleteExpense}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>لا توجد مصروفات للعرض.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          .custom-input {
            border: 2px solid #64b5f6;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
             padding: 10px;
                transition: border-color 0.3s ease;
                 font-size: 1rem;
                  background-color: white;
                    color: #444;
                     border-radius: 0.375rem;
          }
          .custom-input:focus {
            border-color: #86b7fe;
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
          }
           .custom-edit-button {
            border-radius: 0.375rem;
            padding: 0.25rem 0.5rem; /* تقليل الحجم  */
            font-size: 0.875rem; /* تقليل حجم الخط */
           }
           .custom-edit-button:focus {
            outline: 0;
            box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
           }
        `}
      </style>
    </div>
  );
}

const ExpenseItem = ({ expense, handleEditExpense, handleDeleteExpense }) => (
  <>
    <h5 className="card-title" style={{ color: "#000" }}>
      {expense.name}
    </h5>
    <p className="card-text" style={{ color: "#000" }}>
      المبلغ: {expense.amount} ج.م
    </p>
    <div className="d-flex justify-content-end">
      <button
        className="btn btn-primary btn-sm me-1 custom-edit-button"
        onClick={() => handleEditExpense(expense)}
        style={{ backgroundColor: "#0d6efd", color: "#fff" }}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
      <button
        className="btn btn-danger btn-sm custom-edit-button"
        onClick={() => handleDeleteExpense(expense.id)}
        style={{ backgroundColor: "#dc3545", color: "#fff" }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
  </>
);

const ExpenseEditForm = ({
  expense,
  editFormData,
  handleEditFormChange,
  handleUpdateExpense,
  handleCancelEdit,
}) => (
  <>
    <input
      type="text"
      name="name"
      value={editFormData.name}
      className="form-control custom-input text-end mb-2"
      onChange={handleEditFormChange}
      placeholder="اسم المصروف"
    />
    <input
      type="number"
      name="amount"
      value={editFormData.amount}
      className="form-control custom-input text-end mb-2"
      onChange={handleEditFormChange}
      placeholder="المبلغ"
    />
    <div className="d-flex justify-content-end">
      <button
        type="submit"
        onClick={handleUpdateExpense}
        className="btn btn-success btn-sm me-1 custom-edit-button"
        style={{ backgroundColor: "#28a745", color: "#fff" }}
      >
        <FontAwesomeIcon icon={faSave} />
      </button>
      <button
        type="button"
        onClick={handleCancelEdit}
        className="btn btn-secondary btn-sm custom-edit-button"
        style={{ backgroundColor: "#6c757d", color: "#fff" }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </>
);

export default Expenses;
