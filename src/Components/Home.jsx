import React, { useEffect, useState, Suspense, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WelcomeMessage from "./WelcomeMessage";
import HotLink from "./HotLink";
import "react-calendar/dist/Calendar.css";
import HotLinksTitle from "./HotLinksTitle";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import Calendar from "./Calendar";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [sessionsCount, setSessionsCount] = useState(null);
  const [clientsCount, setClientsCount] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(null);
  const [paidAmount, setPaidAmount] = useState(null);
  const [contractsCount, setContractsCount] = useState(null);
  const [cases, setCases] = useState(null);
  const [expensesAmount, setExpensesAmount] = useState(null);
  const [revenueAmount, setRevenueAmount] = useState(null);
  const [displaySessionsCount, setDisplaySessionsCount] = useState(0);
  const [displayClientsCount, setDisplayClientsCount] = useState(0);
  const [displayRemainingAmount, setDisplayRemainingAmount] = useState(0);
  const [displayPaidAmount, setDisplayPaidAmount] = useState(0);
  const [displayContractsCount, setDisplayContractsCount] = useState(0);
  const [displayCases, setDisplayCases] = useState(0);
  const [displayExpensesAmount, setDisplayExpensesAmount] = useState(0);
  const [displayRevenueAmount, setDisplayRevenueAmount] = useState(0);
  const animationFrameRef = useRef(null);

  const sessionsChartRef = useRef(null);
  const casesChartRef = useRef(null);
  const clientsChartRef = useRef(null);
  const remainingAmountChartRef = useRef(null);
  const paidAmountChartRef = useRef(null);
  const contractsChartRef = useRef(null);
  const expensesChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  const sessionsChartInstance = useRef(null);
  const casesChartInstance = useRef(null);
  const clientsChartInstance = useRef(null);
  const remainingAmountChartInstance = useRef(null);
  const paidAmountChartInstance = useRef(null);
  const contractsChartInstance = useRef(null);
  const expensesChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/SignUp");
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      axios
        .get("https://law-office.al-mosa.com/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log("Data received from the server:", response.data);
          const data = response.data;
          setSessionsCount(data.sessions);
          setClientsCount(data.customers);
          setRemainingAmount(data.remaining);
          setPaidAmount(data.payments);
          setContractsCount(data.contracts);
          setCases(data.cases);
          setExpensesAmount(data.expenses);
          setRevenueAmount(data.revenue);

          startAnimation(
            data.sessions || 0,
            data.customers || 0,
            data.remaining || 0,
            data.payments || 0,
            data.contracts || 0,
            data.cases || 0,
            data.expenses || 0,
            data.revenue || 0
          );
        })
        .catch((error) => {
          console.error("Error fetching home data:", error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            navigate("/SignUp");
          }
        });
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [token, navigate]);

  const startAnimation = (
    targetSessionsCount,
    targetClientsCount,
    targetRemainingAmount,
    targetPaidAmount,
    targetContractsCount,
    targetCases,
    targetExpensesAmount,
    targetRevenueAmount
  ) => {
    let startTime = null;
    const duration = 600;

    const animate = (currentTime) => {
      if (!startTime) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);

      setDisplaySessionsCount(Math.round(targetSessionsCount * progress));
      setDisplayClientsCount(Math.round(targetClientsCount * progress));
      setDisplayRemainingAmount(Math.round(targetRemainingAmount * progress));
      setDisplayPaidAmount(Math.round(targetPaidAmount * progress));
      setDisplayContractsCount(Math.round(targetContractsCount * progress));
      setDisplayCases(Math.round(targetCases * progress));
      setDisplayExpensesAmount(Math.round(targetExpensesAmount * progress));
      setDisplayRevenueAmount(Math.round(targetRevenueAmount * progress));
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const displayData = (data) => {
    return data !== null && data !== undefined ? data : "غير متوفر";
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6c757d",
        },
      },
      x: {
        ticks: {
          color: "#6c757d",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: "white",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#546e7a",
        borderWidth: 1,
        position: "nearest", // تحديد موقع التلميح بالقرب من الماوس
        padding: 10, // زيادة حجم الـ padding
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuad",
    },
  };

  const createChart = (
    chartRef,
    chartInstanceRef,
    data,
    label,
    backgroundColor
  ) => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: [label],
          datasets: [
            {
              label: `عدد ${label}`,
              data: [data],
              backgroundColor: [backgroundColor],
              hoverBackgroundColor: [backgroundColor],
            },
          ],
        },
        options: {
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: `${label} ${displayData(data)}`,
              color: "#343a40",
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  };

  useEffect(() => {
    return createChart(
      sessionsChartRef,
      sessionsChartInstance,
      displaySessionsCount,
      "الجلسات",
      "#34495e"
    );
  }, [displaySessionsCount]);

  useEffect(() => {
    return createChart(
      casesChartRef,
      casesChartInstance,
      displayCases,
      "القضايا",
      "#546e7a"
    );
  }, [displayCases]);

  useEffect(() => {
    return createChart(
      clientsChartRef,
      clientsChartInstance,
      displayClientsCount,
      "العملاء",
      "#607d8b"
    );
  }, [displayClientsCount]);

  useEffect(() => {
    return createChart(
      remainingAmountChartRef,
      remainingAmountChartInstance,
      displayRemainingAmount,
      "المتبقي",
      "#78909c"
    );
  }, [displayRemainingAmount]);

  useEffect(() => {
    return createChart(
      paidAmountChartRef,
      paidAmountChartInstance,
      displayPaidAmount,
      "المدفوع",
      "#90a4ae"
    );
  }, [displayPaidAmount]);

  useEffect(() => {
    return createChart(
      contractsChartRef,
      contractsChartInstance,
      displayContractsCount,
      "العقود",
      "#b0bec5"
    );
  }, [displayContractsCount]);

  useEffect(() => {
    return createChart(
      expensesChartRef,
      expensesChartInstance,
      displayExpensesAmount,
      "المصروفات",
      "#cfd8dc"
    );
  }, [displayExpensesAmount]);

  useEffect(() => {
    return createChart(
      revenueChartRef,
      revenueChartInstance,
      displayRevenueAmount,
      "المبالغ المتبقية",
      "#eceff1"
    );
  }, [displayRevenueAmount]);

  return (
    <div
      className="container-fluid home p-4"
    >
      <div className="row">
        <div className="col-12 mb-4">
          <WelcomeMessage message="أهلاً ومرحباً بك في برنامج المحامي" />
        </div>
        <div className="col-lg-4 col-12 col-md-5 d-flex align-items-center justify-content-center mb-3">
          <div
            className="card shadow-lg p-3 w-100"
            style={{ border: "1px solid #dee2e6" }}
          >
            <Suspense fallback={<div>جاري تحميل التقويم...</div>}>
              <Calendar />
            </Suspense>
          </div>
        </div>
        <div className="col-lg-8 col-12 col-md-7">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div className="col-lg-4">
              <Link to="/sessions" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={sessionsChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col-xl-4 col-12">
              <Link to="/cases" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={casesChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col-xl-4 col-12">
              <Link to="/customers" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={clientsChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col-xl-4 col-12">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={remainingAmountChartRef}></canvas>
              </div>
            </div>
            <div className="col-xl-4 col-12">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={paidAmountChartRef}></canvas>
              </div>
            </div>
            <div className="col-xl-4 col-12">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={contractsChartRef}></canvas>
              </div>
            </div>
            <div className="col-xl-6 col-12">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
            <div className="col-xl-6 col-12">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={expensesChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid mt-4">
        <div className="row row-cols-1 row-cols-md-2 g-4">
          <div className="col-lg-12 text-end">
            <HotLinksTitle title="روابط سريعة" style={{ color: "#343a40" }} />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="الجلسات"
              icon="fa-solid fa-calendar-day"
              link="/sessions"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#343a40",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="قضية جديدة"
              icon="fa-solid fa-plus-circle"
              link="/add-case"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#343a40",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="المصروفات"
              icon="fa-solid fa-credit-card"
              link="/expenses"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#343a40",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col-lg-3 col-6">
            <HotLink
              title="الإعدادات"
              icon="fa-solid fa-cogs"
              link="/system-settings"
              style={{
                backgroundColor: "#f0f0f0",
                color: "#343a40",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
