import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const Calendar = () => {
  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;
    startOfWeek.setDate(diff);
    return startOfWeek;
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  const getMonthName = (monthIndex) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    return months[monthIndex];
  };

  function getStartOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getDaysOfMonth(date) {
    const startOfMonth = getStartOfMonth(date);
    const daysInMonth = getDaysInMonth(date);
    const days = [];
    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(startOfMonth);
      day.setDate(startOfMonth.getDate() + i);
      days.push(day);
    }
    return days;
  }

  const getDaysOfWeek = (startOfWeek) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const changeWeek = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentDate(newDate);
    setWeekStart(getStartOfWeek(newDate));
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const changeYear = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + offset);
    setCurrentDate(newDate);
  };

  const getSessionsForDay = (day) => {
    const selectedDate = `${day.getFullYear()}-${(day.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`;
    return sessions.filter((session) => session.date === selectedDate);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      Swal.fire({
        title: "جاري تحميل البيانات الخاصة بك...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSessions(response.data.sessions);
        Swal.close();
      } catch (error) {
        console.error("Error fetching sessions:", error);
        Swal.fire({
          icon: "error",
          title: "عذرًا!",
          text: "حدث خطأ أثناء تحميل بياناتك. يرجى المحاولة مرة أخرى.",
        });
      }
    };

    fetchSessions();
  }, []);

  const days =
    viewMode === "week"
      ? getDaysOfWeek(weekStart)
      : getDaysOfMonth(currentDate);

  const renderDays = () => {
    return days.map((day, index) => {
      const daySessions = getSessionsForDay(day);
      const isSessionDay = daySessions.length > 0;
      const tooltipText = daySessions
        .map((session) => session.title)
        .join(", ");

      // تحديد حجم الأزرار بناءً على الشاشة
      const buttonSizeClass = "col-6 col-md-auto";
      return (
        <div key={index} className={`${buttonSizeClass} text-center p-2`}>
          {isSessionDay ? (
            <Link to="/sessions">
              <button
                className={`btn btn-outline-primary btn-lg w-100 ${
                  isSessionDay ? "bg-danger text-white" : ""
                }`}
                data-toggle="tooltip"
                title={tooltipText}
              >
                {day.getDate()}
              </button>
            </Link>
          ) : (
            <button className="btn btn-outline-secondary btn-lg w-100">
              {day.getDate()}
            </button>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
    );
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, [sessions]);

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "week" ? "month" : "week"));
  };

  const displayDate =
    viewMode === "week"
      ? `${getMonthName(
          currentDate.getMonth()
        )} ${currentDate.getFullYear()} - الأسبوع من ${weekStart.getDate()}`
      : `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;

  const navButtonClass = "btn btn-outline-secondary btn-lg mx-2";

  return (
    <div className="container mt-5">
      <div className="row justify-content-center mb-4">
        <div className="col-12 d-flex justify-content-center mb-3">
          <button className="btn btn-primary" onClick={toggleViewMode}>
            عرض {viewMode === "week" ? "الشهر" : "الأسبوع"}
          </button>
        </div>
        <div className="col-auto d-flex align-items-center">
          {/* Previous Year Button */}
          <button className={navButtonClass} onClick={() => changeYear(-1)}>
            السنة السابقة
          </button>
          {/* Previous Month or Week Button */}
          <button
            className={navButtonClass}
            onClick={() =>
              viewMode === "week" ? changeWeek(-1) : changeMonth(-1)
            }
          >
            السابق
          </button>

          {/* Display Date */}
          <h4 className="mx-3 mb-0">{displayDate}</h4>

          {/* Next Month or Week Button */}
          <button
            className={navButtonClass}
            onClick={() =>
              viewMode === "week" ? changeWeek(1) : changeMonth(1)
            }
          >
            التالي
          </button>
          {/* Next Year Button */}
          <button className={navButtonClass} onClick={() => changeYear(1)}>
            السنة التالية
          </button>
        </div>
      </div>
      <div className="row justify-content-center" style={{ gap: "5px" }}>
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
