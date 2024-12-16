import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/Calendar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [showToast, setShowToast] = useState(false);

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
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error(
          "عذرًا! حدث خطأ أثناء تحميل بياناتك. يرجى المحاولة مرة أخرى.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          }
        );
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
      const buttonSizeClass = "col-6 col-md-auto p-1";

      return (
        <div key={index} className={buttonSizeClass}>
          {isSessionDay ? (
            <Link to="/sessions" className="w-100">
              <button
                className={`btn btn-primary btn-sm w-100 calendar-day-button text-white session-day`}
                data-bs-toggle="tooltip"
                title={tooltipText}
                style={{
                  backgroundColor: "red",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                {day.getDate()}
              </button>
            </Link>
          ) : (
            <button className="btn btn-outline-secondary btn-sm w-100 calendar-day-button">
              {day.getDate()}
            </button>
          )}
        </div>
      );
    });
  };

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
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

  const navButtonClass = "btn btn-outline-secondary btn-sm mx-1";
  const toastId = useRef(null);

  useEffect(() => {
    const checkSessionsAndShowToast = () => {
      if (viewMode === "month") {
        const daysInCurrentMonth = getDaysOfMonth(currentDate);
        let hasSessionsThisMonth = false;
        let sessionTitles = [];

        for (const day of daysInCurrentMonth) {
          const daySessions = getSessionsForDay(day);
          if (daySessions.length > 0) {
            hasSessionsThisMonth = true;
            sessionTitles = daySessions.map((session) => session.title);
            break;
          }
        }
        if (hasSessionsThisMonth) {
          if (!toastId.current || !toast.isActive(toastId.current)) {
            toastId.current = toast.warning(
              `🔔 لديك جلسات مهمة هذا الشهر: ${sessionTitles.join(", ")}`,
              {
                position: "top-right",
                autoClose: 15000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              }
            );
          }
        } else {
          toast.dismiss(toastId.current);
          toastId.current = null;
        }
      } else {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    };

    checkSessionsAndShowToast();

    const intervalId = setInterval(checkSessionsAndShowToast, 60000); // 1 minute = 60000 ms

    return () => {
      clearInterval(intervalId);
      toast.dismiss(toastId.current);
    };
  }, [sessions, currentDate, viewMode]);

  return (
    <div className="calendar-container p-3">
      <ToastContainer />
      <div className="d-flex justify-content-center mb-2">
        <button className="btn btn-primary btn-sm" onClick={toggleViewMode}>
          عرض {viewMode === "week" ? "الشهر" : "الأسبوع"}
        </button>
      </div>
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center nav-container">
          <div className="d-flex align-items-center">
            {/* Previous Year Button */}
            <button
              className={navButtonClass}
              onClick={() => changeYear(-1)}
              title="السنة السابقة"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
            {/* Previous Month or Week Button */}
            <button
              className={navButtonClass}
              onClick={() =>
                viewMode === "week" ? changeWeek(-1) : changeMonth(-1)
              }
              title="السابق"
            >
              <i className="fas fa-angle-right"></i>
            </button>
          </div>
          <div className="text-center">
            <h6 className="mx-2 mb-0 date-display">{displayDate}</h6>
          </div>
          <div className="d-flex align-items-center">
            {/* Next Month or Week Button */}
            <button
              className={navButtonClass}
              onClick={() =>
                viewMode === "week" ? changeWeek(1) : changeMonth(1)
              }
              title="التالي"
            >
              <i className="fas fa-angle-left"></i>
            </button>
            {/* Next Year Button */}
            <button
              className={navButtonClass}
              onClick={() => changeYear(1)}
              title="السنة التالية"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
          </div>
        </div>
      </div>
      <div className="row justify-content-center days-container">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
