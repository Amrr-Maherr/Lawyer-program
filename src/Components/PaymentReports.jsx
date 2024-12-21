import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const API_URL = "https://law-office.al-mosa.com/api";

const PaymentReports = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentsList, setPaymentsList] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [totalPayments, setTotalPayments] = useState(0);
  const [hoveredPaymentAmount, setHoveredPaymentAmount] = useState(null);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchKeyword, paymentsList]);

  useEffect(() => {
    setTotalPayments(calculateTotalPayments());
  }, [paymentsList]);

  const fetchPaymentsData = async () => {
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
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("لم يتم العثور على التوكن. يرجى تسجيل الدخول.");
      }

      const response = await axios.get(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const paymentsData = response.data.payments;
      setPaymentsList(paymentsData);
      setFilteredPayments(paymentsData);

      const chartData = prepareChartData(paymentsData);
      setChartData(chartData);
    } catch (err) {
      console.error("Error fetching payments data:", err);
      handleApiError(err, "فشل في جلب المدفوعات.");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  const prepareChartData = (payments) => {
    const paymentsMap = new Map();
    if (Array.isArray(payments)) {
      payments.forEach((payment) => {
        const amount = parseFloat(payment.amount);
        paymentsMap.set(
          payment.title,
          (paymentsMap.get(payment.title) || 0) + amount
        );
      });
    }

    const labels = Array.from(paymentsMap.keys());
    const dataValues = Array.from(paymentsMap.values());
    const backgroundColors = labels.map(() => generateRandomColor());

    return {
      labels: labels,
      datasets: [
        {
          label: "توزيع المدفوعات",
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

  const filterPayments = () => {
    if (!searchKeyword) {
      setFilteredPayments(paymentsList);
      return;
    }
    const filtered = paymentsList.filter((payment) =>
      payment.title.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredPayments(filtered);
  };

  const calculateTotalPayments = () => {
    return paymentsList.reduce(
      (total, payment) => total + parseFloat(payment.amount),
      0
    );
  };

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
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
        text: "توزيع المدفوعات",
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
        setHoveredPaymentAmount(amount);
      } else {
        setHoveredPaymentAmount(null);
      }
    },
  };

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ backgroundColor: "#f0f0f0" }}>
      <h2
        className="text-center mb-4 py-2 py-md-4 fs-2 fw-bold"
        style={{ color: "#1a237e" }}
      >
        تقارير المدفوعات
      </h2>
      <div className="row" dir="rtl">
        <div className="col-md-8 mb-4">
          <div className="d-flex flex-column align-items-center">
            <div style={{ height: "400px", width: "100%" }}>
              {chartData && <Pie data={chartData} options={chartOptions} />}
            </div>
            <p className="lead mt-3 text-center" style={{ color: "#000" }}>
              {hoveredPaymentAmount !== null ? (
                <>
                  قيمة الدفعة:{" "}
                  <span className="fw-bold">
                    {hoveredPaymentAmount.toFixed(2)} ج.م
                  </span>
                </>
              ) : (
                <>
                  إجمالي المدفوعات:{" "}
                  <span className="fw-bold">
                    {totalPayments.toFixed(2)} ج.م
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
              placeholder="ابحث عن المدفوعات..."
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
            {filteredPayments && filteredPayments.length > 0 ? (
              <div className="d-flex flex-wrap flex-column-reverse">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="card m-2"
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
                    }}
                    dir="rtl"
                  >
                    <div className="card-body text-end">
                      <h5 className="card-title" style={{ color: "#000" }}>
                        {payment.title}
                      </h5>
                      <p className="card-text" style={{ color: "#000" }}>
                        المبلغ: {payment.amount} ج.م
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>لا توجد مدفوعات للعرض.</p>
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
                `}
      </style>
    </div>
  );
};

export default PaymentReports;
