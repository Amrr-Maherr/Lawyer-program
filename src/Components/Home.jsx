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
  const animationFrameRef = useRef(null);

  const sessionsChartRef = useRef(null);
  const casesChartRef = useRef(null);
  const clientsChartRef = useRef(null);
  const remainingAmountChartRef = useRef(null);
  const paidAmountChartRef = useRef(null);
  const contractsChartRef = useRef(null);
  const expensesChartRef = useRef(null);

  const sessionsChartInstance = useRef(null);
  const casesChartInstance = useRef(null);
  const clientsChartInstance = useRef(null);
  const remainingAmountChartInstance = useRef(null);
  const paidAmountChartInstance = useRef(null);
  const contractsChartInstance = useRef(null);
  const expensesChartInstance = useRef(null);

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
            data.expenses || 0
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
    targetExpensesAmount
  ) => {
    let startTime = null;
    const duration = 800; // Increased duration for smoother animation

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
          color: "#546e7a", // رمادي داكن للأرقام
          font: {
            size: 14,
          },
        },
      },
      x: {
        ticks: {
          color: "#546e7a", // رمادي داكن للأرقام
          font: {
            size: 14,
          },
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
        position: "nearest",
        padding: 10,
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 16,
        },
        callbacks: {
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
          label: (tooltipItem) => {
            return `${displayData(tooltipItem.formattedValue)}`;
          },
        },
      },
      title: {
        display: true,
        color: "#1a237e", // أزرق كحلي داكن للعناوين
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  const handleMouseMove = (chart, event) => {
    if (chart && chart.canvas) {
      const canvas = chart.canvas;
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const activePoints = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        true
      );

      if (activePoints.length > 0) {
        const point = activePoints[0];
        chart.tooltip.x = mouseX;
        chart.tooltip.y = mouseY;
        chart.tooltip.setActiveElements([point], { x: mouseX, y: mouseY });
        chart.update();
      }
    }
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
      const chart = new Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: [label],
          datasets: [
            {
              label: `عدد ${label}`,
              data: [data],
              backgroundColor: [backgroundColor],
              hoverBackgroundColor: [backgroundColor],
              borderRadius: 5,
            },
          ],
        },
        options: {
          ...chartOptions,
          onHover: (event, chart) => {
            handleMouseMove(chart, event);
          },
          plugins: {
            ...chartOptions.plugins,
            title: {
              ...chartOptions.plugins.title,
              text: `${label} :  ${displayData(data)}`,
            },
          },
        },
      });
      chartInstanceRef.current = chart;
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
      "#2196f3" // أزرق داكن للجلسات
    );
  }, [displaySessionsCount]);

  useEffect(() => {
    return createChart(
      casesChartRef,
      casesChartInstance,
      displayCases,
      "القضايا",
      "#4caf50" // أخضر للقضايا
    );
  }, [displayCases]);

  useEffect(() => {
    return createChart(
      clientsChartRef,
      clientsChartInstance,
      displayClientsCount,
      "العملاء",
      "#78909c" // رمادي للعملاء
    );
  }, [displayClientsCount]);
  useEffect(() => {
    return createChart(
      paidAmountChartRef,
      paidAmountChartInstance,
      displayPaidAmount,
      "المدفوع",
      "#2196f3" // أزرق داكن للمدفوع
    );
  }, [displayPaidAmount]);
  useEffect(() => {
    return createChart(
      contractsChartRef,
      contractsChartInstance,
      displayContractsCount,
      "العقود",
      "#4caf50" // أخضر للعقود
    );
  }, [displayContractsCount]);
  useEffect(() => {
    return createChart(
      expensesChartRef,
      expensesChartInstance,
      displayExpensesAmount,
      "المصروفات",
      "#78909c" // رمادي للمصروفات
    );
  }, [displayExpensesAmount]);

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f0f0f0" }}>
      {/* Row for welcome message */}
      <div className="row mb-4">
        <div className="col-12">
          <WelcomeMessage message="أهلاً ومرحباً بك في برنامج المحامي" />
        </div>
      </div>

      {/* Row for calendar and charts */}
      <div className="row">
        {/* Calendar Card */}
        <div className="col-lg-4 col-md-5 col-12 mb-3 d-flex align-items-center justify-content-center">
          <Suspense fallback={<div>جاري تحميل التقويم...</div>}>
            <Calendar />
          </Suspense>
        </div>

        {/* Charts Section */}
        <div className="col-lg-8 col-md-7 col-12">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div className="col">
              <Link to="/sessions" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={sessionsChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col">
              <Link to="/cases" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={casesChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col">
              <Link to="/customers" className="text-decoration-none">
                <div
                  className="chart-container"
                  style={{ backgroundColor: "white", borderRadius: "8px" }}
                >
                  <canvas ref={clientsChartRef}></canvas>
                </div>
              </Link>
            </div>
            <div className="col">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={paidAmountChartRef}></canvas>
              </div>
            </div>
            <div className="col">
              <div
                className="chart-container"
                style={{ backgroundColor: "white", borderRadius: "8px" }}
              >
                <canvas ref={contractsChartRef}></canvas>
              </div>
            </div>
            <div className="col-12">
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

      {/* Hot Links Section */}
      <div className="row mt-4">
        {/* Header for Hot Links */}
        <div className="col-12 text-end">
          <HotLinksTitle title="روابط سريعة" style={{ color: "#1a237e" }} />
        </div>

        {/* Hot Links */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div className="col">
            <HotLink
              title="الجلسات"
              icon="fa-solid fa-calendar-day"
              link="/sessions"
              style={{
                backgroundColor: "#64b5f6",
                color: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col">
            <HotLink
              title="القضايا"
              icon="fa-solid fa-folder-open"
              link="/cases"
              style={{
                backgroundColor: "#64b5f6",
                color: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col">
            <HotLink
              title="العملاء"
              icon="fa-solid fa-users"
              link="/customers"
              style={{
                backgroundColor: "#64b5f6",
                color: "#fff",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            />
          </div>
          <div className="col">
            <HotLink
              title="المصروفات"
              icon="fa-solid fa-credit-card"
              link="/expenses"
              style={{
                backgroundColor: "#64b5f6",
                color: "#fff",
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
